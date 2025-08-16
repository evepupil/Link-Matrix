# 部署指南

## 🚀 外网服务器部署

### 1. 环境准备

#### 前端环境变量配置
```bash
# 复制环境变量示例文件
cp frontend/env.example frontend/.env.local

# 编辑 .env.local 文件，修改API地址为你的服务器IP
VITE_API_BASE_URL=http://你的服务器IP:8000/api/v1
VITE_DEV_MODE=false
```

#### 后端环境变量配置
```bash
# 复制环境变量示例文件
cp nodejs_backend/env.example nodejs_backend/.env

# 编辑 .env 文件
PORT=8000
HOST=0.0.0.0  # 允许外部访问
SUPABASE_URL=你的supabase_url
SUPABASE_SERVICE_ROLE_KEY=你的supabase_service_role_key
DATABASE_URL=你的database_url
```

### 2. 服务器配置

#### 防火墙设置
```bash
# 开放8000端口（后端API）
sudo ufw allow 8000

# 开放3000端口（前端开发服务器，可选）
sudo ufw allow 3000
```

#### 使用PM2管理进程（推荐）
```bash
# 安装PM2
npm install -g pm2

# 启动后端服务
cd nodejs_backend
pm2 start src/index.ts --name "linkmatrix-backend" --interpreter="node" --interpreter-args="-r ts-node/register -r tsconfig-paths/register"

# 启动前端服务（如果需要）
cd ../frontend
pm2 start npm --name "linkmatrix-frontend" -- run dev

# 查看进程状态
pm2 status

# 查看日志
pm2 logs linkmatrix-backend
pm2 logs linkmatrix-frontend
```

### 3. 生产环境构建

#### 前端构建
```bash
cd frontend
npm run build

# 构建完成后，dist目录包含静态文件
# 可以使用nginx或其他web服务器托管
```

#### 使用Nginx托管前端
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. 环境变量示例

#### 开发环境 (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEV_MODE=true
```

#### 生产环境 (.env.local)
```env
VITE_API_BASE_URL=http://你的服务器IP:8000/api/v1
VITE_DEV_MODE=false
```

#### 后端环境 (.env)
```env
# 服务器配置
PORT=8000
HOST=0.0.0.0

# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@host:port/database

# CORS配置（允许前端域名）
CORS_ORIGINS=http://你的域名.com,http://localhost:3000

# 其他配置
LOG_LEVEL=info
```

### 5. 测试部署

#### 检查后端服务
```bash
# 健康检查
curl http://你的服务器IP:8000/health

# API测试
curl http://你的服务器IP:8000/api/v1/accounts/browser
```

#### 检查前端访问
- 访问 `http://你的服务器IP:3000` (开发模式)
- 或访问 `http://你的域名.com` (生产模式)

### 6. 常见问题

#### CORS错误
确保后端 `.env` 中的 `CORS_ORIGINS` 包含前端域名：
```env
CORS_ORIGINS=http://你的域名.com,http://localhost:3000
```

#### 端口被占用
```bash
# 查看端口占用
sudo netstat -tulpn | grep :8000

# 杀死进程
sudo kill -9 进程ID
```

#### 权限问题
```bash
# 确保目录权限正确
sudo chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project
```

### 7. 监控和维护

#### 日志管理
```bash
# 查看PM2日志
pm2 logs

# 查看系统日志
sudo journalctl -u pm2-root -f
```

#### 自动重启
```bash
# 设置PM2开机自启
pm2 startup
pm2 save
```

#### 备份策略
```bash
# 备份环境变量
cp .env .env.backup

# 备份构建文件
tar -czf frontend-dist-backup.tar.gz frontend/dist/
```

## 🔧 开发环境配置

### 本地开发
```bash
# 后端
cd nodejs_backend
npm run dev

# 前端
cd frontend
npm run dev
```

### 环境变量优先级
1. `.env.local` (前端)
2. `.env` (后端)
3. 系统环境变量
4. 默认值

## 📝 注意事项

1. **安全性**：生产环境请使用HTTPS
2. **防火墙**：只开放必要的端口
3. **备份**：定期备份配置和数据
4. **监控**：设置服务监控和告警
5. **更新**：定期更新依赖包 