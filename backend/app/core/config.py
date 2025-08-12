from typing import List
from pydantic import BaseSettings, validator
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Settings:
    PROJECT_NAME: str = "LinkMatrix Backend"
    API_PREFIX: str = "/api/v1"
    
    # 数据库配置 - 支持Supabase PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./sql_app.db"  # 默认SQLite，生产环境使用Supabase
    )
    
    # Supabase配置
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]  # 前端端口
    
    # 浏览器配置相关 - 保持本地存储
    BROWSER_PROFILES_DIR: str = os.getenv("BROWSER_PROFILES_DIR", "./browser_profiles")
    
    # 日志配置相关
    LOG_DIR: str = os.getenv("LOG_DIR", "./logs")
    LOG_MAX_SIZE: int = int(os.getenv("LOG_MAX_SIZE", "10485760"))  # 10MB
    LOG_BACKUP_COUNT: int = int(os.getenv("LOG_BACKUP_COUNT", "5"))
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(funcName)s() | %(message)s")
    
    @property
    def is_using_supabase(self) -> bool:
        """检查是否使用Supabase"""
        return self.DATABASE_URL.startswith("postgresql://")
    
    # 确保必要目录存在
    def __init__(self):
        os.makedirs(self.BROWSER_PROFILES_DIR, exist_ok=True)
        os.makedirs(self.LOG_DIR, exist_ok=True)

settings = Settings()
