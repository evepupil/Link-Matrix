from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# 基础响应模型
class BaseResponse(BaseModel):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# 账户模型
class AccountBase(BaseModel):
    platform: str
    name: str
    username: str
    browser_profile_id: int

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    browser_profile_id: Optional[int] = None
    status: Optional[str] = None

class Account(BaseResponse, AccountBase):
    last_login: Optional[datetime] = None
    status: str
    storage_path: Optional[str] = None

class AccountResponse(BaseResponse, AccountBase):
    last_login: datetime
    status: str
    storage_path: Optional[str] = None
    browser_profile_id: int

# 浏览器配置模型
class BrowserProfileBase(BaseModel):
    name: str
    user_agent: Optional[str] = None
    screen_width: Optional[int] = 1920
    screen_height: Optional[int] = 1080
    proxy_id: Optional[int] = None

class BrowserProfileCreate(BrowserProfileBase):
    pass

class BrowserProfileUpdate(BaseModel):
    name: Optional[str] = None
    user_agent: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    proxy_id: Optional[int] = None

class BrowserProfile(BaseResponse, BrowserProfileBase):
    storage_path: str

class BrowserProfileResponse(BaseResponse, BrowserProfileBase):
    storage_path: str

# 代理IP模型
class ProxyBase(BaseModel):
    name: str
    protocol: str
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None

class ProxyCreate(ProxyBase):
    pass

class ProxyUpdate(BaseModel):
    name: Optional[str] = None
    protocol: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None

class Proxy(BaseResponse, ProxyBase):
    is_available: bool
    last_checked: Optional[datetime] = None

class ProxyResponse(BaseResponse, ProxyBase):
    is_available: bool
    last_checked: datetime

# 任务模型
class TaskBase(BaseModel):
    task_type: str
    status: str
    progress: int = 0
    error_message: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    error_message: Optional[str] = None

class TaskLog(BaseModel):
    id: int
    task_id: int
    level: str
    message: str
    timestamp: datetime

    class Config:
        orm_mode = True

class TaskResponse(BaseResponse, TaskBase):
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# 发布任务模型
class PublishTaskBase(BaseModel):
    content_type: str
    title: str
    description: Optional[str] = None
    tags: Optional[str] = None

class PublishTaskCreate(PublishTaskBase):
    account_ids: List[int]
    file_path: Optional[str] = None
    cover_image_path: Optional[str] = None

class PublishTaskResponse(BaseModel):
    id: int
    task_id: int
    content_type: str
    title: str
    description: Optional[str] = None
    tags: Optional[str] = None
    file_path: Optional[str] = None
    cover_image_path: Optional[str] = None
    accounts: List[Dict[str, Any]]
    task: TaskResponse

    class Config:
        orm_mode = True

# 视频翻译模型
class VideoTranslationCreate(BaseModel):
    target_language: str

class VideoTranslationResponse(BaseModel):
    id: int
    task_id: int
    original_video_path: str
    target_language: str
    transcript_path: Optional[str] = None
    translation_path: Optional[str] = None
    subtitle_path: Optional[str] = None
    output_video_path: Optional[str] = None
    task: TaskResponse

    class Config:
        orm_mode = True

# 字幕设置模型
class SubtitleSettings(BaseModel):
    font: Optional[str] = "Arial"
    font_size: Optional[int] = 24
    font_color: Optional[str] = "white"
    background_color: Optional[str] = "black"
    position: Optional[str] = "bottom"  # top, middle, bottom

# 视频转文本响应
class VideoToTextResponse(BaseModel):
    id: int
    task_id: int
    original_video_path: str
    transcript_path: str
    task: TaskResponse

    class Config:
        orm_mode = True

# 系统设置模型
class SystemSettings(BaseModel):
    ffmpeg_path: Optional[str] = None
    ai_api_key: Optional[str] = None
    log_level: str = "INFO"
    storage_path: Optional[str] = None
    proxy_selection_strategy: str = "random"  # random, sequential

    class Config:
        orm_mode = True

# 微信公众号API账户模型
class ApiAccountWxBase(BaseModel):
    name: str
    appid: str
    app_secret: str
    wx_id: str
    title: str
    author: str
    thumb_media_id: Optional[str] = None
    illust_tag: Optional[List[List[str]]] = None

class ApiAccountWxCreate(ApiAccountWxBase):
    pass

class ApiAccountWxUpdate(BaseModel):
    name: Optional[str] = None
    app_secret: Optional[str] = None
    wx_id: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    thumb_media_id: Optional[str] = None
    illust_tag: Optional[List[List[str]]] = None
    status: Optional[str] = None

class ApiAccountWx(BaseResponse, ApiAccountWxBase):
    status: str

class ApiAccountWxResponse(BaseResponse, ApiAccountWxBase):
    status: str