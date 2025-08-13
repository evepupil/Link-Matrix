// 基础接口
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// 浏览器账户模型
export interface BrowserAccount extends BaseEntity {
  platform: string;
  name: string;
  username: string;
  browser_profile_id: number;
  status: string;
  last_login?: string;
}

// 浏览器账户创建请求
export interface CreateBrowserAccountRequest {
  platform: string;
  name: string;
  username: string;
  browser_profile_id: number;
}

// 浏览器账户更新请求
export interface UpdateBrowserAccountRequest {
  platform?: string;
  name?: string;
  username?: string;
  browser_profile_id?: number;
  status?: string;
}

// 微信公众号API账户模型
export interface ApiAccountWx extends BaseEntity {
  name: string;
  appid: string;
  app_secret: string;
  wx_id: string;
  title: string;
  author: string;
  thumb_media_id?: string;
  illust_tag?: string[][];
  status: string;
}

// 微信公众号API账户创建请求
export interface CreateApiAccountWxRequest {
  name: string;
  appid: string;
  app_secret: string;
  wx_id: string;
  title: string;
  author: string;
  thumb_media_id?: string;
  illust_tag?: string[][];
}

// 微信公众号API账户更新请求
export interface UpdateApiAccountWxRequest {
  name?: string;
  appid?: string;
  app_secret?: string;
  wx_id?: string;
  title?: string;
  author?: string;
  thumb_media_id?: string;
  illust_tag?: string[][];
  status?: string;
}

// 浏览器配置模型
export interface BrowserProfile extends BaseEntity {
  name: string;
  description?: string;
  user_agent?: string;
  proxy_settings?: Record<string, any>;
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 分页响应格式
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 健康检查响应
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  supabase: {
    connected: boolean;
    url?: string;
  };
}

// 系统信息响应
export interface SystemInfoResponse {
  nodeVersion: string;
  platform: string;
  arch: string;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  uptime: number;
  environment: string;
} 