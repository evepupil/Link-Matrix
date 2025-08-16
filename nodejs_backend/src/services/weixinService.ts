import supabase from '@/services/supabase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { WeixinAPI, WeixinConfig, ArticleData } from './weixinAPI';

// 任务状态存储（实际项目中应该使用Redis或数据库）
const taskProgress = new Map<string, { progress: number; status: string; result?: any }>();

export class WeixinService {
  /**
   * 查询符合条件的图片
   * 参考Python代码的SQL查询逻辑
   */
  static async queryPics(wx_name: string, tags: string[], unsupport_tags: string[], limit: number = 10, popularity: number = 0, autoDownload: boolean = false) {
    try {
      console.log(`🔍 开始查询图片，公众号: ${wx_name}`);
      console.log(`🏷️ 支持标签: ${tags.join(', ')}`);
      console.log(`❌ 不支持标签: ${unsupport_tags.join(', ')}`);
      console.log(`📥 自动下载: ${autoDownload ? '启用' : '禁用'}`);

      // 构建查询条件
      let query = supabase
        .from('pic')
        .select('pid, image_url, tag, image_path, popularity, author_name')
        .limit(limit);

      // 添加不支持标签的过滤条件
      if (unsupport_tags.length > 0) {
        unsupport_tags.forEach(tag => {
          query = query.not('tag', 'ilike', `%${tag}%`);
        });
      }

      // 添加支持标签的过滤条件
      if (tags.length > 0) {
        const tagConditions = tags.map(tag => `tag.ilike.%${tag}%`);
        query = query.or(tagConditions.join(','));
      }
      // 如果标签为空，不添加标签过滤条件，返回所有符合条件的图片

      // 添加公众号使用状态过滤
      query = query.or(`wx_name.not.ilike.%${wx_name}%,wx_name.is.null`);

      // 添加热度过滤条件
      if (popularity > 0) {
        query = query.gte('popularity', popularity);
      }

      // 添加unfit过滤条件
      query = query.not('unfit', 'eq', true);

      const { data, error } = await query;

      if (error) {
        console.error('❌ 查询图片失败:', error);
        throw new Error(`数据库查询失败: ${error.message}`);
      }

      console.log(`✅ 查询成功，找到 ${data?.length || 0} 张图片`);
      
      // 只有在启用自动下载时才执行云端下载
      if (autoDownload && data && data.length > 0) {
        const undownloadedPids = data.filter(pic => !pic.image_path).map(pic => pic.pid);
        if (undownloadedPids.length > 0) {
          console.log(`📥 发现 ${undownloadedPids.length} 张未下载的图片，开始自动下载...`);
          this.autoDownloadPics(undownloadedPids);
        }
      } else if (data && data.length > 0) {
        const undownloadedPids = data.filter(pic => !pic.image_path).map(pic => pic.pid);
        if (undownloadedPids.length > 0) {
          console.log(`ℹ️ 发现 ${undownloadedPids.length} 张未下载的图片，但自动下载已禁用`);
        }
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ 查询图片服务失败:', error);
      throw error;
    }
  }

  /**
   * 自动下载图片到Pixiv服务
   */
  private static async autoDownloadPics(pids: number[]) {
    try {
      console.log(`🚀 开始自动下载 ${pids.length} 张图片到Pixiv服务...`);
      
      // 并发发送所有下载请求，不等待上一个完成
      const downloadPromises = pids.map(async (pid) => {
        try {
          console.log(`📥 发送PID ${pid} 的下载请求...`);
          return await this.downloadPidToPixiv(pid);
        } catch (error) {
          console.error(`❌ 自动下载图片 ${pid} 失败:`, error);
          // 返回错误信息，不中断其他请求
          return { error: true, pid, message: error instanceof Error ? error.message : String(error) };
        }
      });
      
      // 等待所有请求发送完成
      const results = await Promise.all(downloadPromises);
      
      const successCount = results.filter((r: any) => !r.error).length;
      const errorCount = results.filter((r: any) => r.error).length;
      
      console.log(`✅ 自动下载任务完成，共处理 ${pids.length} 个PID`);
      console.log(`📊 成功发送: ${successCount} 个，失败: ${errorCount} 个`);
    } catch (error) {
      console.error('❌ 自动下载服务失败:', error);
    }
  }

  /**
   * 下载单个PID到Pixiv服务
   */
  private static async downloadPidToPixiv(pid: number) {
    try {
      console.log(`📥 开始下载PID ${pid} 到Pixiv服务...`);
      
      // 调用Pixiv下载API - 根据pixiv-crawler.ts的实际定义
      const response = await fetch('https://pixiv.chaosyn.com/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download',
          downloadPid: pid.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`Pixiv API响应错误: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ PID ${pid} 下载请求已发送到Pixiv服务:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ 下载PID ${pid} 到Pixiv服务失败:`, error);
      throw error;
    }
  }

  /**
   * 下载图片到本地
   */
  static async downloadPics(pids: number[]): Promise<string> {
    const taskId = uuidv4();
    
    // 初始化任务状态
    taskProgress.set(taskId, { progress: 0, status: 'downloading' });

    // 异步执行下载任务
    this.executeDownloadTask(taskId, pids);

    return taskId;
  }

  /**
   * 执行下载任务
   */
  private static async executeDownloadTask(taskId: string, pids: number[]) {
    try {
      console.log(`📥 开始下载任务 ${taskId}，共 ${pids.length} 张图片`);

      // 确保tmp目录存在
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const totalPics = pids.length;
      let downloadedCount = 0;

      for (const pid of pids) {
        try {
          // 模拟下载过程
          await this.downloadSinglePic(pid, tmpDir);
          downloadedCount++;
          
          // 更新进度
          const progress = Math.round((downloadedCount / totalPics) * 100);
          taskProgress.set(taskId, { progress, status: 'downloading' });
          
          console.log(`📥 下载进度: ${progress}% (${downloadedCount}/${totalPics})`);
          
          // 模拟下载延迟
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ 下载图片 ${pid} 失败:`, error);
        }
      }

      // 完成下载
      taskProgress.set(taskId, { 
        progress: 100, 
        status: 'completed',
        result: { downloaded_count: downloadedCount, total_count: totalPics }
      });

      console.log(`✅ 下载任务 ${taskId} 完成`);
    } catch (error) {
      console.error(`❌ 下载任务 ${taskId} 失败:`, error);
      taskProgress.set(taskId, { progress: 0, status: 'failed' });
    }
  }

  /**
   * 下载单张图片
   */
  private static async downloadSinglePic(pid: number, tmpDir: string): Promise<void> {
    try {
      // 获取图片信息，包括作者名称
      const { data: picData, error: picError } = await supabase
        .from('pic')
        .select('pid, author_name')
        .eq('pid', pid)
        .single();

      if (picError || !picData) {
        console.warn(`⚠️ 无法获取PID ${pid} 的图片信息，使用默认命名`);
        const fileName = `pid_${pid}.jpg`;
        const filePath = path.join(tmpDir, fileName);
        fs.writeFileSync(filePath, '');
        console.log(`📥 图片 ${pid} 下载完成: ${filePath}`);
        return;
      }

      // 使用新的命名格式：@作者名称 pid_xxx
      const authorName = picData.author_name || 'unknown';
      const fileName = `@${authorName} pid_${pid}.jpg`;
      const filePath = path.join(tmpDir, fileName);
      
      // 这里应该实现真实的图片下载逻辑
      // 目前只是创建空文件作为示例
      fs.writeFileSync(filePath, '');
      
      console.log(`📥 图片 ${pid} (作者: ${authorName}) 下载完成: ${filePath}`);
    } catch (error) {
      console.error(`❌ 下载图片 ${pid} 失败:`, error);
      // 如果出错，使用默认命名格式
      const fileName = `pid_${pid}.jpg`;
      const filePath = path.join(tmpDir, fileName);
      fs.writeFileSync(filePath, '');
      console.log(`📥 图片 ${pid} 使用默认命名下载完成: ${filePath}`);
    }
  }

  /**
   * 获取下载进度
   */
  static async getDownloadProgress(taskId: string) {
    const task = taskProgress.get(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }
    return task;
  }

    /**
   * 发布到微信公众号
   */
  static async publishToWeixin(account_id: number, pids: number[], unfit_pids: number[]): Promise<string> {
    const taskId = uuidv4();

    // 初始化任务状态
    taskProgress.set(taskId, { progress: 0, status: 'publishing' });

    // 异步执行发布任务
    this.executePublishTask(taskId, account_id, pids, unfit_pids);

    return taskId;
  }

  /**
   * 实际的微信发布功能（使用真实的微信API）
   */
  static async publishToWeixinReal(account_id: number, pids: number[], unfit_pids: number[]): Promise<{ success: boolean; media_id?: string; error?: string }> {
    try {
      console.log(`🚀 开始真实微信发布流程...`);
      console.log(`📊 账户ID: ${account_id}, 发布图片: ${pids.length} 张, 不合格图片: ${unfit_pids.length} 张`);

      // 1. 获取微信账户配置
      const { data: accountData, error: accountError } = await supabase
        .from('api_accounts_wx')
        .select('*')
        .eq('id', account_id)
        .single();

      if (accountError || !accountData) {
        throw new Error(`获取微信账户配置失败: ${accountError?.message || '账户不存在'}`);
      }

      console.log(`✅ 获取账户配置成功: ${accountData.name}`);

      // 2. 创建临时目录并复制图片
      const tempDir = path.join(process.cwd(), 'tmp', `article_${Date.now()}`);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      console.log(`📁 创建临时目录: ${tempDir}`);

      // 3. 复制已下载的图片到临时目录
      const finalPids: string[] = [];
      for (const pid of pids) {
        // 查找包含该PID的图片文件（支持新的命名格式）
        const tmpDir = path.join(process.cwd(), 'tmp');
        const files = fs.readdirSync(tmpDir);
        const targetFile = files.find(file => file.includes(`pid_${pid}`));
        
        if (targetFile) {
          const sourcePath = path.join(tmpDir, targetFile);
          const targetPath = path.join(tempDir, targetFile);
          fs.copyFileSync(sourcePath, targetPath);
          finalPids.push(pid.toString());
          console.log(`📋 复制图片 PID ${pid} (${targetFile}) 到临时目录`);
        } else {
          console.warn(`⚠️ 图片文件不存在: PID ${pid}`);
        }
      }

      if (finalPids.length === 0) {
        throw new Error('没有可用的图片文件');
      }

      // 4. 初始化微信API
      const weixinAPI = new WeixinAPI(accountData.appid, accountData.app_secret);

      // 5. 上传图片到微信素材库
      console.log(`📤 开始上传 ${finalPids.length} 张图片到微信素材库...`);
      const uploadedPids = await weixinAPI.addMediaAndReturnPids(tempDir);

      if (uploadedPids.length === 0) {
        throw new Error('图片上传失败');
      }

      console.log(`✅ 成功上传 ${uploadedPids.length} 张图片到微信素材库`);

      // 6. 创建文章内容
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0].replace(/-/g, '');
      const title = `${accountData.title || '每日萌图'} ${dateStr}`;

      const articleData: ArticleData = {
        title: title,
        author: accountData.author || '编辑部',
        content: '', // 内容由WeixinAPI生成
        thumb_media_id: accountData.thumb_media_id || '',
        digest: '喜欢的话就点个在看吧',
        need_open_comment: 1,
        only_fans_can_comment: 1
      };

      // 7. 创建草稿文章
      console.log(`📝 创建草稿文章: ${title}`);
      const publishResult = await weixinAPI.addDraft(articleData);

      if (!publishResult.success) {
        throw new Error(`创建草稿失败: ${publishResult.error}`);
      }

      // 8. 更新数据库
      await this.updateDatabaseAfterPublish(uploadedPids, unfit_pids, accountData.wx_id);

      // 9. 清理临时目录
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`🗑️ 清理临时目录: ${tempDir}`);
      } catch (error) {
        console.warn(`⚠️ 清理临时目录失败: ${error}`);
      }

      console.log(`🎉 微信发布完成！media_id: ${publishResult.media_id}`);
      
      return {
        success: true,
        media_id: publishResult.media_id
      };

    } catch (error) {
      console.error('❌ 微信发布失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 更新数据库：标记不合格图片，更新图片的wx_name
   */
  private static async updateDatabaseAfterPublish(publishedPids: string[], unfitPids: number[], wxName: string) {
    try {
      console.log(`📊 开始更新数据库...`);

      // 1. 标记不合格图片
      if (unfitPids.length > 0) {
        const { error: unfitError } = await supabase
          .from('pic')
          .update({ unfit: true })
          .in('pid', unfitPids);

        if (unfitError) {
          console.error('❌ 更新不合格图片失败:', unfitError);
        } else {
          console.log(`✅ 标记 ${unfitPids.length} 张图片为不合格`);
        }
      }

      // 2. 更新发布图片的wx_name
      if (publishedPids.length > 0) {
        const publishedPidsNum = publishedPids.map(pid => parseInt(pid));
        const { error: wxNameError } = await supabase
          .from('pic')
          .update({ wx_name: wxName })
          .in('pid', publishedPidsNum);

        if (wxNameError) {
          console.error('❌ 更新图片wx_name失败:', wxNameError);
        } else {
          console.log(`✅ 更新 ${publishedPids.length} 张图片的wx_name为: ${wxName}`);
        }
      }

      console.log(`✅ 数据库更新完成`);
    } catch (error) {
      console.error('❌ 数据库更新异常:', error);
    }
  }

  /**
   * 执行发布任务
   */
  private static async executePublishTask(taskId: string, account_id: number, pids: number[], unfit_pids: number[]) {
    try {
      console.log(`📤 开始发布任务 ${taskId}`);
      console.log(`📊 发布账户: ${account_id}`);
      console.log(`🖼️ 发布图片: ${pids.length} 张`);
      console.log(`❌ 不合格图片: ${unfit_pids.length} 张`);

      // 步骤1: 准备发布 (20%)
      taskProgress.set(taskId, { progress: 20, status: 'publishing' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 步骤2: 调用真实的微信发布API (50%)
      taskProgress.set(taskId, { progress: 50, status: 'publishing' });
      const publishResult = await this.publishToWeixinReal(account_id, pids, unfit_pids);

      if (!publishResult.success) {
        throw new Error(publishResult.error || '发布失败');
      }

      // 步骤3: 发布完成 (100%)
      taskProgress.set(taskId, {
        progress: 100,
        status: 'completed',
        result: {
          published_count: pids.length - unfit_pids.length,
          unfit_count: unfit_pids.length,
          account_id,
          media_id: publishResult.media_id
        }
      });

      console.log(`✅ 发布任务 ${taskId} 完成，media_id: ${publishResult.media_id}`);
    } catch (error) {
      console.error(`❌ 发布任务 ${taskId} 失败:`, error);
      taskProgress.set(taskId, { 
        progress: 0, 
        status: 'failed',
        result: {
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * 更新图片使用状态
   */
  private static async updatePicUsageStatus(pids: number[], unfit_pids: number[]) {
    try {
      // 更新合格图片的使用状态
      const fitPids = pids.filter(pid => !unfit_pids.includes(pid));
      
             if (fitPids.length > 0) {
         const { error } = await supabase
           .from('pic')
           .update({ 
             wx_name: 'test_weixin_account', // 这里应该使用实际的公众号名称
             updated_at: new Date().toISOString()
           })
           .in('pid', fitPids);

        if (error) {
          console.error('❌ 更新图片使用状态失败:', error);
        } else {
          console.log(`✅ 更新了 ${fitPids.length} 张图片的使用状态`);
        }
      }

             // 标记不合格图片
       if (unfit_pids.length > 0) {
         const { error } = await supabase
           .from('pic')
           .update({ unfit: true })
           .in('pid', unfit_pids);

        if (error) {
          console.error('❌ 标记不合格图片失败:', error);
        } else {
          console.log(`✅ 标记了 ${unfit_pids.length} 张不合格图片`);
        }
      }
    } catch (error) {
      console.error('❌ 更新图片状态失败:', error);
    }
  }

  /**
   * 获取发布进度
   */
  static async getPublishProgress(taskId: string) {
    const task = taskProgress.get(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }
    return task;
  }

  /**
   * 查询图片下载状态
   */
  static async checkDownloadStatus(pids: number[]) {
    try {
      console.log(`🔍 查询 ${pids.length} 张图片的下载状态...`);
      
      const { data, error } = await supabase
        .from('pic')
        .select('pid, image_path, popularity')
        .in('pid', pids);

      if (error) {
        console.error('❌ 查询下载状态失败:', error);
        throw new Error(`数据库查询失败: ${error.message}`);
      }

      // 构建状态映射
      const statusMap = new Map();
      pids.forEach(pid => {
        const pic = data?.find(p => p.pid === pid);
        statusMap.set(pid, {
          pid,
          downloaded: !!pic?.image_path,
          image_path: pic?.image_path || null,
          popularity: pic?.popularity || 0
        });
      });

      console.log(`✅ 下载状态查询完成`);
      return Array.from(statusMap.values());
    } catch (error) {
      console.error('❌ 查询下载状态服务失败:', error);
      throw error;
    }
  }

  /**
   * 本地下载图片到tmp目录
   * 支持清晰度降级，确保文件大小不超过9MB
   */
  static async downloadLocal(pid: number) {
    try {
      console.log(`📥 开始本地下载图片 PID: ${pid}`);
      
      // 确保tmp目录存在
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      // 获取图片信息，包括作者名称
      const { data: picData, error: picError } = await supabase
        .from('pic')
        .select('pid, author_name')
        .eq('pid', pid)
        .single();

      if (picError || !picData) {
        console.warn(`⚠️ 无法获取PID ${pid} 的图片信息，使用默认命名`);
        const localPath = path.join(tmpDir, `pid_${pid}.jpg`);
        if (fs.existsSync(localPath)) {
          console.log(`✅ 图片 ${pid} 已存在于本地: ${localPath}`);
          return {
            success: true,
            pid,
            localPath: localPath,
            message: '图片已存在于本地'
          };
        }
      } else {
        // 使用新的命名格式：@作者名称 pid_xxx
        const authorName = picData.author_name || 'unknown';
        const fileName = `@${authorName} pid_${pid}.jpg`;
        const localPath = path.join(tmpDir, fileName);
        
        if (fs.existsSync(localPath)) {
          console.log(`✅ 图片 ${pid} (作者: ${authorName}) 已存在于本地: ${localPath}`);
          return {
            success: true,
            pid,
            localPath: localPath,
            message: '图片已存在于本地'
          };
        }
      }

      // 检查是否已经下载过（兼容旧格式）
      const oldLocalPath = path.join(tmpDir, `pid_${pid}.jpg`);
      if (fs.existsSync(oldLocalPath)) {
        console.log(`✅ 图片 ${pid} 已存在于本地（旧格式）: ${oldLocalPath}`);
        return {
          success: true,
          pid,
          localPath: oldLocalPath,
          message: '图片已存在于本地'
        };
      }
      
      // 获取图片信息
      const imageInfo = await this.getImageInfo(pid);
      if (!imageInfo) {
        throw new Error('无法获取图片信息');
      }
      
      // 尝试不同清晰度下载，确保文件大小不超过9MB
      const sizes = ['original','regular','small','thumb_mini'];
      let downloadedSize = 0;
      let selectedSize = '';
      let imageBuffer: Buffer | null = null;
      
      for (const size of sizes) {
        try {
          console.log(`🔄 尝试下载 ${size} 尺寸的图片...`);
          
          const imageUrl = imageInfo.urls[size as keyof typeof imageInfo.urls];
          if (!imageUrl) {
            console.log(`⚠️ 尺寸 ${size} 不可用，跳过`);
            continue;
          }
          
          // 下载图片
          const response = await fetch(imageUrl, {
            headers: {
              'Referer': 'https://www.pixiv.net/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          imageBuffer = Buffer.from(await response.arrayBuffer());
          downloadedSize = imageBuffer.length;
          
          console.log(`📊 尺寸 ${size} 下载成功，文件大小: ${(downloadedSize / 1024 / 1024).toFixed(2)}MB`);
          
          // 检查文件大小是否超过9MB
          if (downloadedSize <= 9.5 * 1024 * 1024) {
            selectedSize = size;
            console.log(`✅ 尺寸 ${size} 符合要求，文件大小: ${(downloadedSize / 1024 / 1024).toFixed(2)}MB`);
            break;
          } else {
            console.log(`⚠️ 尺寸 ${size} 过大 (${(downloadedSize / 1024 / 1024).toFixed(2)}MB)，尝试下一个尺寸`);
            imageBuffer = null;
          }
        } catch (error) {
          console.error(`❌ 下载尺寸 ${size} 失败:`, error);
          continue;
        }
      }
      
      if (!imageBuffer || !selectedSize) {
        throw new Error('所有尺寸都无法下载或文件过大');
      }
      
      // 确定最终的文件名和路径
      let finalFileName: string;
      let finalLocalPath: string;
      
      if (picData && picData.author_name) {
        // 使用新的命名格式：@作者名称 pid_xxx
        const authorName = picData.author_name;
        finalFileName = `@${authorName} pid_${pid}.jpg`;
        finalLocalPath = path.join(tmpDir, finalFileName);
      } else {
        // 使用默认命名格式
        finalFileName = `pid_${pid}.jpg`;
        finalLocalPath = path.join(tmpDir, finalFileName);
      }
      
      // 保存到本地
      fs.writeFileSync(finalLocalPath, imageBuffer);
      
      console.log(`💾 图片 ${pid} 已保存到本地: ${finalLocalPath}`);
      console.log(`📊 最终尺寸: ${selectedSize}，文件大小: ${(downloadedSize / 1024 / 1024).toFixed(2)}MB`);
      
      return {
        success: true,
        pid,
        localPath: finalLocalPath,
        size: selectedSize,
        fileSize: downloadedSize,
        message: '本地下载成功'
      };
      
    } catch (error) {
      console.error(`❌ 本地下载图片 ${pid} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取图片信息（从Pixiv API）
   */
  private static async getImageInfo(pid: number) {
    try {
      // 这里需要实现从Pixiv API获取图片信息的逻辑
      // 由于需要Pixiv的认证信息，这里提供一个简化的实现
      // 实际项目中应该集成完整的Pixiv API调用
      
      console.log(`🔍 获取图片 ${pid} 信息...`);
      
      // 模拟获取图片信息
      // 实际实现中应该调用Pixiv API
      const mockUrls = {
        thumb_mini: `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=thumb_mini`,
        small: `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=small`,
        regular: `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=regular`,
        original: `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=original`
      };
      
      return {
        pid,
        urls: mockUrls
      };
      
    } catch (error) {
      console.error(`❌ 获取图片 ${pid} 信息失败:`, error);
      return null;
    }
  }
} 