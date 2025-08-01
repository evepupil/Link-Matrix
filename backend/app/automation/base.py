from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from abc import ABC, abstractmethod
import os
import json

from app.core.logger import get_logger, log_exception, log_function_call

logger = get_logger(__name__)

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

    @log_function_call(logger)
    async def start(self, headless: bool = True) -> None:
        """启动浏览器实例"""
        logger.info(f"开始启动浏览器实例 - 平台: {self.platform}, 无头模式: {headless}")
        
        try:
            self.playwright = await async_playwright().start()
            logger.debug("Playwright 启动成功")
            
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
                logger.debug(f"使用代理配置: {self.proxy}")
            
            # 准备上下文选项
            context_options = {
                "viewport": self.viewport_size,
                "user_agent": self.user_agent or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            logger.debug(f"浏览器视窗大小: {self.viewport_size}")
            
            # 如果存在存储状态文件，则加载
            if os.path.exists(self.storage_state_path):
                context_options["storage_state"] = self.storage_state_path
                logger.info(f"加载存储状态: {self.storage_state_path}")
            else:
                logger.debug(f"存储状态文件不存在: {self.storage_state_path}")
            
            # 启动浏览器
            self.browser = await self.playwright.chromium.launch(**launch_options)
            logger.debug("浏览器启动成功")
            
            self.context = await self.browser.new_context(**context_options)
            logger.debug("浏览器上下文创建成功")
            
            self.page = await self.context.new_page()
            logger.debug("浏览器页面创建成功")
            
            logger.info(f"浏览器启动完成 - 平台: {self.platform}, 无头模式: {headless}")
            
        except Exception as e:
            log_exception(logger, e, f"启动浏览器失败 - 平台: {self.platform}")
            raise

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

    @log_function_call(logger)
    async def close(self) -> None:
        """关闭浏览器"""
        logger.info(f"开始关闭浏览器 - 平台: {self.platform}")
        
        try:
            if self.page:
                await self.page.close()
                logger.debug("浏览器页面已关闭")
            if self.context:
                await self.context.close()
                logger.debug("浏览器上下文已关闭")
            if self.browser:
                await self.browser.close()
                logger.debug("浏览器实例已关闭")
            if self.playwright:
                await self.playwright.stop()
                logger.debug("Playwright 已停止")
            
            logger.info(f"浏览器关闭完成 - 平台: {self.platform}")
            
        except Exception as e:
            log_exception(logger, e, f"关闭浏览器时出错 - 平台: {self.platform}")

    @log_function_call(logger)
    async def _save_storage_state(self) -> None:
        """保存浏览器存储状态"""
        logger.debug(f"开始保存存储状态: {self.storage_state_path}")
        
        try:
            if self.context:
                # 确保目录存在
                os.makedirs(os.path.dirname(self.storage_state_path), exist_ok=True)
                await self.context.storage_state(path=self.storage_state_path)
                logger.info(f"存储状态保存成功: {self.storage_state_path}")
            else:
                logger.warning("浏览器上下文不存在，无法保存存储状态")
                
        except Exception as e:
            log_exception(logger, e, f"保存存储状态失败: {self.storage_state_path}")
            raise

    @log_function_call(logger)
    async def _load_storage_state(self) -> bool:
        """加载浏览器存储状态"""
        logger.debug(f"开始加载存储状态: {self.storage_state_path}")
        
        if os.path.exists(self.storage_state_path):
            try:
                await self.context.storage_state(path=self.storage_state_path)
                logger.info(f"存储状态加载成功: {self.storage_state_path}")
                return True
            except Exception as e:
                log_exception(logger, e, f"加载存储状态失败: {self.storage_state_path}")
                return False
        else:
            logger.debug(f"存储状态文件不存在: {self.storage_state_path}")
            return False