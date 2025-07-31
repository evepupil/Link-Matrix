from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime

from app.models.models import BrowserProfile, Proxy
from app.models.schemas import BrowserProfileCreate, BrowserProfileUpdate
from app.core.config import settings

# 获取所有浏览器配置
def get_browser_profiles(db: Session) -> List[BrowserProfile]:
    return db.query(BrowserProfile).all()

# 获取单个浏览器配置
def get_browser_profile(db: Session, profile_id: int) -> Optional[BrowserProfile]:
    return db.query(BrowserProfile).filter(BrowserProfile.id == profile_id).first()

# 创建浏览器配置
def create_browser_profile(db: Session, profile: BrowserProfileCreate) -> BrowserProfile:
    # 检查 proxy_id
    proxy = None
    if profile.proxy_id is not None:
        proxy = db.query(Proxy).filter(Proxy.id == profile.proxy_id).first()
        if not proxy:
            raise ValueError(f"代理IP不存在: ID {profile.proxy_id}")
    # 生成存储路径
    storage_dir = os.path.join(settings.BROWSER_PROFILES_DIR, f"profile_{profile.name}")
    os.makedirs(storage_dir, exist_ok=True)
    storage_path = os.path.join(storage_dir, "storage_state.json")
    db_profile = BrowserProfile(
        name=profile.name,
        user_agent=profile.user_agent,
        screen_width=profile.screen_width,
        screen_height=profile.screen_height,
        storage_path=storage_path,
        proxy_id=profile.proxy_id
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# 更新浏览器配置
def update_browser_profile(db: Session, profile_id: int, profile: BrowserProfileUpdate) -> BrowserProfile:
    db_profile = get_browser_profile(db, profile_id)
    if profile.name is not None:
        db_profile.name = profile.name
    if profile.user_agent is not None:
        db_profile.user_agent = profile.user_agent
    if profile.screen_width is not None:
        db_profile.screen_width = profile.screen_width
    if profile.screen_height is not None:
        db_profile.screen_height = profile.screen_height
    if profile.proxy_id is not None:
        proxy = db.query(Proxy).filter(Proxy.id == profile.proxy_id).first()
        if not proxy:
            raise ValueError(f"代理IP不存在: ID {profile.proxy_id}")
        db_profile.proxy_id = profile.proxy_id
    db_profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_profile)
    return db_profile

# 删除浏览器配置
def delete_browser_profile(db: Session, profile_id: int) -> None:
    db_profile = get_browser_profile(db, profile_id)
    # 删除存储状态文件夹
    if db_profile.storage_path:
        storage_dir = os.path.dirname(db_profile.storage_path)
        if os.path.exists(storage_dir):
            try:
                for f in os.listdir(storage_dir):
                    os.remove(os.path.join(storage_dir, f))
                os.rmdir(storage_dir)
            except Exception:
                pass
    db.delete(db_profile)
    db.commit()