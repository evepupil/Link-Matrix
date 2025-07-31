from typing import Type
import logging
from pathlib import Path

from .base import BrowserAutomationBase
from .douyin import DouyinAutomation
# 导入其他平台的自动化类
# from .kuaishou import KuaishouAutomation
# from .weibo import WeiboAutomation
# from .bilibili import BilibiliAutomation

logger = logging.getLogger(__name__)

class AutomationFactory:
    """自动化工厂类，用于创建不同平台的自动化实例"""
    
    _platforms = {
        "douyin": DouyinAutomation,
        # 添加其他平台支持
        # "kuaishou": KuaishouAutomation,
        # "weibo": WeiboAutomation,
        # "bilibili": BilibiliAutomation,
    }
    
    @classmethod
    def create(cls, platform: str, storage_state_path: str, proxy: dict = None,
               user_agent: str = None, viewport_size: dict = None) -> BrowserAutomationBase:
        """
        创建自动化实例
        
        Args:
            platform: 平台名称（如 "douyin", "kuaishou" 等）
            storage_state_path: 浏览器状态存储路径
            proxy: 代理配置
            user_agent: 用户代理字符串
            viewport_size: 浏览器视窗大小
            
        Returns:
            对应平台的自动化实例
            
        Raises:
            ValueError: 当平台不支持时抛出
        """
        platform_lower = platform.lower()
        
        if platform_lower not in cls._platforms:
            supported_platforms = ", ".join(cls._platforms.keys())
            raise ValueError(f"不支持的平台: {platform}。支持的平台: {supported_platforms}")
        
        automation_class = cls._platforms[platform_lower]
        
        return automation_class(
            platform=platform_lower,
            storage_state_path=storage_state_path,
            proxy=proxy,
            user_agent=user_agent,
            viewport_size=viewport_size
        )
    
    @classmethod
    def get_supported_platforms(cls) -> list:
        """获取支持的平台列表"""
        return list(cls._platforms.keys())
    
    @classmethod
    def register_platform(cls, platform_name: str, automation_class: Type[BrowserAutomationBase]) -> None:
        """
        注册新的平台支持
        
        Args:
            platform_name: 平台名称
            automation_class: 对应的自动化类
        """
        cls._platforms[platform_name.lower()] = automation_class