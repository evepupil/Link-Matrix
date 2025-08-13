# 账号管理功能实现说明

## 功能概述

本项目实现了完整的账号管理系统，支持两种类型的账户管理：

1. **浏览器账户** - 通过浏览器登录的账户
2. **API账户** - 通过API接口操作的账户（目前支持微信公众号）

## 后端实现

### 1. 数据库模型

#### 微信公众号API账户表 (`api_accounts_wx`)

```sql
CREATE TABLE api_accounts_wx (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- 账户名称
    appid VARCHAR(255) UNIQUE NOT NULL,   -- 微信公众号AppID
    app_secret VARCHAR(255) NOT NULL,     -- 微信公众号AppSecret
    wx_id VARCHAR(255) NOT NULL,          -- 微信公众号ID
    title VARCHAR(255) NOT NULL,          -- 默认标题
    author VARCHAR(255) NOT NULL,         -- 作者名称
    thumb_media_id TEXT,                  -- 默认封面媒体ID
    illust_tag JSONB,                     -- 插图标签，JSON格式
    status VARCHAR(50) DEFAULT 'active',  -- 账户状态
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 后端文件结构

```
backend/
├── app/
│   ├── models/
│   │   ├── models.py          # 数据库模型定义
│   │   └── schemas.py         # Pydantic Schema定义
│   ├── services/
│   │   └── account_service.py # 账户服务层
│   └── routers/
│       └── account.py         # API路由定义
└── create_api_accounts_wx_table.sql  # 数据库创建脚本
```

### 3. API接口

#### 浏览器账户接口
- `POST /api/accounts/browser/` - 创建浏览器账户
- `GET /api/accounts/browser/` - 获取浏览器账户列表
- `GET /api/accounts/browser/{id}` - 获取特定浏览器账户
- `PUT /api/accounts/browser/{id}` - 更新浏览器账户
- `DELETE /api/accounts/browser/{id}` - 删除浏览器账户

#### 微信公众号API账户接口
- `POST /api/accounts/api/wx/` - 创建微信公众号API账户
- `GET /api/accounts/api/wx/` - 获取微信公众号API账户列表
- `GET /api/accounts/api/wx/{id}` - 获取特定微信公众号API账户
- `PUT /api/accounts/api/wx/{id}` - 更新微信公众号API账户
- `DELETE /api/accounts/api/wx/{id}` - 删除微信公众号API账户

## 前端实现

### 1. 文件结构

```
frontend/src/pages/
├── AccountManagement.tsx                    # 主入口文件（重定向）
└── AccountManagement/
    ├── index.tsx                           # 主页面（Tab切换）
    ├── BrowserAccounts/
    │   └── index.tsx                       # 浏览器账户管理
    └── ApiAccounts/
        └── index.tsx                       # API账户管理
```

### 2. 功能特性

#### 浏览器账户管理
- ✅ 支持多平台账户（微博、微信、YouTube、Twitter、B站、抖音）
- ✅ 账户状态管理（正常、未激活、已过期、错误）
- ✅ 浏览器配置关联
- ✅ 登录状态刷新
- ✅ 完整的CRUD操作

#### 微信公众号API账户管理
- ✅ 完整的账户信息管理
- ✅ AppSecret安全显示/隐藏
- ✅ 插图标签JSON格式支持
- ✅ 展开行显示详细信息
- ✅ 表单验证和错误处理

### 3. UI特性

- 🎨 现代化的Ant Design界面
- 📱 响应式设计
- 🔍 搜索和分页功能
- 🎯 工具提示和确认对话框
- 📊 状态标签和图标
- 🔒 敏感信息保护

## 使用说明

### 1. Supabase配置

#### 1.1 创建环境变量文件

在 `backend/` 目录下创建 `.env` 文件：

```bash
# Supabase配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# 数据库配置 - 使用Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres

# 日志配置
LOG_LEVEL=INFO
LOG_DIR=./logs
LOG_MAX_SIZE=10485760
LOG_BACKUP_COUNT=5

# 浏览器配置
BROWSER_PROFILES_DIR=./browser_profiles

# CORS配置
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

#### 1.2 获取Supabase配置信息

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目或选择现有项目
3. 在项目设置中找到：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`
   - **Database** → `DATABASE_URL`

#### 1.3 验证配置

运行配置检查脚本：

```bash
cd backend
python check_supabase.py
```

如果配置正确，会显示：
```
🎉 所有检查通过！Supabase配置正确且可以正常使用
```

### 2. 数据库初始化

#### 方式1：使用Python脚本（推荐）

```bash
cd backend
python -m app.database.supabase_init
```

#### 方式2：手动执行SQL

```bash
# 如果使用Supabase Dashboard
# 在SQL Editor中执行 backend/create_api_accounts_wx_table.sql 中的内容
```

### 2. 启动服务

```bash
# 后端
cd backend
python main.py

# 前端
cd frontend
npm start
```

### 3. 访问界面

访问 `http://localhost:3000` 进入账号管理页面，通过Tab切换不同类型的账户管理。

## 数据格式示例

### 微信公众号API账户数据格式

```json
{
  "name": "ACG萌图宅",
  "appid": "wxf4b120c317485aca",
  "app_secret": "49781f3e442f416f965aeb66f427d27c",
  "wx_id": "ACG_otaku_",
  "title": "每日萌图",
  "author": "ACG萌图宅",
  "thumb_media_id": "JjT38Mys-rP5OosVgMwh2cPubSUaMvTBlkVzSliYTjOw15E3F-ZAeY375z7zYHri",
  "illust_tag": [
    ["黑裤袜", "黑丝"],
    ["碧蓝档案"]
  ]
}
```

## 技术栈

### 后端
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic

### 前端
- React
- TypeScript
- Ant Design
- Vite

## 扩展性

该架构设计具有良好的扩展性：

1. **新增平台支持** - 在浏览器账户中添加新平台
2. **新增API账户类型** - 复制微信公众号模式，支持其他平台的API账户
3. **功能增强** - 可以轻松添加账户测试、批量操作等功能

## 注意事项

1. AppSecret等敏感信息在前端显示时默认隐藏
2. 所有API接口都有完整的错误处理和日志记录
3. 数据库操作使用事务确保数据一致性
4. 前端表单有完整的验证机制 