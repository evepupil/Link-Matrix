import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '@/config';

// 创建 Supabase 客户端
const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 测试 Supabase 连接
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_accounts_wx')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};

// 初始化数据库表
export const initSupabaseTables = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing Supabase tables...');
    
    // 检查 api_accounts_wx 表是否存在
    const { data: tableExists, error: tableError } = await supabase
      .from('api_accounts_wx')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      // 表不存在，创建表
      console.log('📋 Creating api_accounts_wx table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS api_accounts_wx (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          appid VARCHAR(255) UNIQUE NOT NULL,
          app_secret TEXT NOT NULL,
          wx_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          author VARCHAR(255) NOT NULL,
          thumb_media_id TEXT,
          illust_tag JSONB,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_appid ON api_accounts_wx(appid);
        CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_wx_id ON api_accounts_wx(wx_id);
        CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_status ON api_accounts_wx(status);
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (createError) {
        console.error('❌ Failed to create api_accounts_wx table:', createError);
        throw createError;
      }
      
      console.log('✅ api_accounts_wx table created successfully');
    } else {
      console.log('✅ api_accounts_wx table already exists');
    }
    
    // 检查 browser_accounts 表是否存在
    const { data: browserTableExists, error: browserTableError } = await supabase
      .from('browser_accounts')
      .select('id')
      .limit(1);
    
    if (browserTableError && browserTableError.code === '42P01') {
      // 表不存在，创建表
      console.log('📋 Creating browser_accounts table...');
      
      const createBrowserTableSQL = `
        CREATE TABLE IF NOT EXISTS browser_accounts (
          id SERIAL PRIMARY KEY,
          platform VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL,
          browser_profile_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_browser_accounts_platform ON browser_accounts(platform);
        CREATE INDEX IF NOT EXISTS idx_browser_accounts_status ON browser_accounts(status);
      `;
      
      const { error: createBrowserError } = await supabase.rpc('exec_sql', {
        sql: createBrowserTableSQL
      });
      
      if (createBrowserError) {
        console.error('❌ Failed to create browser_accounts table:', createBrowserError);
        throw createBrowserError;
      }
      
      console.log('✅ browser_accounts table created successfully');
    } else {
      console.log('✅ browser_accounts table already exists');
    }
    
    console.log('🎉 All tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error);
    throw error;
  }
};

// 插入示例数据
export const insertSampleData = async (): Promise<void> => {
  try {
    console.log('📝 Inserting sample data...');
    
    // 插入示例微信公众号API账户
    const { error: wxError } = await supabase
      .from('api_accounts_wx')
      .insert([
        {
          name: 'ACG萌图宅',
          appid: 'wxf4b120c317485aca',
          app_secret: '49781f3e442f416f965aeb66f427d27c',
          wx_id: 'ACG_otaku_',
          title: '每日萌图',
          author: 'ACG萌图宅',
          thumb_media_id: 'JjT38Mys-rP5OosVgMwh2cPubSUaMvTBlkVzSliYTjOw15E3F-ZAeY375z7zYHri',
          illust_tag: [['黑裤袜', '黑丝'], ['碧蓝档案']],
          status: 'active'
        }
      ]);
    
    if (wxError) {
      console.error('❌ Failed to insert sample API account:', wxError);
    } else {
      console.log('✅ Sample API account inserted');
    }
    
    // 插入示例浏览器账户
    const { error: browserError } = await supabase
      .from('browser_accounts')
      .insert([
        {
          platform: 'weibo',
          name: '我的微博账号',
          username: 'weibo_user_001',
          browser_profile_id: 1,
          status: 'active'
        }
      ]);
    
    if (browserError) {
      console.error('❌ Failed to insert sample browser account:', browserError);
    } else {
      console.log('✅ Sample browser account inserted');
    }
    
    console.log('🎉 Sample data insertion completed');
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error);
    throw error;
  }
};

export default supabase; 