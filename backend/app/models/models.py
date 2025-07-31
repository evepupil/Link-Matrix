from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.session import Base

class Account(Base):
    """账户模型"""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)  # 平台名称
    name = Column(String, index=True)  # 账户名称
    username = Column(String)  # 用户名
    last_login = Column(DateTime, default=datetime.utcnow)  # 最近登录时间
    status = Column(String, default="active")  # 账户状态
    storage_path = Column(String)  # 浏览器状态存储路径
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联
    browser_profile_id = Column(Integer, ForeignKey("browser_profiles.id"))
    browser_profile = relationship("BrowserProfile", back_populates="accounts")
    
    # 发布任务关联
    publish_tasks = relationship("PublishTask", secondary="account_publish_tasks", back_populates="accounts")


class BrowserProfile(Base):
    """浏览器配置模型"""
    __tablename__ = "browser_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    user_agent = Column(String)
    screen_width = Column(Integer, default=1920)
    screen_height = Column(Integer, default=1080)
    storage_path = Column(String)  # 浏览器状态存储路径
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联
    accounts = relationship("Account", back_populates="browser_profile")
    proxy_id = Column(Integer, ForeignKey("proxies.id"), nullable=True)
    proxy = relationship("Proxy", back_populates="browser_profiles")


class Proxy(Base):
    """代理IP模型"""
    __tablename__ = "proxies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    protocol = Column(String)  # http, https, socks5
    host = Column(String)
    port = Column(Integer)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    last_checked = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联
    browser_profiles = relationship("BrowserProfile", back_populates="proxy")


class Task(Base):
    """任务基础模型"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String, index=True)  # publish, translate, etc.
    status = Column(String, index=True)  # pending, running, completed, failed, paused, cancelled
    progress = Column(Integer, default=0)  # 0-100
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # 关联
    logs = relationship("TaskLog", back_populates="task")


class TaskLog(Base):
    """任务日志模型"""
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    level = Column(String)  # info, warning, error
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # 关联
    task = relationship("Task", back_populates="logs")


class PublishTask(Base):
    """发布任务模型"""
    __tablename__ = "publish_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    content_type = Column(String)  # video, article
    title = Column(String)
    description = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # 逗号分隔的标签
    file_path = Column(String, nullable=True)  # 视频文件路径或文章内容文件路径
    cover_image_path = Column(String, nullable=True)  # 封面图片路径
    
    # 关联
    accounts = relationship("Account", secondary="account_publish_tasks", back_populates="publish_tasks")


# 多对多关系表
class AccountPublishTask(Base):
    """账户与发布任务的多对多关系表"""
    __tablename__ = "account_publish_tasks"

    account_id = Column(Integer, ForeignKey("accounts.id"), primary_key=True)
    publish_task_id = Column(Integer, ForeignKey("publish_tasks.id"), primary_key=True)
    status = Column(String, default="pending")  # pending, completed, failed
    result_url = Column(String, nullable=True)  # 发布成功后的URL


class VideoTranslation(Base):
    """视频翻译模型"""
    __tablename__ = "video_translations"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    original_video_path = Column(String)
    target_language = Column(String)
    transcript_path = Column(String, nullable=True)  # 原始文本路径
    translation_path = Column(String, nullable=True)  # 翻译后文本路径
    subtitle_path = Column(String, nullable=True)  # 字幕文件路径
    output_video_path = Column(String, nullable=True)  # 带字幕的视频路径


class SystemSetting(Base):
    """系统设置模型"""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    value_type = Column(String)  # string, int, bool, json
    description = Column(String, nullable=True)