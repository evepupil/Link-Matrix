import supabase from './supabase';
import { 
  BrowserAccount, 
  CreateBrowserAccountRequest, 
  UpdateBrowserAccountRequest,
  ApiAccountWx,
  CreateApiAccountWxRequest,
  UpdateApiAccountWxRequest
} from '@/models/types';

// 浏览器账户服务
export class BrowserAccountService {
  // 获取所有浏览器账户
  static async getAll(): Promise<BrowserAccount[]> {
    try {
      const { data, error } = await supabase
        .from('browser_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch browser accounts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching browser accounts:', error);
      throw error;
    }
  }

  // 根据ID获取浏览器账户
  static async getById(id: number): Promise<BrowserAccount | null> {
    try {
      const { data, error } = await supabase
        .from('browser_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 记录不存在
        }
        throw new Error(`Failed to fetch browser account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching browser account:', error);
      throw error;
    }
  }

  // 创建浏览器账户
  static async create(accountData: CreateBrowserAccountRequest): Promise<BrowserAccount> {
    try {
      const { data, error } = await supabase
        .from('browser_accounts')
        .insert([{
          ...accountData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create browser account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating browser account:', error);
      throw error;
    }
  }

  // 更新浏览器账户
  static async update(id: number, accountData: UpdateBrowserAccountRequest): Promise<BrowserAccount> {
    try {
      const { data, error } = await supabase
        .from('browser_accounts')
        .update({
          ...accountData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update browser account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating browser account:', error);
      throw error;
    }
  }

  // 删除浏览器账户
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('browser_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete browser account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting browser account:', error);
      throw error;
    }
  }

  // 刷新账户状态
  static async refreshStatus(id: number): Promise<BrowserAccount> {
    try {
      const { data, error } = await supabase
        .from('browser_accounts')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to refresh browser account status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error refreshing browser account status:', error);
      throw error;
    }
  }
}

// API账户服务
export class ApiAccountService {
  // 获取所有API账户
  static async getAll(): Promise<ApiAccountWx[]> {
    try {
      const { data, error } = await supabase
        .from('api_accounts_wx')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch API accounts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching API accounts:', error);
      throw error;
    }
  }

  // 根据ID获取API账户
  static async getById(id: number): Promise<ApiAccountWx | null> {
    try {
      const { data, error } = await supabase
        .from('api_accounts_wx')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 记录不存在
        }
        throw new Error(`Failed to fetch API account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching API account:', error);
      throw error;
    }
  }

  // 创建API账户
  static async create(accountData: CreateApiAccountWxRequest): Promise<ApiAccountWx> {
    try {
      const { data, error } = await supabase
        .from('api_accounts_wx')
        .insert([{
          ...accountData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create API account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating API account:', error);
      throw error;
    }
  }

  // 更新API账户
  static async update(id: number, accountData: UpdateApiAccountWxRequest): Promise<ApiAccountWx> {
    try {
      const { data, error } = await supabase
        .from('api_accounts_wx')
        .update({
          ...accountData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update API account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating API account:', error);
      throw error;
    }
  }

  // 删除API账户
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_accounts_wx')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete API account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting API account:', error);
      throw error;
    }
  }

  // 根据AppID获取API账户
  static async getByAppId(appId: string): Promise<ApiAccountWx | null> {
    try {
      const { data, error } = await supabase
        .from('api_accounts_wx')
        .select('*')
        .eq('appid', appId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 记录不存在
        }
        throw new Error(`Failed to fetch API account by AppID: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching API account by AppID:', error);
      throw error;
    }
  }
} 