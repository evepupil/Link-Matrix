from typing import Optional, Dict, Any, List
import asyncio
from pathlib import Path

from .base import BrowserAutomationBase
from app.core.logger import get_logger, log_exception, log_function_call

logger = get_logger(__name__)

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

    @log_function_call(logger)
    async def wait_for_login_completion(self) -> None:
        """等待用户登录完成"""
        logger.info("等待用户在浏览器中完成抖音登录...")
        
        try:
            # 等待URL变化（从登录页面跳转到主页或个人页面）
            logger.debug("等待URL变化，检测登录状态")
            await self.page.wait_for_url(
                lambda url: not url.startswith(self.login_url) and "douyin.com" in url,
                timeout=300000  # 5分钟超时
            )
            
            # 等待一些登录成功的标志元素出现
            logger.debug("等待用户信息元素出现")
            await asyncio.wait_for(
                self.page.wait_for_selector('[data-e2e="user-info"]', timeout=10000),
                timeout=10
            )
            
            logger.info("用户抖音登录完成")
            
        except asyncio.TimeoutError:
            logger.warning("抖音登录等待超时，但继续执行")
        except Exception as e:
            log_exception(logger, e, "等待抖音登录完成时出错")

    @log_function_call(logger)
    async def save_login_state(self) -> None:
        """保存登录状态到存储文件"""
        logger.info("开始保存抖音登录状态")
        try:
            await self._save_storage_state()
            logger.info("抖音登录状态保存成功")
        except Exception as e:
            log_exception(logger, e, "保存抖音登录状态失败")
            raise

    @log_function_call(logger)
    async def check_login_status(self) -> dict:
        """检查登录状态"""
        logger.info("开始检查抖音登录状态")
        
        try:
            # 访问个人中心页面
            logger.debug(f"访问个人中心页面: {self.profile_url}")
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
            
            logger.debug("检查登录指示器元素")
            for indicator in login_indicators:
                try:
                    element = await self.page.wait_for_selector(indicator, timeout=5000)
                    if element:
                        is_logged_in = True
                        logger.debug(f"找到登录指示器: {indicator}")
                        # 尝试获取用户信息
                        try:
                            username_element = await self.page.wait_for_selector('[data-e2e="user-name"]', timeout=2000)
                            if username_element:
                                user_info["username"] = await username_element.text_content()
                                logger.debug(f"获取到用户名: {user_info['username']}")
                        except:
                            pass
                        break
                except:
                    continue
            
            # 如果上述指标都没找到，检查URL是否包含用户ID
            if not is_logged_in:
                current_url = self.page.url
                logger.debug(f"检查当前URL: {current_url}")
                if "/user/" in current_url and not current_url.endswith("/user"):
                    is_logged_in = True
                    logger.debug("通过URL检测到已登录")
            
            # 如果仍然未检测到登录，检查是否有登录按钮
            if not is_logged_in:
                try:
                    login_button = await self.page.wait_for_selector('[data-e2e="login-button"]', timeout=3000)
                    if login_button:
                        is_logged_in = False
                        logger.debug("检测到登录按钮，用户未登录")
                except:
                    pass
            
            result = {
                "is_logged_in": is_logged_in,
                "user_info": user_info,
                "current_url": self.page.url
            }
            
            logger.info(f"抖音登录状态检查完成: {'已登录' if is_logged_in else '未登录'}")
            return result
            
        except Exception as e:
            log_exception(logger, e, "检查抖音登录状态时出错")
            return {
                "is_logged_in": False,
                "user_info": {},
                "error": str(e)
            }

    @log_function_call(logger)
    async def login(self, username: str, password: str) -> bool:
        """
        自动登录（保留原有接口，但实际使用手动登录）
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            登录是否成功
        """
        logger.info(f"开始抖音自动登录，用户名: {username}")
        
        try:
            # 导航到登录页面
            logger.debug(f"导航到登录页面: {self.login_url}")
            await self.page.goto(self.login_url)
            
            # 等待登录表单加载
            logger.debug("等待登录表单加载")
            await self.page.wait_for_selector('[data-e2e="login-form"]', timeout=10000)
            
            # 填写用户名
            logger.debug("填写用户名")
            username_input = await self.page.wait_for_selector('[data-e2e="login-phone-input"]', timeout=5000)
            if username_input:
                await username_input.fill(username)
                logger.debug("用户名填写完成")
            else:
                logger.warning("未找到用户名输入框")
            
            # 填写密码
            logger.debug("填写密码")
            password_input = await self.page.wait_for_selector('[data-e2e="login-password-input"]', timeout=5000)
            if password_input:
                await password_input.fill(password)
                logger.debug("密码填写完成")
            else:
                logger.warning("未找到密码输入框")
            
            # 点击登录按钮
            logger.debug("点击登录按钮")
            login_button = await self.page.wait_for_selector('[data-e2e="login-button"]', timeout=5000)
            if login_button:
                await login_button.click()
                logger.debug("登录按钮点击完成")
            else:
                logger.warning("未找到登录按钮")
            
            # 等待登录完成
            logger.debug("等待登录完成")
            await self.wait_for_login_completion()
            
            # 保存登录状态
            logger.debug("保存登录状态")
            await self.save_login_state()
            
            logger.info("抖音自动登录成功")
            return True
            
        except Exception as e:
            log_exception(logger, e, "抖音自动登录失败")
            return False

    @log_function_call(logger)
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
        logger.info(f"开始发布视频到抖音，标题: {title}")
        logger.debug(f"视频路径: {video_path}")
        
        try:
            # 导航到发布页面
            publish_url = "https://www.douyin.com/creator/upload"
            logger.debug(f"导航到发布页面: {publish_url}")
            await self.page.goto(publish_url)
            
            # 等待页面加载
            logger.debug("等待上传区域加载")
            await self.page.wait_for_selector('[data-e2e="upload-area"]', timeout=10000)
            
            # 上传视频文件
            logger.debug("查找文件上传输入框")
            file_input = await self.page.wait_for_selector('input[type="file"]', timeout=5000)
            if file_input:
                logger.debug(f"开始上传视频文件: {video_path}")
                await file_input.set_input_files(video_path)
                logger.debug("视频文件上传完成")
            else:
                logger.warning("未找到文件上传输入框")
            
            # 等待视频上传完成
            logger.debug("等待视频上传进度完成")
            await self.page.wait_for_selector('[data-e2e="upload-progress"]', timeout=60000)
            
            # 填写标题
            logger.debug("填写视频标题")
            title_input = await self.page.wait_for_selector('[data-e2e="title-input"]', timeout=5000)
            if title_input:
                await title_input.fill(title)
                logger.debug("视频标题填写完成")
            else:
                logger.warning("未找到标题输入框")
            
            # 填写描述
            logger.debug("填写视频描述")
            description_input = await self.page.wait_for_selector('[data-e2e="description-input"]', timeout=5000)
            if description_input:
                await description_input.fill(description)
                logger.debug("视频描述填写完成")
            else:
                logger.warning("未找到描述输入框")
            
            # 发布视频
            logger.debug("点击发布按钮")
            publish_button = await self.page.wait_for_selector('[data-e2e="publish-button"]', timeout=5000)
            if publish_button:
                await publish_button.click()
                logger.debug("发布按钮点击完成")
            else:
                logger.warning("未找到发布按钮")
            
            # 等待发布完成
            logger.debug("等待发布完成")
            await self.page.wait_for_selector('[data-e2e="publish-success"]', timeout=30000)
            
            logger.info(f"视频 '{title}' 发布成功")
            return True
            
        except Exception as e:
            log_exception(logger, e, f"发布视频 '{title}' 失败")
            return False