import logging
from fastapi import FastAPI
from pathlib import Path
import os

from app.core.config import settings
from app.database.session import SessionLocal
from app.database.init_db import init_db

logger = logging.getLogger(__name__)

def init_application(app: FastAPI) -> None:
    """
    初始化应用
    
    Args:
        app: FastAPI应用实例
    """
    # 确保存储目录存在
    create_directories()
    
    # 初始化数据库
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    
    # 注册启动和关闭事件
    register_events(app)

def create_directories() -> None:
    """创建必要的目录结构"""
    directories = [
        settings.STORAGE_DIR,
        settings.BROWSER_PROFILES_DIR,
        settings.MEDIA_DIR,
        settings.LOGS_DIR
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"确保目录存在: {directory}")

def register_events(app: FastAPI) -> None:
    """
    注册应用事件
    
    Args:
        app: FastAPI应用实例
    """
    
    @app.on_event("startup")
    async def startup_event():
        logger.info("应用启动")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("应用关闭")