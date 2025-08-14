import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

export interface Config {
  // 服务器配置
  port: number;
  host: string;
  nodeEnv: string;
  
  // Supabase配置
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  
  // CORS配置
  corsOrigins: string[];
  
  // 日志配置
  logLevel: string;
  logDir: string;
  logMaxSize: number;
  logBackupCount: number;
  logFormat: string;
  
  // 浏览器配置
  browserProfilesDir: string;
  
  // API配置
  apiPrefix: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

const config: Config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '8000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase配置
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // CORS配置
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
  logMaxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
  logBackupCount: parseInt(process.env.LOG_BACKUP_COUNT || '5', 10),
  logFormat: process.env.LOG_FORMAT || 
    '%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(funcName)s() | %(message)s',
  
  // 浏览器配置
  browserProfilesDir: process.env.BROWSER_PROFILES_DIR || path.join(process.cwd(), 'browser_profiles'),
  
  // API配置
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '1000000', 10), // 1000000请求/15分钟
};

// 验证必要的环境变量
export const validateConfig = (): void => {
  const requiredVars = [
    { name: 'SUPABASE_URL', value: config.supabaseUrl },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: config.supabaseServiceRoleKey }
  ];

  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.map(v => v.name).join(', ')}`);
  }
};

// 检查是否使用Supabase
export const isUsingSupabase = (): boolean => {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
};

// 获取Supabase连接信息（用于调试）
export const getSupabaseConnectionInfo = (): Record<string, any> => {
  if (isUsingSupabase()) {
    return {
      url: config.supabaseUrl,
      hasKey: Boolean(config.supabaseServiceRoleKey)
    };
  }
  return {};
};

export default config; 