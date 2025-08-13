# 账户管理API集成说明

## 🎯 重构完成

### 1. 文件结构优化
- ✅ 删除了不必要的重定向文件 `AccountManagement.tsx`
- ✅ 直接使用 `frontend/src/pages/AccountManagement.tsx` 作为主文件
- ✅ 保持了子组件的目录结构：`BrowserAccounts/` 和 `ApiAccounts/`

### 2. API服务层
- ✅ 创建了 `frontend/src/services/api.ts` 统一管理API调用
- ✅ 支持浏览器账户和API账户的完整CRUD操作
- ✅ 统一的错误处理和请求配置

### 3. 完整API集成
- ✅ 浏览器账户：增删改查全部对接后端API
- ✅ API账户：增删改查全部对接后端API
- ✅ 错误处理和用户反馈
- ✅ 加载状态管理

## 🔧 API端点

### 浏览器账户
```
GET    /api/v1/accounts/browser/     # 获取所有浏览器账户
POST   /api/v1/accounts/browser/     # 创建浏览器账户
PUT    /api/v1/accounts/browser/{id} # 更新浏览器账户
DELETE /api/v1/accounts/browser/{id} # 删除浏览器账户
GET    /api/v1/accounts/browser/{id} # 获取单个浏览器账户
```

### API账户（微信公众号）
```
GET    /api/v1/accounts/api/wx/     # 获取所有API账户
POST   /api/v1/accounts/api/wx/     # 创建API账户
PUT    /api/v1/accounts/api/wx/{id} # 更新API账户
DELETE /api/v1/accounts/api/wx/{id} # 删除API账户
GET    /api/v1/accounts/api/wx/{id} # 获取单个API账户
```

## 🚀 使用方法

### 1. 启动后端服务
```bash
cd backend
python main.py
```

### 2. 启动前端服务
```bash
cd frontend
npm run dev
```

### 3. 访问账户管理
- 打开浏览器访问：`http://localhost:3000`
- 点击"账号管理"菜单
- 在"浏览器账户"和"API账户"标签页之间切换

## ✨ 功能特性

### 浏览器账户
- 🔍 支持多平台：微博、微信、YouTube、Twitter、B站、抖音
- 📝 完整的CRUD操作
- 🔄 状态刷新功能
- 🎨 平台图标和状态标签
- 📊 分页和搜索

### API账户（微信公众号）
- 🔐 AppSecret安全显示/隐藏
- 📋 完整的账户信息管理
- 🏷️ 插图标签JSON格式支持
- 📱 响应式表单布局
- 🔍 详细信息展开查看

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Ant Design** UI组件库
- **Fetch API** 进行HTTP请求
- **React Hooks** 状态管理

### 后端
- **FastAPI** Web框架
- **SQLAlchemy** ORM
- **Pydantic** 数据验证
- **PostgreSQL** 数据库（Supabase）

## 🔍 调试和测试

### 1. 检查API连接
```bash
# 测试后端健康状态
curl http://localhost:8000/api/v1/health

# 测试账户API
curl http://localhost:8000/api/v1/accounts/browser/
curl http://localhost:8000/api/v1/accounts/api/wx/
```

### 2. 浏览器开发者工具
- 打开Network标签页查看API请求
- 查看Console标签页的错误信息
- 使用React Developer Tools调试组件状态

### 3. 后端日志
```bash
# 查看后端运行日志
cd backend
python main.py
```

## 🐛 常见问题

### 1. CORS错误
确保后端CORS配置正确：
```python
# backend/app/core/config.py
CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
```

### 2. API连接失败
检查：
- 后端服务是否启动（端口8000）
- 前端API_BASE_URL配置是否正确
- 网络连接是否正常

### 3. 数据库连接问题
确保：
- Supabase配置正确
- 数据库表已创建
- 环境变量设置正确

## 📈 下一步计划

1. **用户认证**：添加登录和权限控制
2. **批量操作**：支持批量删除、导入导出
3. **数据验证**：前端表单验证增强
4. **实时更新**：WebSocket实时状态更新
5. **日志记录**：操作日志和审计功能

## 📞 技术支持

如有问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. 后端服务日志
4. 数据库连接状态 