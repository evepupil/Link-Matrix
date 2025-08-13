"""
数据库会话管理
使用Supabase客户端进行数据库操作
"""
from app.core.config import settings
from app.core.logger import get_logger
from app.database.supabase_client import get_supabase_client

logger = get_logger(__name__)

def get_db():
    """获取Supabase数据库客户端"""
    if not settings.is_using_supabase:
        raise RuntimeError("必须配置Supabase数据库")
    
    client = get_supabase_client()
    if not client:
        raise RuntimeError("无法获取Supabase客户端")
    
    return client

def get_supabase_db():
    """获取Supabase数据库会话"""
    return get_db()
