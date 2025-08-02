from .base import BrowserAutomationBase
from app.core.logger import logger, log_function_call, log_exception
import asyncio

class ExamplePlatformAutomation(BrowserAutomationBase):
    def __init__(self, platform: str, storage_state_path: str, proxy: dict = None, 
                 user_agent: str = None, viewport_size: dict = None):
        super().__init__(platform, storage_state_path, proxy, user_agent, viewport_size)
        self.base_url = "https://www.bilibili.com/"
        self.login_url = "https://www.bilibili.com/"
        self.profile_url = "https://space.bilibili.com"
        self.upload_video_url = "https://member.bilibili.com/platform/upload/video/frame"

    @log_function_call(logger)
    def get_login_url(self) -> str:
        """
        获取平台登录页面URL
        """
        logger.debug(f"获取登录URL: {self.login_url}")
        return self.login_url

    @log_function_call(logger)
    async def wait_for_login_completion(self) -> None:
        """
        等待用户在有头浏览器中手动完成登录
        用户关闭浏览器后即认为登录完成
        """
        logger.info("等待用户在浏览器中完成登录...")
        logger.info("请在浏览器中完成登录操作，完成后直接关闭浏览器窗口")
        
        try:
            # 等待浏览器被用户关闭
            await self.page.wait_for_event('close', timeout=600000)  # 最长等待10分钟
            logger.info("检测到浏览器已关闭，认为用户登录完成")
        except asyncio.TimeoutError:
            logger.warning("等待浏览器关闭超时，但继续执行")
        except Exception as e:
            log_exception(logger, e, "等待登录完成时出错")

    @log_function_call(logger)
    async def save_login_state(self) -> None:
        """
        保存当前浏览器的登录状态到存储文件
        """
        logger.info("开始保存登录状态")
        try:
            await self._save_storage_state()
            logger.info("登录状态已保存")
        except Exception as e:
            log_exception(logger, e, "保存登录状态失败")
            raise

    @log_function_call(logger)
    async def check_login_status(self) -> dict:
        """
        检查当前存储状态下是否已登录
        你可以通过访问个人中心页面，查找用户信息元素等方式判断
        """
        logger.info("开始检查登录状态")
        
        try:
            logger.debug(f"访问个人中心页面: {self.profile_url}")
            await self.page.goto(self.profile_url, wait_until="networkidle")
            
            # 检查是否有用户信息元素
            is_logged_in = False
            user_info = {}
            
            logger.debug("检查用户信息元素")
            try:
                element = await self.page.wait_for_selector('.nickname', timeout=5000)
                if element:
                    is_logged_in = True
                    user_info["username"] = await element.text_content()
                    logger.debug(f"获取到用户名: {user_info['username']}")
            except:
                logger.debug("未找到用户信息元素")
                pass
                
            result = {
                "is_logged_in": is_logged_in,
                "user_info": user_info,
                "current_url": self.page.url
            }
            
            logger.info(f"登录状态检查完成: {'已登录' if is_logged_in else '未登录'}")
            return result
            
        except Exception as e:
            log_exception(logger, e, "检查登录状态时出错")
            return {
                "is_logged_in": False,
                "user_info": {},
                "error": str(e)
            }


    @log_function_call(logger)
    async def publish_video(self, video_path: str, title: str, description: str) -> bool:
        """
        自动化发布视频
        """
        logger.info(f"开始发布视频，标题: {title}")
        logger.debug(f"视频路径: {video_path}")
        
        try:
            # 1. 跳转到视频发布页面
            logger.debug(f"导航到视频发布页面: {self.upload_video_url}")
            await self.page.goto(self.upload_video_url, wait_until="networkidle")
            
            # 2. 上传视频文件
            logger.debug("查找文件上传控件")
            file_input = await self.page.wait_for_selector('input[type="file"]', timeout=10000)
            if file_input:
                logger.debug(f"开始上传视频文件: {video_path}")
                await file_input.set_input_files(video_path)
                logger.debug("视频文件上传完成")
            else:
                logger.error("未找到视频上传控件")
                return False
                
            # 3. 填写标题
            logger.debug("填写视频标题")
            await self.page.fill('input[name="title"]', title)
            
            # 4. 填写描述
            logger.debug("填写视频描述")
            await self.page.fill('textarea[name="description"]', description)
            
            # 5. 点击发布按钮
            logger.debug("点击发布按钮")
            await self.page.click('button[type="submit"]')
            
            # 6. 等待发布成功提示
            logger.debug("等待发布成功提示")
            await self.page.wait_for_selector('.publish-success', timeout=30000)
            
            logger.info(f"视频《{title}》发布成功")
            return True
            
        except Exception as e:
            log_exception(logger, e, f"发布视频《{title}》失败")
            return False

    @log_function_call(logger)
    async def publish_article(self, title: str, content: str) -> bool:
        """
        自动化发布文章
        """
        logger.info(f"开始发布文章，标题: {title}")
        
        try:
            # 1. 跳转到文章发布页面
            article_url = f"{self.base_url}/article/new"
            logger.debug(f"导航到文章发布页面: {article_url}")
            await self.page.goto(article_url, wait_until="networkidle")
            
            # 2. 填写标题
            logger.debug("填写文章标题")
            await self.page.fill('input[name="article_title"]', title)
            
            # 3. 填写正文内容
            logger.debug("填写文章内容")
            await self.page.fill('textarea[name="content"]', content)
            
            # 4. 点击发布按钮
            logger.debug("点击发布按钮")
            await self.page.click('button[type="submit"]')
            
            # 5. 等待发布成功提示
            logger.debug("等待发布成功提示")
            await self.page.wait_for_selector('.publish-success', timeout=30000)
            
            logger.info(f"文章《{title}》发布成功")
            return True
            
        except Exception as e:
            log_exception(logger, e, f"发布文章《{title}》失败")
            return False