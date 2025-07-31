from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from abc import ABC, abstractmethod
import logging
import os
import json

logger = logging.getLogger(__name__)

class BrowserAutomationBase(ABC):
    def __init__(self, platform: str, storage_state_path: str, proxy: dict = None, 
                 user_agent: str = None, viewport_size: dict = None):
        self.platform = platform
        self.storage_state_path = storage_state_path
        self.proxy = proxy
        self.user_agent = user_agent
        self.viewport_size = viewport_size or {"width": 1920, "height": 1080}
        
        self.browser: Browser = None
        self.context: BrowserContext = None
        self.page: Page = None
        self.playwright = None

    async def start(self, headless: bool = True) -> None:
        """启动浏览器实例"""
        self.playwright = await async_playwright().start()
        
        # 准备启动选项
        launch_options = {
            "headless": headless,
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor"
            ]
        }
        
        # 添加代理配置
        if self.proxy:
            launch_options["proxy"] = self.proxy
        
        # 准备上下文选项
        context_options = {
            "viewport": self.viewport_size,
            "user_agent": self.user_agent or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # 如果存在存储状态文件，则加载
        if os.path.exists(self.storage_state_path):
            context_options["storage_state"] = self.storage_state_path
            logger.info(f"加载存储状态: {self.storage_state_path}")
        
        # 启动浏览器
        self.browser = await self.playwright.chromium.launch(**launch_options)
        self.context = await self.browser.new_context(**context_options)
        self.page = await self.context.new_page()
        
        logger.info(f"浏览器启动成功 - 平台: {self.platform}, 无头模式: {headless}")

    @abstractmethod
    def get_login_url(self) -> str:
        """获取登录页面URL"""
        pass

    @abstractmethod
    async def wait_for_login_completion(self) -> None:
        """等待用户登录完成"""
        pass

    @abstractmethod
    async def save_login_state(self) -> None:
        """保存登录状态到存储文件"""
        pass

    @abstractmethod
    async def check_login_status(self) -> dict:
        """检查登录状态"""
        pass

    @abstractmethod
    async def login(self, username: str, password: str) -> bool:
        """自动登录（保留原有接口）"""
        pass

    @abstractmethod
    async def publish_video(self, video_path: str, title: str, description: str) -> bool:
        """发布视频"""
        pass

    async def close(self) -> None:
        """关闭浏览器"""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        
        logger.info("浏览器已关闭")

    async def _save_storage_state(self) -> None:
        """保存浏览器存储状态"""
        if self.context:
            # 确保目录存在
            os.makedirs(os.path.dirname(self.storage_state_path), exist_ok=True)
            await self.context.storage_state(path=self.storage_state_path)
            logger.info(f"存储状态已保存: {self.storage_state_path}")

    async def _load_storage_state(self) -> bool:
        """加载浏览器存储状态"""
        if os.path.exists(self.storage_state_path):
            try:
                await self.context.storage_state(path=self.storage_state_path)
                logger.info(f"存储状态已加载: {self.storage_state_path}")
                return True
            except Exception as e:
                logger.error(f"加载存储状态失败: {e}")
                return False
        return False