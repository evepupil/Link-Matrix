from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.init_app import init_application
from app.core.logger import get_logger
from app.routers import api_router

# 初始化日志系统
logger = get_logger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="LinkMatrix 自媒体矩阵运营工具后端API",
    version="1.0.0",
)

logger.info("正在启动 LinkMatrix 后端服务...")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("CORS 中间件配置完成")

# 注册路由
app.include_router(api_router, prefix=settings.API_PREFIX)
logger.info("API 路由注册完成")

# 初始化应用
init_application(app)
logger.info("应用初始化完成")

if __name__ == "__main__":
    import uvicorn
    logger.info("启动 uvicorn 服务器，监听端口 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)