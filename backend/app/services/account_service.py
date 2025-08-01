from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import asyncio
from playwright.async_api import async_playwright

from app.models.models import Account, BrowserProfile
from app.models.schemas import AccountCreate, AccountUpdate
from app.automation.factory import AutomationFactory
from app.core.config import settings
from app.core.logger import get_logger, log_exception, log_function_call

logger = get_logger(__name__)

@log_function_call
def get_accounts(db: Session) -> List[Account]:
    """
    获取所有账户列表
    
    Args:
        db: 数据库会话
        
    Returns:
        账户列表
    """
    logger.debug("开始获取所有账户列表")
    
    try:
        accounts = db.query(Account).all()
        logger.info(f"成功获取 {len(accounts)} 个账户")
        return accounts
    except Exception as e:
        log_exception(logger, e, "获取账户列表失败")
        raise

@log_function_call
def get_account(db: Session, account_id: int) -> Optional[Account]:
    """
    获取特定账户详情
    
    Args:
        db: 数据库会话
        account_id: 账户ID
        
    Returns:
        账户对象或None
    """
    logger.debug(f"开始获取账户详情，ID: {account_id}")
    
    try:
        account = db.query(Account).filter(Account.id == account_id).first()
        if account:
            logger.debug(f"成功获取账户: {account.username}@{account.platform}")
        else:
            logger.warning(f"账户不存在，ID: {account_id}")
        return account
    except Exception as e:
        log_exception(logger, e, f"获取账户详情失败，ID: {account_id}")
        raise

@log_function_call
def create_account(db: Session, account: AccountCreate) -> Account:
    """
    创建新账户
    
    Args:
        db: 数据库会话
        account: 账户创建模型
        
    Returns:
        创建的账户对象
    """
    logger.info(f"开始创建账户: {account.username}@{account.platform}")
    
    try:
        # 检查浏览器配置是否存在
        logger.debug(f"检查浏览器配置，ID: {account.browser_profile_id}")
        browser_profile = db.query(BrowserProfile).filter(BrowserProfile.id == account.browser_profile_id).first()
        if not browser_profile:
            error_msg = f"浏览器配置不存在: ID {account.browser_profile_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 创建存储路径
        storage_dir = os.path.join(settings.BROWSER_PROFILES_DIR, f"account_{account.platform}_{account.username}")
        logger.debug(f"创建存储目录: {storage_dir}")
        os.makedirs(storage_dir, exist_ok=True)
        storage_path = os.path.join(storage_dir, "storage_state.json")
        
        # 创建账户记录
        db_account = Account(
            platform=account.platform,
            name=account.name,
            username=account.username,
            browser_profile_id=account.browser_profile_id,
            storage_path=storage_path,
            status="inactive",  # 初始状态为未激活，需要登录后才变为active
        )
        
        db.add(db_account)
        db.commit()
        db.refresh(db_account)
        
        logger.info(f"账户创建成功: {db_account.username}@{db_account.platform}, ID: {db_account.id}")
        return db_account
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"创建账户失败: {account.username}@{account.platform}")
        raise

@log_function_call
def update_account(db: Session, account_id: int, account: AccountUpdate) -> Account:
    """
    更新账户信息
    
    Args:
        db: 数据库会话
        account_id: 账户ID
        account: 账户更新模型
        
    Returns:
        更新后的账户对象
    """
    logger.info(f"开始更新账户，ID: {account_id}")
    
    try:
        db_account = get_account(db, account_id)
        if not db_account:
            error_msg = f"账户不存在，ID: {account_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 更新浏览器配置关联
        if account.browser_profile_id is not None:
            logger.debug(f"更新浏览器配置，新ID: {account.browser_profile_id}")
            browser_profile = db.query(BrowserProfile).filter(BrowserProfile.id == account.browser_profile_id).first()
            if not browser_profile:
                error_msg = f"浏览器配置不存在: ID {account.browser_profile_id}"
                logger.error(error_msg)
                raise ValueError(error_msg)
            db_account.browser_profile_id = account.browser_profile_id
        
        # 更新其他字段
        if account.name is not None:
            logger.debug(f"更新账户名称: {account.name}")
            db_account.name = account.name
        
        if account.status is not None:
            logger.debug(f"更新账户状态: {account.status}")
            db_account.status = account.status
        
        db_account.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_account)
        
        logger.info(f"账户更新成功: {db_account.username}@{db_account.platform}")
        return db_account
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"更新账户失败，ID: {account_id}")
        raise

@log_function_call
def delete_account(db: Session, account_id: int) -> None:
    """
    删除账户
    
    Args:
        db: 数据库会话
        account_id: 账户ID
    """
    logger.info(f"开始删除账户，ID: {account_id}")
    
    try:
        db_account = get_account(db, account_id)
        if not db_account:
            error_msg = f"账户不存在，ID: {account_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 删除存储状态文件
        if db_account.storage_path and os.path.exists(db_account.storage_path):
            try:
                logger.debug(f"删除存储文件: {db_account.storage_path}")
                os.remove(db_account.storage_path)
                # 尝试删除父目录
                parent_dir = os.path.dirname(db_account.storage_path)
                if os.path.exists(parent_dir) and not os.listdir(parent_dir):
                    logger.debug(f"删除空目录: {parent_dir}")
                    os.rmdir(parent_dir)
            except Exception as e:
                log_exception(logger, e, f"删除账户存储文件失败: {db_account.storage_path}")
        
        # 删除数据库记录
        username = db_account.username
        platform = db_account.platform
        db.delete(db_account)
        db.commit()
        
        logger.info(f"账户删除成功: {username}@{platform}")
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"删除账户失败，ID: {account_id}")
        raise

