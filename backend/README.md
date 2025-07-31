# LinkMatrix 后端

LinkMatrix 自媒体矩阵运营工具后端项目。

## 项目架构

项目采用分层架构设计：

1. **路由层**：与前端进行API交互
2. **业务层**：实现路由层中的业务逻辑
3. **浏览器自动化层**：通用可扩展的模块，一个base类，可以自定义扩展实现对页面的操作，使得支持更多平台
4. **持久层**：SQLite提供持久化支持

## 目录结构

```
backend/
├── app/
│   ├── routers/        # 路由层
│   ├── services/       # 业务层
│   ├── automation/     # 浏览器自动化层
│   ├── models/         # 数据模型
│   ├── database/       # 数据库操作
│   └── core/           # 核心配置
├── main.py             # 应用入口
└── requirements.txt    # 依赖包
```

## 安装与运行

### 环境要求

- Python 3.8+
- 支持SQLite的环境

### 安装步骤

1. 创建虚拟环境（可选但推荐）

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 安装Playwright浏览器

```bash
playwright install
```

4. 运行应用

```bash
uvicorn main:app --reload
```

应用将在 http://localhost:8000 启动，API文档可在 http://localhost:8000/docs 查看。

## 功能模块

- 账户管理：管理不同平台的账户
- 资源管理：管理浏览器配置和代理IP
- 自媒体工具：视频翻译、字幕生成等
- 一键发布：将内容发布到多个平台
- 任务管理：管理和监控自动化任务
- 系统设置：配置全局参数

## 浏览器自动化扩展

项目提供了可扩展的浏览器自动化框架，可以通过继承`BrowserAutomationBase`类来支持更多平台：

```python
from app.automation.base import BrowserAutomationBase

class MyPlatformAutomation(BrowserAutomationBase):
    # 实现平台特定的方法
    async def login(self):
        # 登录逻辑
        pass
    
    async def publish_video(self, video_path, title, description, tags):
        # 发布视频逻辑
        pass
```

然后在`AutomationFactory`中注册新平台：

```python
from app.automation.factory import AutomationFactory
from app.automation.my_platform import MyPlatformAutomation

AutomationFactory.register_platform("my_platform", MyPlatformAutomation)
```