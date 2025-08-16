import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import config, { validateConfig, isUsingSupabase, getSupabaseConnectionInfo } from '@/config';
import { testSupabaseConnection, initSupabaseTables } from '@/services/supabase';
import { corsDebugMiddleware, getCorsInfo } from '@/utils/corsDebug';
import accountsRouter from '@/routes/accounts';
import weixinRouter from '@/routes/weixin';

// 创建 Express 应用
const app = express();

// 确保必要目录存在
const ensureDirectories = () => {
  const dirs = [config.logDir, config.browserProfilesDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 中间件配置
const setupMiddleware = () => {
  // 安全头
  app.use(helmet());
  
  // CORS - 支持动态域名和开发环境
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // 允许没有origin的请求（比如移动端应用、Postman等）
      if (!origin) {
        return callback(null, true);
      }
      
      // 检查是否在允许的域名列表中
      const isAllowed = config.corsOrigins.some(allowedOrigin => {
        // 支持通配符匹配
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS blocked request from: ${origin}`);
        console.log(`✅ Allowed origins: ${config.corsOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  
  app.use(cors(corsOptions));
  
  // 请求日志
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        console.log(message.trim());
      }
    }
  }));
  
  // 速率限制
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  });
  app.use(limiter);
  
  // JSON 解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
};

// 路由配置
const setupRoutes = () => {
  // 健康检查
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: config.nodeEnv,
      supabase: {
        connected: isUsingSupabase(),
        url: config.supabaseUrl
      }
    });
  });
  
  // 系统信息
  app.get('/system/info', (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: memUsage.heapTotal,
        free: memUsage.heapUsed,
        used: memUsage.heapTotal - memUsage.heapUsed
      },
      uptime: process.uptime(),
      environment: config.nodeEnv
    });
  });
  
  // API 路由
  app.use(`${config.apiPrefix}/accounts`, accountsRouter);
  app.use(`${config.apiPrefix}/weixin`, weixinRouter);
  
  // 404 处理
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      timestamp: new Date().toISOString()
    });
  });
  
  // 错误处理中间件
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });
};

// 启动服务器
const startServer = async () => {
  try {
    console.log('🚀 Starting LinkMatrix Backend...');
    
    // 验证配置
    validateConfig();
    console.log('✅ Configuration validated');
    
    // 确保目录存在
    ensureDirectories();
    console.log('✅ Directories ensured');
    
    // 设置中间件
    setupMiddleware();
    console.log('✅ Middleware configured');
    
    // 设置路由
    setupRoutes();
    console.log('✅ Routes configured');
    
    // 测试 Supabase 连接
    if (isUsingSupabase()) {
      console.log('🔍 Testing Supabase connection...');
      const connected = await testSupabaseConnection();
      
      if (connected) {
        console.log('✅ Supabase connection successful');
        
        // 初始化数据库表
        try {
          await initSupabaseTables();
          console.log('✅ Database tables initialized');
        } catch (error) {
          console.warn('⚠️ Database table initialization failed:', error);
        }
      } else {
        console.warn('⚠️ Supabase connection failed, but continuing...');
      }
    } else {
      console.log('⚠️ Supabase not configured');
    }
    
    // 启动服务器
    app.listen(config.port, config.host, () => {
      console.log(`🎉 Server is running on http://${config.host}:${config.port}`);
      console.log(`📚 API Documentation: http://${config.host}:${config.port}${config.apiPrefix}`);
      console.log(`🔍 Health Check: http://${config.host}:${config.port}/health`);
      console.log(`⚙️ Environment: ${config.nodeEnv}`);
      
      if (isUsingSupabase()) {
        const connectionInfo = getSupabaseConnectionInfo();
        console.log(`🗄️ Supabase: ${connectionInfo.url}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 优雅关闭
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

// 监听进程信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动应用
startServer(); 