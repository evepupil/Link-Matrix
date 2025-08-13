// API基础配置
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 通用请求函数
const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 浏览器账户API
export const browserAccountAPI = {
  // 获取所有浏览器账户
  getAll: () => request('/accounts/browser/'),
  
  // 创建浏览器账户
  create: (data: any) => request('/accounts/browser/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 更新浏览器账户
  update: (id: number, data: any) => request(`/accounts/browser/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // 删除浏览器账户
  delete: (id: number) => request(`/accounts/browser/${id}`, {
    method: 'DELETE',
  }),
  
  // 获取单个浏览器账户
  getById: (id: number) => request(`/accounts/browser/${id}`),
};

// API账户API
export const apiAccountAPI = {
  // 获取所有API账户
  getAll: () => request('/accounts/api/wx/'),
  
  // 创建API账户
  create: (data: any) => request('/accounts/api/wx/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 更新API账户
  update: (id: number, data: any) => request(`/accounts/api/wx/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // 删除API账户
  delete: (id: number) => request(`/accounts/api/wx/${id}`, {
    method: 'DELETE',
  }),
  
  // 获取单个API账户
  getById: (id: number) => request(`/accounts/api/wx/${id}`),
};

// 通用API
export const commonAPI = {
  // 健康检查
  health: () => request('/health'),
  
  // 获取系统信息
  systemInfo: () => request('/system/info'),
};

export default {
  browserAccount: browserAccountAPI,
  apiAccount: apiAccountAPI,
  common: commonAPI,
}; 