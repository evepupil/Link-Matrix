import express, { Request, Response } from 'express';
import { createApiResponse } from '@/utils/response';
import { WeixinService } from '../services/weixinService';

const router = express.Router();

// 查询符合条件的图片
router.post('/query-pics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { wx_name, tags, unsupport_tags, limit = 10, popularity = 0.15, autoDownload = false } = req.body;
    
    if (!wx_name || !tags || !Array.isArray(tags)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const pics = await WeixinService.queryPics(wx_name, tags, unsupport_tags, limit, popularity, autoDownload);
    res.status(200).json(createApiResponse(true, pics));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `查询图片失败: ${errorMessage}`));
  }
});

// 下载图片到云端
router.post('/download-pics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pids } = req.body;
    
    if (!pids || !Array.isArray(pids)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const result = await WeixinService.downloadPics(pids);
    res.status(200).json(createApiResponse(true, result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `下载图片失败: ${errorMessage}`));
  }
});

// 本地下载图片到tmp目录
router.post('/download-local', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pid } = req.body;
    
    if (!pid) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '缺少PID参数'));
      return;
    }

    const result = await WeixinService.downloadLocal(pid);
    res.status(200).json(createApiResponse(true, result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `本地下载失败: ${errorMessage}`));
  }
});

// 检查下载状态
router.post('/check-download-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pids } = req.body;
    
    if (!pids || !Array.isArray(pids)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const status = await WeixinService.checkDownloadStatus(pids);
    res.status(200).json(createApiResponse(true, status));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `查询下载状态失败: ${errorMessage}`));
  }
});

// 发布到微信公众号
router.post('/publish', async (req: Request, res: Response): Promise<void> => {
  try {
    const { account_id, pids, unfit_pids } = req.body;
    
    if (!account_id || !pids || !Array.isArray(pids)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const taskId = await WeixinService.publishToWeixin(account_id, pids, unfit_pids || []);
    res.status(200).json(createApiResponse(true, { task_id: taskId }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `发布失败: ${errorMessage}`));
  }
});

// 直接发布到微信公众号（不使用任务队列）
router.post('/publish-direct', async (req: Request, res: Response): Promise<void> => {
  try {
    const { account_id, pids, unfit_pids } = req.body;
    
    if (!account_id || !pids || !Array.isArray(pids)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const result = await WeixinService.publishToWeixinReal(account_id, pids, unfit_pids || []);
    res.status(200).json(createApiResponse(result.success, result.success ? { media_id: result.media_id } : undefined, undefined, result.error));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `发布失败: ${errorMessage}`));
  }
});

// 获取发布进度
router.get('/publish-progress/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '缺少任务ID'));
      return;
    }

    const progress = await WeixinService.getPublishProgress(taskId);
    res.status(200).json(createApiResponse(true, progress));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `获取发布进度失败: ${errorMessage}`));
  }
});

export default router; 