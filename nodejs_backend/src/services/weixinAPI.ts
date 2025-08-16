import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import supabase from '@/services/supabase';

export interface WeixinConfig {
  appid: string;
  secret: string;
  author: string;
  thumb_media_id: string;
}

export interface ArticleData {
  title: string;
  author: string;
  content: string;
  thumb_media_id: string;
  digest?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}

export class WeixinAPI {
  private grant_type = 'client_credential';
  private appid: string;
  private secret: string;
  private type = 'image';
  private token: string | null = null;
  private imageUrls: { [filename: string]: string } = {};

  constructor(appid: string, secret: string) {
    this.appid = appid;
    this.secret = secret;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${this.grant_type}&appid=${this.appid}&secret=${this.secret}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.access_token) {
        this.token = data.access_token;
        console.log('✅ 获取微信访问令牌成功');
        return data.access_token;
      } else {
        console.error('❌ 获取微信访问令牌失败:', data);
        return null;
      }
    } catch (error) {
      console.error('❌ 获取微信访问令牌异常:', error);
      return null;
    }
  }

  /**
   * 上传图片到微信素材库并返回PIDs
   */
  async addMediaAndReturnPids(imageDir: string): Promise<string[]> {
    try {
      if (!this.token) {
        await this.getAccessToken();
      }

      if (!this.token) {
        throw new Error('无法获取访问令牌');
      }

      const url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${this.token}`;
      const pids: string[] = [];
      this.imageUrls = {};

      // 获取目录下的所有图片文件
      const files = fs.readdirSync(imageDir).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      console.log(`📁 找到 ${files.length} 个图片文件，开始上传到微信素材库...`);

      for (const filename of files) {
        try {
          const filepath = path.join(imageDir, filename);
          
          // 创建表单数据
          const form = new FormData();
          form.append('media', fs.createReadStream(filepath), {
            filename: filename,
            contentType: this.getContentType(filename)
          });

          const response = await axios.post(url, form, {
            headers: {
              ...form.getHeaders(),
            },
            timeout: 30000 // 30秒超时
          });

          const data = response.data;
          
          if (data.url) {
            this.imageUrls[filename] = data.url;
            
            // 从文件名提取PID
            const pidMatch = filename.match(/pid_(\d+)/);
            if (pidMatch) {
              const pid = pidMatch[1];
              pids.push(pid);
              console.log(`✅ 上传图片 ${filename} 成功，PID: ${pid}`);
            }
          } else {
            console.error(`❌ 上传图片 ${filename} 失败:`, data);
          }
        } catch (error) {
          console.error(`❌ 上传图片 ${filename} 异常:`, error);
        }
      }

      console.log(`🎉 上传目录 ${imageDir} 中的图片到素材库完成，成功上传 ${pids.length} 张图片`);
      return pids;
    } catch (error) {
      console.error('❌ 批量上传图片失败:', error);
      return [];
    }
  }

  /**
   * 创建草稿文章
   */
  async addDraft(articleData: ArticleData): Promise<{ success: boolean; media_id?: string; error?: string }> {
    try {
      if (!this.token) {
        await this.getAccessToken();
      }

      if (!this.token) {
        throw new Error('无法获取访问令牌');
      }

      // 生成文章内容
      const content = this.generateArticleContent(articleData.content);

      const data = {
        articles: [
          {
            title: articleData.title,
            author: articleData.author,
            digest: articleData.digest || '喜欢的话就点个在看吧',
            content: content,
            thumb_media_id: articleData.thumb_media_id,
            need_open_comment: articleData.need_open_comment || 1,
            only_fans_can_comment: articleData.only_fans_can_comment || 1,
          }
        ]
      };

      const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${this.token}`;
      
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const result = response.data;
      
      if (result.media_id) {
        console.log(`✅ 文章《${articleData.title}》上传成功！media_id: ${result.media_id}`);
        return { success: true, media_id: result.media_id };
      } else {
        console.error(`❌ 上传文章《${articleData.title}》失败:`, result);
        return { success: false, error: JSON.stringify(result) };
      }
    } catch (error) {
      console.error('❌ 创建草稿文章异常:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * 生成文章HTML内容
   */
  private generateArticleContent(baseContent: string): string {
    const tplHtml = `<section powered-by="xiumi.us" style="margin-bottom: -15px;outline: 0px;letter-spacing: 0.578px;text-wrap: wrap;text-align: left;font-size: 16px;transform: translate3d(20px, 0px, 0px);visibility: visible;"><section style="outline: 0px;width: 55px;height: 40px;overflow: hidden;vertical-align: top;display: inline-block;visibility: visible;"><section powered-by="xiumi.us" style="outline: 0px;text-align: center;visibility: visible;"><section style="outline: 0px;line-height: 0;vertical-align: middle;display: inline-block;visibility: visible;"><img class="rich_pages wxw-img __bg_gif" data-ratio="0.696" data-src="https://mmbiz.qpic.cn/mmbiz_gif/4KUPNoc6oCKSbuOEtVDGrZ6MPH0488WgEq1EJTjBfDzaTc0zm6UL2DjGfvnBUfHxdyfAfdicUmREWtw1Mw2FEuA/640?wx_fmt=gif&amp;wxfrom=5&amp;wx_lazy=1" data-type="gif" data-w="500" style="outline: 0px;vertical-align: middle;visibility: visible !important;width: 500px !important;"></section></section></section></section><section powered-by="xiumi.us" style="margin-bottom: 0px;outline: 0px;letter-spacing: 0.578px;text-wrap: wrap;font-size: 16px;visibility: visible;"><p style="outline: 0px;text-align: center;visibility: visible;"><span style="outline: 0px;text-shadow: rgb(195, 134, 234) 2px 0px 7px;visibility: visible;"><strong style="outline: 0px;visibility: visible;">点击蓝字，关注我们<br style="outline: 0px;visibility: visible;"></strong></span></p></section><section powered-by="xiumi.us" style="margin-bottom: 10px;outline: 0px;letter-spacing: 0.578px;text-wrap: wrap;text-align: right;font-size: 16px;visibility: visible;"><section style="outline: 0px;width: 231.2px;vertical-align: middle;display: inline-block;visibility: visible;"><section powered-by="xiumi.us" style="outline: 0px;text-align: center;visibility: visible;"><section style="outline: 0px;width: 231.2px;line-height: 0;vertical-align: middle;display: inline-block;visibility: visible;"><img class="rich_pages wxw-img __bg_gif" data-ratio="0.21069182389937108" data-src="https://mmbiz.qpic.cn/mmbiz_gif/g2BOPIGInUvRuWeXjAz5j3sjia2Wpk7eaFzBthQQAAxemLeQuBc62CbeLpAgRzjP5OeSdkibZBqU6ezMadp6a1bw/640?wx_fmt=gif&amp;wxfrom=5&amp;wx_lazy=1" data-type="gif" data-w="636" style="outline: 0px;vertical-align: middle;visibility: visible !important;width: 231.2px !important;" width="100%" data-imgqrcoded="1"></section></section></section><section style="outline: 0px;width: 144.5px;vertical-align: middle;display: inline-block;visibility: visible;"><section powered-by="xiumi.us" style="margin-top: 0.5em;margin-bottom: 0.5em;outline: 0px;visibility: visible;"><section style="outline: 0px;height: 1px;line-height: 0;background-color: rgb(29, 29, 29);visibility: visible;"><br style="outline: 0px;font-family: system-ui, -apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif;letter-spacing: 0.578px;visibility: visible;"></section></section></section></section><p><br></p><p style="text-align: center;"></p><section powered-by="xiumi.us" style="margin-bottom: 0px;outline: 0px;letter-spacing: 0.578px;text-wrap: wrap;font-size: 14px;visibility: visible;"><section powered-by="xiumi.us" style="outline: 0px;visibility: visible;"><section style="margin-top: 24px;margin-bottom: 24px;outline: 0px;text-align: center;line-height: 2em;"><span style="outline: 0px;color: rgb(136, 136, 136);font-size: 12px;letter-spacing: 0.578px;">图片源自网络，侵立删。</span></section><p style="outline: 0px;text-align: right;"><strong style="outline: 0px;">觉得内容还不错的话，给我点个"在看"呗<br style="outline: 0px;"></strong></p><p style="outline: 0px;text-align: right;"><strong style="outline: 0px;"><strong style="outline: 0px;color: rgb(0, 0, 0);letter-spacing: 0.578px;"><span style="outline: 0px;letter-spacing: 0.578px;text-align: center;"></span></strong></strong><br style="outline: 0px;"></p></section><section powered-by="xiumi.us" style="margin-bottom: -10px;outline: 0px;text-align: right;font-size: 16px;"><section style="outline: 0px;width: 144.5px;vertical-align: middle;display: inline-block;"><section powered-by="xiumi.us" style="outline: 0px;text-align: center;"><section style="outline: 0px;width: 144.5px;line-height: 0;vertical-align: middle;display: inline-block;"><img class="rich_pages wxw-img __bg_gif" data-ratio="0.21069182389937108" data-src="https://mmbiz.qpic.cn/mmbiz_gif/g2BOPIGInUvRuWeXjAz5j3sjia2Wpk7eaFzBthQQAAxemLeQuBc62CbeLpAgRzjP5OeSdkibZBqU6ezMadp6a1bw/640?wx_fmt=gif&amp;wxfrom=5&amp;wx_lazy=1" data-type="gif" data-w="636" style="outline: 0px;vertical-align: middle;width: 144.5px !important;visibility: visible !important;" width="100%" data-imgqrcoded="1"></section></section></section><section style="outline: 0px;width: 144.5px;vertical-align: middle;display: inline-block;"><section powered-by="xiumi.us" style="margin-top: 0.5em;margin-bottom: 0.5em;outline: 0px;"><section style="outline: 0px;height: 1px;line-height: 0;background-color: rgb(29, 29, 29);"><br style="outline: 0px;"></section></section></section></section><section powered-by="xiumi.us" style="outline: 0px;text-align: right;font-size: 16px;"><section style="outline: 0px;width: 30px;height: 25px;overflow: hidden;vertical-align: top;display: inline-block;"><section powered-by="xiumi.us" style="outline: 0px;text-align: center;"><section style="outline: 0px;line-height: 0;vertical-align: middle;display: inline-block;"><img class="rich_pages wxw-img __bg_gif" data-ratio="0.696" data-src="https://mmbiz.qpic.cn/mmbiz_gif/4KUPNoc6oCKSbuOEtVDGrZ6MPH0488WgEq1EJTjBfDzaTc0zm6UL2DjGfvnBUfHxdyfAfdicUmREWtw1Mw2FEuA/640?wx_fmt=gif&amp;wxfrom=5&amp;wx_lazy=1" data-type="gif" data-w="500" style="outline: 0px;vertical-align: middle;width: 500px !important;visibility: visible !important;"></section></section></section></section></section><p style="outline: 0px;"><br style="outline: 0px;font-family: system-ui, -apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif;letter-spacing: 0.544px;text-wrap: wrap;background-color: rgb(255, 255, 255);"></p><p><br></p><p style="display: none;"><mp-style-type data-value="3"></mp-style-type></p>`;

    // 生成图片HTML
    let imgHtml = '';
    for (const [filename, url] of Object.entries(this.imageUrls)) {
      const dotIndex = filename.lastIndexOf('.');
      const imgName = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename;
      
      imgHtml += `<img class="rich_pages wxw-img" data-galleryid="" data-imgfileid="100003080" data-ratio="1.3508333333333333" data-s="300,640" data-src="${url}" data-type="jpeg" data-w="1200" style=""></p><p style="text-align: center;"><span style="outline: 0px;color: rgb(136, 136, 136);font-size: 12px;letter-spacing: 0.578px;">${imgName}<br  /></span></p><p style="text-align: center;">`;
    }

    // 在指定位置插入图片HTML
    return this.insertStrBehind(tplHtml, '<p style="text-align: center;">', imgHtml);
  }

  /**
   * 在指定字符串后插入内容
   */
  private insertStrBehind(originalString: string, searchString: string, insertString: string): string {
    const index = originalString.indexOf(searchString);
    
    if (index !== -1) {
      return originalString.substring(0, index + searchString.length) + 
             insertString + 
             originalString.substring(index + searchString.length);
    } else {
      console.warn('未找到指定的插入位置');
      return originalString;
    }
  }

  /**
   * 根据文件扩展名获取Content-Type
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    return contentTypeMap[ext] || 'image/jpeg';
  }

  /**
   * 获取素材库媒体ID（调试用）
   */
  async getMediaId(): Promise<void> {
    try {
      if (!this.token) {
        await this.getAccessToken();
      }

      const url = `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${this.token}`;
      
      const postData = {
        type: 'image',
        offset: 0,
        count: 1
      };

      const response = await axios.post(url, postData);
      console.log('素材库信息:', response.data);
    } catch (error) {
      console.error('获取素材库信息失败:', error);
    }
  }
}