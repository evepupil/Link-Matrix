import express, { Request, Response } from 'express';
import { createApiResponse } from '@/utils/response';
import { WeixinService } from '../services/weixinService';

const router = express.Router();

/**
 * 查询符合条件的图片
 * POST /api/v1/weixin/query-pics
 */
router.post('/query-pics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { wx_name, tags, unsupport_tags, limit = 10, popularity = 0.15 } = req.body;

    // 验证参数
    if (!wx_name || !tags || !Array.isArray(tags) || !Array.isArray(unsupport_tags)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const pics = await WeixinService.queryPics(wx_name, tags, unsupport_tags, limit, popularity);
    res.status(200).json(createApiResponse(true, pics));
  } catch (error) {
    console.error('查询图片失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `查询图片失败: ${errorMessage}`));
  }
});

/**
 * 下载图片
 * POST /api/v1/weixin/download-pics
 */
router.post('/download-pics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pids } = req.body;

    if (!pids || !Array.isArray(pids)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, '参数错误'));
      return;
    }

    const taskId = await WeixinService.downloadPics(pids);
    res.status(200).json(createApiResponse(true, { task_id: taskId }));
  } catch (error) {
    console.error('下载图片失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `下载图片失败: ${errorMessage}`));
  }
});

/**
 * 获取下载进度
 * GET /api/v1/weixin/download-progress/:taskId
 */
router.get('/download-progress/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const progress = await WeixinService.getDownloadProgress(taskId);
    res.status(200).json(createApiResponse(true, progress));
  } catch (error) {
    console.error('获取下载进度失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `获取下载进度失败: ${errorMessage}`));
  }
});

/**
 * 发布到微信公众号
 * POST /api/v1/weixin/publish
 */
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
    console.error('发布失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `发布失败: ${errorMessage}`));
  }
});

/**
 * 获取发布进度
 * GET /api/v1/weixin/publish-progress/:taskId
 */
router.get('/publish-progress/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const progress = await WeixinService.getPublishProgress(taskId);
    res.status(200).json(createApiResponse(true, progress));
  } catch (error) {
    console.error('获取发布进度失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `获取发布进度失败: ${errorMessage}`));
  }
});

/**
 * 查询图片下载状态
 * POST /api/v1/weixin/check-download-status
 */
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
    console.error('查询下载状态失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json(createApiResponse(false, undefined, undefined, `查询下载状态失败: ${errorMessage}`));
  }
});

export default router; 