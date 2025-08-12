"""
Supabase客户端配置
用于直接与Supabase API交互的场景
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional

class SupabaseClient:
    """Supabase客户端单例"""
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Optional[Client]:
        """获取Supabase客户端实例"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            return None
            
        if cls._instance is None:
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        return cls._instance
    
    @classmethod
    def is_available(cls) -> bool:
        """检查Supabase是否可用"""
        return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)

# 便捷函数
def get_supabase_client() -> Optional[Client]:
    """获取Supabase客户端"""
    return SupabaseClient.get_client()