from typing import List
from pydantic import BaseSettings, validator
import os
from pathlib import Path

class Settings:
    PROJECT_NAME: str = "LinkMatrix Backend"
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]  # 前端端口
    
    # 浏览器配置相关
    BROWSER_PROFILES_DIR: str = os.getenv("BROWSER_PROFILES_DIR", "./browser_profiles")
    
    # 日志配置相关
    LOG_DIR: str = os.getenv("LOG_DIR", "./logs")
    LOG_MAX_SIZE: int = int(os.getenv("LOG_MAX_SIZE", "10485760"))  # 10MB
    LOG_BACKUP_COUNT: int = int(os.getenv("LOG_BACKUP_COUNT", "5"))
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(funcName)s() | %(message)s")
    
    # 确保必要目录存在
    def __init__(self):
        os.makedirs(self.BROWSER_PROFILES_DIR, exist_ok=True)
        os.makedirs(self.LOG_DIR, exist_ok=True)

settings = Settings()