# LinkMatrix Frontend

LinkMatrix 自媒体矩阵运营工具前端项目

## 项目简介

LinkMatrix 是一个专业的自媒体矩阵运营工具，支持多平台内容发布、账号管理、资源配置等功能。本项目使用 React + TypeScript + Ant Design 构建现代化的 Web 界面。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **UI库**: Ant Design 5
- **路由**: React Router DOM 6
- **构建工具**: Vite
- **包管理**: npm

## 功能模块

### 🏠 首页仪表板
- 系统概览统计
- 待处理任务提醒
- 快速导航入口

### 👥 账号管理
- 多平台账号添加/编辑/删除
- 账号状态实时监控
- 批量操作支持

### 🔧 资源管理
- 浏览器配置管理
- 代理IP池配置
- 连接测试功能

### 🛠️ 自媒体工具
- 视频翻译处理
- 视频转文档
- AI标题生成

### 🚀 一键发布
- 多平台内容同步发布
- 视频/文章格式支持
- 发布预览功能

### 📋 任务管理
- 任务状态监控
- 任务日志查看
- 批量任务操作

### ⚙️ 系统设置
- FFmpeg路径配置
- AI API配置
- 代理策略设置

### 📚 使用文档
- 快速开始指南
- 功能介绍说明
- 常见问题解答

## 开发环境搭建

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                 # 静态资源
│   └── index.html         # HTML模板
├── src/                   # 源代码
│   ├── components/        # 组件
│   │   └── Layout/       # 布局组件
│   │       ├── AppHeader.tsx
│   │       ├── AppSider.tsx
│   │       └── index.ts
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── AccountManagement.tsx
│   │   ├── ResourceManagement.tsx
│   │   ├── MediaTools.tsx
│   │   ├── OneClickPublish.tsx
│   │   ├── TaskManagement.tsx
│   │   ├── SystemSettings.tsx
│   │   ├── Documentation.tsx
│   │   └── index.ts
│   ├── App.tsx           # 主应用组件
│   ├── index.tsx         # 应用入口
│   └── index.css         # 全局样式
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md            # 项目说明
```

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 组件采用函数式组件 + Hooks
- 使用 Ant Design 组件库

### 命名规范
- 组件文件使用 PascalCase (如: `AccountManagement.tsx`)
- 普通文件使用 camelCase (如: `utils.ts`)
- 常量使用 UPPER_SNAKE_CASE

### 注释规范
- 所有函数必须添加 JSDoc 注释
- 复杂逻辑需要添加行内注释
- 组件需要添加功能说明注释

## API 集成

项目中的 API 调用目前使用模拟数据，实际开发中需要：

1. 配置后端 API 基础地址
2. 实现 HTTP 客户端封装
3. 添加请求/响应拦截器
4. 处理错误和加载状态

## 部署说明

### 开发环境部署
```bash
npm run dev
```

### 生产环境部署
```bash
npm run build
# 将 dist 目录部署到 Web 服务器
```

### Docker 部署
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址: https://github.com/linkmatrix/frontend
- 问题反馈: https://github.com/linkmatrix/frontend/issues
- 邮箱支持: support@linkmatrix.com

## 更新日志

### v1.0.0 (2024-01-15)
- 🎉 初始版本发布
- ✨ 完整的前端界面实现
- 🔧 基础功能模块开发
- 📱 响应式设计支持