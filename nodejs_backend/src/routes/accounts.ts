import { Router, Request, Response } from 'express';
import { BrowserAccountService, ApiAccountService } from '@/services/accountService';
import { 
  CreateBrowserAccountRequest, 
  UpdateBrowserAccountRequest,
  CreateApiAccountWxRequest,
  UpdateApiAccountWxRequest,
  ApiResponse
} from '@/models/types';

const router = Router();

// 通用响应格式
const createApiResponse = <T>(
  success: boolean, 
  data?: T, 
  message?: string, 
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  message,
  error,
  timestamp: new Date().toISOString()
});

// 浏览器账户路由

// GET /api/v1/accounts/browser - 获取所有浏览器账户
router.get('/browser', async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await BrowserAccountService.getAll();
    res.json(createApiResponse(true, accounts, 'Browser accounts retrieved successfully'));
  } catch (error) {
    console.error('Error in GET /accounts/browser:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// GET /api/v1/accounts/browser/:id - 获取单个浏览器账户
router.get('/browser/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    const account = await BrowserAccountService.getById(id);
    if (!account) {
      res.status(404).json(createApiResponse(false, undefined, undefined, 'Browser account not found'));
      return;
    }

    res.json(createApiResponse(true, account, 'Browser account retrieved successfully'));
  } catch (error) {
    console.error('Error in GET /accounts/browser/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// POST /api/v1/accounts/browser - 创建浏览器账户
router.post('/browser', async (req: Request, res: Response): Promise<void> => {
  try {
    const accountData: CreateBrowserAccountRequest = req.body;
    
    // 验证必填字段
    if (!accountData.platform || !accountData.name || !accountData.username || !accountData.browser_profile_id) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Missing required fields'));
      return;
    }

    const account = await BrowserAccountService.create(accountData);
    res.status(201).json(createApiResponse(true, account, 'Browser account created successfully'));
  } catch (error) {
    console.error('Error in POST /accounts/browser:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// PUT /api/v1/accounts/browser/:id - 更新浏览器账户
router.put('/browser/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    const accountData: UpdateBrowserAccountRequest = req.body;
    const account = await BrowserAccountService.update(id, accountData);
    res.json(createApiResponse(true, account, 'Browser account updated successfully'));
  } catch (error) {
    console.error('Error in PUT /accounts/browser/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// DELETE /api/v1/accounts/browser/:id - 删除浏览器账户
router.delete('/browser/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    await BrowserAccountService.delete(id);
    res.json(createApiResponse(true, undefined, 'Browser account deleted successfully'));
  } catch (error) {
    console.error('Error in DELETE /accounts/browser/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// POST /api/v1/accounts/browser/:id/refresh - 刷新浏览器账户状态
router.post('/browser/:id/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    const account = await BrowserAccountService.refreshStatus(id);
    res.json(createApiResponse(true, account, 'Browser account status refreshed successfully'));
  } catch (error) {
    console.error('Error in POST /accounts/browser/:id/refresh:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// API账户路由

// GET /api/v1/accounts/api/wx - 获取所有API账户
router.get('/api/wx', async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await ApiAccountService.getAll();
    res.json(createApiResponse(true, accounts, 'API accounts retrieved successfully'));
  } catch (error) {
    console.error('Error in GET /accounts/api/wx:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// GET /api/v1/accounts/api/wx/:id - 获取单个API账户
router.get('/api/wx/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    const account = await ApiAccountService.getById(id);
    if (!account) {
      res.status(404).json(createApiResponse(false, undefined, undefined, 'API account not found'));
      return;
    }

    res.json(createApiResponse(true, account, 'API account retrieved successfully'));
  } catch (error) {
    console.error('Error in GET /accounts/api/wx/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// POST /api/v1/accounts/api/wx - 创建API账户
router.post('/api/wx', async (req: Request, res: Response): Promise<void> => {
  try {
    const accountData: CreateApiAccountWxRequest = req.body;
    
    // 验证必填字段
    if (!accountData.name || !accountData.appid || !accountData.app_secret || 
        !accountData.wx_id || !accountData.title || !accountData.author) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Missing required fields'));
      return;
    }

    const account = await ApiAccountService.create(accountData);
    res.status(201).json(createApiResponse(true, account, 'API account created successfully'));
  } catch (error) {
    console.error('Error in POST /accounts/api/wx:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// PUT /api/v1/accounts/api/wx/:id - 更新API账户
router.put('/api/wx/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    const accountData: UpdateApiAccountWxRequest = req.body;
    const account = await ApiAccountService.update(id, accountData);
    res.json(createApiResponse(true, account, 'API account updated successfully'));
  } catch (error) {
    console.error('Error in PUT /accounts/api/wx/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// DELETE /api/v1/accounts/api/wx/:id - 删除API账户
router.delete('/api/wx/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid ID parameter'));
      return;
    }

    await ApiAccountService.delete(id);
    res.json(createApiResponse(true, undefined, 'API account deleted successfully'));
  } catch (error) {
    console.error('Error in DELETE /accounts/api/wx/:id:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

// GET /api/v1/accounts/api/wx/appid/:appid - 根据AppID获取API账户
router.get('/api/wx/appid/:appid', async (req: Request, res: Response): Promise<void> => {
  try {
    const appId = req.params.appid;
    if (!appId) {
      res.status(400).json(createApiResponse(false, undefined, undefined, 'Invalid AppID parameter'));
      return;
    }

    const account = await ApiAccountService.getByAppId(appId);
    if (!account) {
      res.status(404).json(createApiResponse(false, undefined, undefined, 'API account not found'));
      return;
    }

    res.json(createApiResponse(true, account, 'API account retrieved successfully'));
  } catch (error) {
    console.error('Error in GET /accounts/api/wx/appid/:appid:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, error instanceof Error ? error.message : 'Internal server error'));
  }
});

export default router; 