# LinkMatrix Backend - Node.js + TypeScript

基于 Express.js + TypeScript 构建的 LinkMatrix 后端服务，支持 Supabase 数据库集成。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# 复制环境变量示例文件
cp env.example .env

# 编辑 .env 文件，填入你的 Supabase 配置
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
nodejs_backend/
├── src/
│   ├── config/          # 配置文件
│   ├── models/          # 数据模型和类型定义
│   ├── services/        # 业务逻辑服务
│   ├── routes/          # API 路由
│   ├── middleware/      # 中间件
│   └── index.ts         # 应用入口
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── nodemon.json         # 开发服务器配置
└── env.example          # 环境变量示例
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | `8000` |
| `HOST` | 服务器主机 | `localhost` |
| `NODE_ENV` | 运行环境 | `development` |
| `SUPABASE_URL` | Supabase 项目 URL | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | - |
| `CORS_ORIGINS` | CORS 允许的源 | `http://localhost:3000,http://localhost:3001` |
| `API_PREFIX` | API 前缀 | `/api/v1` |

## 📡 API 端点

### 健康检查
- `GET /health` - 健康检查
- `GET /system/info` - 系统信息

### 浏览器账户管理
- `GET /api/v1/accounts/browser` - 获取所有浏览器账户
- `GET /api/v1/accounts/browser/:id` - 获取单个浏览器账户
- `POST /api/v1/accounts/browser` - 创建浏览器账户
- `PUT /api/v1/accounts/browser/:id` - 更新浏览器账户
- `DELETE /api/v1/accounts/browser/:id` - 删除浏览器账户
- `POST /api/v1/accounts/browser/:id/refresh` - 刷新账户状态

### API账户管理（微信公众号）
- `GET /api/v1/accounts/api/wx` - 获取所有API账户
- `GET /api/v1/accounts/api/wx/:id` - 获取单个API账户
- `POST /api/v1/accounts/api/wx` - 创建API账户
- `PUT /api/v1/accounts/api/wx/:id` - 更新API账户
- `DELETE /api/v1/accounts/api/wx/:id` - 删除API账户
- `GET /api/v1/accounts/api/wx/appid/:appid` - 根据AppID获取账户

## 🗄️ 数据库表结构

### browser_accounts 表
```sql
CREATE TABLE browser_accounts (
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
```

### api_accounts_wx 表
```sql
CREATE TABLE api_accounts_wx (
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
```

## 🛠️ 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm test
```

## 🔍 调试

### 查看日志
```bash
# 开发模式下，日志会输出到控制台
npm run dev

# 生产模式下，日志会写入 logs 目录
npm start
```

### 测试 API
```bash
# 健康检查
curl http://localhost:8000/health

# 获取浏览器账户
curl http://localhost:8000/api/v1/accounts/browser

# 获取API账户
curl http://localhost:8000/api/v1/accounts/api/wx
```

## 🚀 部署

### 使用 PM2
```bash
# 安装 PM2
npm install -g pm2

# 构建项目
npm run build

# 启动服务
pm2 start dist/index.js --name link-matrix-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs link-matrix-backend
```

### 使用 Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
```

## 🔧 故障排除

### 常见问题

1. **Supabase 连接失败**
   - 检查 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
   - 确认 Supabase 项目是否正常运行

2. **CORS 错误**
   - 检查 `CORS_ORIGINS` 配置
   - 确认前端域名是否在允许列表中

3. **端口被占用**
   - 修改 `PORT` 环境变量
   - 或者停止占用端口的其他服务

4. **TypeScript 编译错误**
   - 运行 `npm run build` 查看详细错误信息
   - 检查 `tsconfig.json` 配置

## 📞 技术支持

如有问题，请检查：
1. 控制台错误信息
2. 网络连接状态
3. Supabase 配置
4. 环境变量设置

## �� 许可证

MIT License 