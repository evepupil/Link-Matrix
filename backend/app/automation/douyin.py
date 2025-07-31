from typing import Optional, Dict, Any, List
import logging
import asyncio
from pathlib import Path

from .base import BrowserAutomationBase

logger = logging.getLogger(__name__)

class DouyinAutomation(BrowserAutomationBase):
    def __init__(self, platform: str, storage_state_path: str, proxy: dict = None, 
                 user_agent: str = None, viewport_size: dict = None):
        super().__init__(platform, storage_state_path, proxy, user_agent, viewport_size)
        self.base_url = "https://www.douyin.com"
        self.login_url = "https://www.douyin.com/login"
        self.profile_url = "https://www.douyin.com/user"

    def get_login_url(self) -> str:
        """获取抖音登录页面URL"""
        return self.login_url

    async def wait_for_login_completion(self) -> None:
        """等待用户登录完成"""
        logger.info("等待用户在浏览器中完成登录...")
        
        # 等待用户登录完成，检测登录成功的标志
        try:
            # 等待URL变化（从登录页面跳转到主页或个人页面）
            await self.page.wait_for_url(
                lambda url: not url.startswith(self.login_url) and "douyin.com" in url,
                timeout=300000  # 5分钟超时
            )
            
            # 等待一些登录成功的标志元素出现
            await asyncio.wait_for(
                self.page.wait_for_selector('[data-e2e="user-info"]', timeout=10000),
                timeout=10
            )
            
            logger.info("用户登录完成")
            
        except asyncio.TimeoutError:
            logger.warning("登录等待超时，但继续执行")
        except Exception as e:
            logger.error(f"等待登录完成时出错: {e}")

    async def save_login_state(self) -> None:
        """保存登录状态到存储文件"""
        await self._save_storage_state()
        logger.info("抖音登录状态已保存")

    async def check_login_status(self) -> dict:
        """检查登录状态"""
        try:
            # 访问个人中心页面
            await self.page.goto(self.profile_url, wait_until="networkidle")
            
            # 检查是否已登录
            login_indicators = [
                '[data-e2e="user-info"]',  # 用户信息元素
                '.user-info',  # 用户信息类
                '[data-e2e="user-avatar"]',  # 用户头像
                '.login-user-info'  # 登录用户信息
            ]
            
            is_logged_in = False
            user_info = {}
            
            for indicator in login_indicators:
                try:
                    element = await self.page.wait_for_selector(indicator, timeout=5000)
                    if element:
                        is_logged_in = True
                        # 尝试获取用户信息
                        try:
                            username_element = await self.page.wait_for_selector('[data-e2e="user-name"]', timeout=2000)
                            if username_element:
                                user_info["username"] = await username_element.text_content()
                        except:
                            pass
                        break
                except:
                    continue
            
            # 如果上述指标都没找到，检查URL是否包含用户ID
            if not is_logged_in:
                current_url = self.page.url
                if "/user/" in current_url and not current_url.endswith("/user"):
                    is_logged_in = True
            
            # 如果仍然未检测到登录，检查是否有登录按钮
            if not is_logged_in:
                try:
                    login_button = await self.page.wait_for_selector('[data-e2e="login-button"]', timeout=3000)
                    if login_button:
                        is_logged_in = False
                except:
                    pass
            
            return {
                "is_logged_in": is_logged_in,
                "user_info": user_info,
                "current_url": self.page.url
            }
            
        except Exception as e:
            logger.error(f"检查登录状态时出错: {e}")
            return {
                "is_logged_in": False,
                "user_info": {},
                "error": str(e)
            }

    async def login(self, username: str, password: str) -> bool:
        """
        自动登录（保留原有接口，但实际使用手动登录）
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            登录是否成功
        """
        try:
            # 导航到登录页面
            await self.page.goto(self.login_url)
            
            # 等待登录表单加载
            await self.page.wait_for_selector('[data-e2e="login-form"]', timeout=10000)
            
            # 填写用户名
            username_input = await self.page.wait_for_selector('[data-e2e="login-phone-input"]', timeout=5000)
            if username_input:
                await username_input.fill(username)
            
            # 填写密码
            password_input = await self.page.wait_for_selector('[data-e2e="login-password-input"]', timeout=5000)
            if password_input:
                await password_input.fill(password)
            
            # 点击登录按钮
            login_button = await self.page.wait_for_selector('[data-e2e="login-button"]', timeout=5000)
            if login_button:
                await login_button.click()
            
            # 等待登录完成
            await self.wait_for_login_completion()
            
            # 保存登录状态
            await self.save_login_state()
            
            return True
            
        except Exception as e:
            logger.error(f"自动登录失败: {e}")
            return False

    async def publish_video(self, video_path: str, title: str, description: str) -> bool:
        """
        发布视频到抖音
        
        Args:
            video_path: 视频文件路径
            title: 视频标题
            description: 视频描述
            
        Returns:
            发布是否成功
        """
        try:
            # 导航到发布页面
            await self.page.goto("https://www.douyin.com/creator/upload")
            
            # 等待页面加载
            await self.page.wait_for_selector('[data-e2e="upload-area"]', timeout=10000)
            
            # 上传视频文件
            file_input = await self.page.wait_for_selector('input[type="file"]', timeout=5000)
            if file_input:
                await file_input.set_input_files(video_path)
            
            # 等待视频上传完成
            await self.page.wait_for_selector('[data-e2e="upload-progress"]', timeout=60000)
            
            # 填写标题
            title_input = await self.page.wait_for_selector('[data-e2e="title-input"]', timeout=5000)
            if title_input:
                await title_input.fill(title)
            
            # 填写描述
            description_input = await self.page.wait_for_selector('[data-e2e="description-input"]', timeout=5000)
            if description_input:
                await description_input.fill(description)
            
            # 发布视频
            publish_button = await self.page.wait_for_selector('[data-e2e="publish-button"]', timeout=5000)
            if publish_button:
                await publish_button.click()
            
            # 等待发布完成
            await self.page.wait_for_selector('[data-e2e="publish-success"]', timeout=30000)
            
            logger.info(f"视频 '{title}' 发布成功")
            return True
            
        except Exception as e:
            logger.error(f"发布视频失败: {e}")
            return False