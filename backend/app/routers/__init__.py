from fastapi import APIRouter
from app.routers import account, resource, media_tool, publish, task, system

# 创建主路由
api_router = APIRouter()

# 注册各模块路由
api_router.include_router(account.router, prefix="/accounts", tags=["账户管理"])
api_router.include_router(resource.router, prefix="/resources", tags=["资源管理"])
api_router.include_router(media_tool.router, prefix="/media-tools", tags=["自媒体工具"])
api_router.include_router(publish.router, prefix="/publish", tags=["一键发布"])
api_router.include_router(task.router, prefix="/tasks", tags=["任务管理"])
api_router.include_router(system.router, prefix="/system", tags=["系统设置"])