async def activate_account(db: Session, account_id: int) -> Account:
    """
    激活账户 - 启动有头浏览器让用户手动登录
    
    Args:
        db: 数据库会话
        account_id: 账户ID
        
    Returns:
        更新后的账户对象
    """
    db_account = get_account(db, account_id)
    if not db_account:
        raise ValueError(f"账户不存在: ID {account_id}")
    
    browser_profile = db.query(BrowserProfile).filter(BrowserProfile.id == db_account.browser_profile_id).first()
    if not browser_profile:
        raise ValueError(f"浏览器配置不存在: ID {db_account.browser_profile_id}")
    
    # 准备代理配置
    proxy_config = None
    if browser_profile.proxy:
        proxy_config = {
            "server": f"{browser_profile.proxy.protocol}://{browser_profile.proxy.host}:{browser_profile.proxy.port}"
        }
        if browser_profile.proxy.username and browser_profile.proxy.password:
            proxy_config["username"] = browser_profile.proxy.username
            proxy_config["password"] = browser_profile.proxy.password
    
    try:
        # 创建自动化实例
        automation = AutomationFactory.create(
            platform=db_account.platform,
            storage_state_path=db_account.storage_path,
            proxy=proxy_config,
            user_agent=browser_profile.user_agent,
            viewport_size={"width": browser_profile.screen_width, "height": browser_profile.screen_height}
        )
        
        # 启动有头浏览器进行登录
        await automation.start(headless=False)
        
        # 导航到登录页面
        login_url = automation.get_login_url()
        await automation.page.goto(login_url)
        
        # 等待用户手动登录完成
        logger.info(f"请在弹出的浏览器中完成账户 {db_account.username} 的登录操作")
        
        # 等待用户登录完成（检测URL变化或特定元素出现）
        await automation.wait_for_login_completion()
        
        # 保存登录状态
        await automation.save_login_state()
        
        # 关闭浏览器
        await automation.close()
        
        # 更新账户状态
        db_account.status = "active"
        db_account.last_login = datetime.utcnow()
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
        
        logger.info(f"账户 {db_account.username} 激活成功")
        return db_account
        
    except Exception as e:
        logger.error(f"激活账户失败: {str(e)}")
        db_account.status = "error"
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
        raise

async def check_login_status(db: Session, account_id: int) -> dict:
    """
    检查用户登录状态 - 使用无头浏览器访问个人中心
    
    Args:
        db: 数据库会话
        account_id: 账户ID
        
    Returns:
        包含登录状态信息的字典
    """
    db_account = get_account(db, account_id)
    if not db_account:
        raise ValueError(f"账户不存在: ID {account_id}")
    
    browser_profile = db.query(BrowserProfile).filter(BrowserProfile.id == db_account.browser_profile_id).first()
    if not browser_profile:
        raise ValueError(f"浏览器配置不存在: ID {db_account.browser_profile_id}")
    
    # 准备代理配置
    proxy_config = None
    if browser_profile.proxy:
        proxy_config = {
            "server": f"{browser_profile.proxy.protocol}://{browser_profile.proxy.host}:{browser_profile.proxy.port}"
        }
        if browser_profile.proxy.username and browser_profile.proxy.password:
            proxy_config["username"] = browser_profile.proxy.username
            proxy_config["password"] = browser_profile.proxy.password
    
    try:
        # 创建自动化实例
        automation = AutomationFactory.create(
            platform=db_account.platform,
            storage_state_path=db_account.storage_path,
            proxy=proxy_config,
            user_agent=browser_profile.user_agent,
            viewport_size={"width": browser_profile.screen_width, "height": browser_profile.screen_height}
        )
        
        # 启动无头浏览器
        await automation.start(headless=True)
        
        # 检查登录状态
        login_status = await automation.check_login_status()
        
        # 关闭浏览器
        await automation.close()
        
        # 更新账户状态
        if login_status["is_logged_in"]:
            db_account.status = "active"
            db_account.last_login = datetime.utcnow()
        else:
            db_account.status = "inactive"
        
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
        
        return {
            "account_id": account_id,
            "username": db_account.username,
            "platform": db_account.platform,
            "is_logged_in": login_status["is_logged_in"],
            "user_info": login_status.get("user_info", {}),
            "status": db_account.status,
            "last_login": db_account.last_login
        }
        
    except Exception as e:
        logger.error(f"检查登录状态失败: {str(e)}")
        db_account.status = "error"
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
        
        return {
            "account_id": account_id,
            "username": db_account.username,
            "platform": db_account.platform,
            "is_logged_in": False,
            "error": str(e),
            "status": "error"
        }

async def refresh_login(db: Session, account_id: int) -> Account:
    """
    刷新账户登录状态 - 先检查登录状态，如果未登录则提示需要激活
    
    Args:
        db: 数据库会话
        account_id: 账户ID
        
    Returns:
        更新后的账户对象
    """
    # 先检查登录状态
    login_status = await check_login_status(db, account_id)
    
    if not login_status["is_logged_in"]:
        # 如果未登录，返回需要激活的状态
        db_account = get_account(db, account_id)
        db_account.status = "need_activation"
        db_account.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_account)
        
        logger.info(f"账户 {db_account.username} 需要激活，请调用 activate_account 接口")
        return db_account
    
    # 如果已登录，返回账户对象
    return get_account(db, account_id)