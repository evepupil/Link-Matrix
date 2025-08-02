from typing import Type
from pathlib import Path

from .base import BrowserAutomationBase
from .douyin import DouyinAutomation
from app.core.logger import get_logger, log_exception, log_function_call
# 导入其他平台的自动化类
# from .kuaishou import KuaishouAutomation
# from .weibo import WeiboAutomation
# from .bilibili import BilibiliAutomation

logger = get_logger(__name__)

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
    @log_function_call
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
        logger.info(f"开始创建自动化实例，平台: {platform}")
        logger.debug(f"存储路径: {storage_state_path}")
        logger.debug(f"代理配置: {proxy}")
        logger.debug(f"用户代理: {user_agent}")
        logger.debug(f"视窗大小: {viewport_size}")
        
        try:
            platform_lower = platform.lower()
            
            if platform_lower not in cls._platforms:
                supported_platforms = ", ".join(cls._platforms.keys())
                error_msg = f"不支持的平台: {platform}。支持的平台: {supported_platforms}"
                logger.error(error_msg)
                raise ValueError(error_msg)
            
            automation_class = cls._platforms[platform_lower]
            logger.debug(f"使用自动化类: {automation_class.__name__}")
            
            instance = automation_class(
                platform=platform_lower,
                storage_state_path=storage_state_path,
                proxy=proxy,
                user_agent=user_agent,
                viewport_size=viewport_size
            )
            
            logger.info(f"自动化实例创建成功，平台: {platform}")
            return instance
            
        except Exception as e:
            log_exception(logger, e, f"创建自动化实例失败，平台: {platform}")
            raise
    
    @classmethod
    def get_supported_platforms(cls) -> list:
        """获取支持的平台列表"""
        platforms = list(cls._platforms.keys())
        logger.debug(f"获取支持的平台列表: {platforms}")
        return platforms
    
    @classmethod
    def register_platform(cls, platform_name: str, automation_class: Type[BrowserAutomationBase]) -> None:
        """
        注册新的平台支持
        
        Args:
            platform_name: 平台名称
            automation_class: 对应的自动化类
        """
        logger.info(f"注册新平台: {platform_name}, 自动化类: {automation_class.__name__}")
        
        try:
            cls._platforms[platform_name.lower()] = automation_class
            logger.info(f"平台注册成功: {platform_name}")
        except Exception as e:
            log_exception(logger, e, f"注册平台失败: {platform_name}")
            raise