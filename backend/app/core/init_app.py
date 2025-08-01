from fastapi import FastAPI
from pathlib import Path
import os

from app.core.config import settings
from app.core.logger import get_logger, log_exception
from app.database.session import SessionLocal
from app.database.init_db import init_db

logger = get_logger(__name__)

def init_application(app: FastAPI) -> None:
    """
    初始化应用
    
    Args:
        app: FastAPI应用实例
    """
    logger.info("开始初始化应用")
    
    try:
        # 确保存储目录存在
        create_directories()
        
        # 初始化数据库
        init_database()
        
        # 注册启动和关闭事件
        register_events(app)
        
        logger.info("应用初始化完成")
        
    except Exception as e:
        log_exception(logger, e, "应用初始化失败")
        raise

def create_directories() -> None:
    """创建必要的目录结构"""
    logger.info("开始创建必要的目录结构")
    
    directories = [
        settings.BROWSER_PROFILES_DIR,
        settings.LOG_DIR,
        "./storage",
        "./media",
        "./temp"
    ]
    
    for directory in directories:
        try:
            os.makedirs(directory, exist_ok=True)
            logger.debug(f"确保目录存在: {directory}")
        except Exception as e:
            log_exception(logger, e, f"创建目录失败: {directory}")
            raise
    
    logger.info("目录结构创建完成")

def init_database() -> None:
    """初始化数据库"""
    logger.info("开始初始化数据库")
    
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("数据库初始化完成")
    except Exception as e:
        log_exception(logger, e, "数据库初始化失败")
        raise
    finally:
        db.close()
        logger.debug("数据库连接已关闭")

def register_events(app: FastAPI) -> None:
    """
    注册应用事件
    
    Args:
        app: FastAPI应用实例
    """
    logger.info("注册应用事件处理器")
    
    @app.on_event("startup")
    async def startup_event():
        logger.info("=== LinkMatrix 后端服务启动完成 ===")
        logger.info(f"项目名称: {settings.PROJECT_NAME}")
        logger.info(f"API前缀: {settings.API_PREFIX}")
        logger.info(f"日志级别: {settings.LOG_LEVEL}")
        logger.info(f"数据库URL: {settings.DATABASE_URL}")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("=== LinkMatrix 后端服务正在关闭 ===")
        logger.info("清理资源...")
        logger.info("服务关闭完成")
    
    logger.debug("应用事件处理器注册完成")