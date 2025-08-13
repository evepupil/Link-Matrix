import supabase from '@/services/supabase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// 任务状态存储（实际项目中应该使用Redis或数据库）
const taskProgress = new Map<string, { progress: number; status: string; result?: any }>();

export class WeixinService {
  /**
   * 查询符合条件的图片
   * 参考Python代码的SQL查询逻辑
   */
  static async queryPics(wx_name: string, tags: string[], unsupport_tags: string[], limit: number = 10) {
    try {
      console.log(`🔍 开始查询图片，公众号: ${wx_name}`);
      console.log(`🏷️ 支持标签: ${tags.join(', ')}`);
      console.log(`❌ 不支持标签: ${unsupport_tags.join(', ')}`);

      // 构建查询条件
      let query = supabase
        .from('pic')
        .select('pid, image_url, tag')
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

      // 添加unfit过滤条件
      query = query.not('unfit', 'eq', true);

      const { data, error } = await query;

      if (error) {
        console.error('❌ 查询图片失败:', error);
        throw new Error(`数据库查询失败: ${error.message}`);
      }

      console.log(`✅ 查询成功，找到 ${data?.length || 0} 张图片`);
      return data || [];
    } catch (error) {
      console.error('❌ 查询图片服务失败:', error);
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
    // 模拟下载过程
    const fileName = `pic_${pid}.jpg`;
    const filePath = path.join(tmpDir, fileName);
    
    // 这里应该实现真实的图片下载逻辑
    // 目前只是创建空文件作为示例
    fs.writeFileSync(filePath, '');
    
    console.log(`📥 图片 ${pid} 下载完成: ${filePath}`);
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
   * 执行发布任务
   */
  private static async executePublishTask(taskId: string, account_id: number, pids: number[], unfit_pids: number[]) {
    try {
      console.log(`📤 开始发布任务 ${taskId}`);
      console.log(`📊 发布账户: ${account_id}`);
      console.log(`🖼️ 发布图片: ${pids.length} 张`);
      console.log(`❌ 不合格图片: ${unfit_pids.length} 张`);

      // 更新数据库中图片的使用状态
      await this.updatePicUsageStatus(pids, unfit_pids);

      const totalSteps = 3; // 模拟发布步骤
      let currentStep = 0;

      // 步骤1: 准备发布内容
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      taskProgress.set(taskId, { progress, status: 'publishing' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 步骤2: 上传到微信公众号
      currentStep++;
      const progress2 = Math.round((currentStep / totalSteps) * 100);
      taskProgress.set(taskId, { progress: progress2, status: 'publishing' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 步骤3: 发布完成
      currentStep++;
      taskProgress.set(taskId, { 
        progress: 100, 
        status: 'completed',
        result: { 
          published_count: pids.length - unfit_pids.length,
          unfit_count: unfit_pids.length,
          account_id 
        }
      });

      console.log(`✅ 发布任务 ${taskId} 完成`);
    } catch (error) {
      console.error(`❌ 发布任务 ${taskId} 失败:`, error);
      taskProgress.set(taskId, { progress: 0, status: 'failed' });
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
} 