from sqlalchemy.orm import Session
from typing import List, Optional
import os
import requests
from datetime import datetime

from app.models.models import BrowserProfile, Proxy
from app.models.schemas import BrowserProfileCreate, BrowserProfileUpdate, ProxyCreate, ProxyUpdate
from app.core.config import settings
from app.core.logger import get_logger, log_exception, log_function_call

logger = get_logger(__name__)

# ==================== 浏览器配置相关函数 ====================

@log_function_call(logger)
def get_browser_profiles(db: Session) -> List[BrowserProfile]:
    """
    获取所有浏览器配置列表
    
    Args:
        db: 数据库会话
        
    Returns:
        浏览器配置列表
    """
    logger.debug("开始获取所有浏览器配置列表")
    
    try:
        profiles = db.query(BrowserProfile).all()
        logger.info(f"成功获取 {len(profiles)} 个浏览器配置")
        return profiles
        
    except Exception as e:
        log_exception(logger, e, "获取浏览器配置列表失败")
        raise

@log_function_call(logger)
def get_browser_profile(db: Session, profile_id: int) -> Optional[BrowserProfile]:
    """
    获取特定浏览器配置详情
    
    Args:
        db: 数据库会话
        profile_id: 浏览器配置ID
        
    Returns:
        浏览器配置对象或None
    """
    logger.debug(f"开始获取浏览器配置详情，ID: {profile_id}")
    
    try:
        profile = db.query(BrowserProfile).filter(BrowserProfile.id == profile_id).first()
        if profile:
            logger.info(f"浏览器配置获取成功: {profile.name} (ID: {profile_id})")
        else:
            logger.warning(f"浏览器配置不存在，ID: {profile_id}")
        return profile
        
    except Exception as e:
        log_exception(logger, e, f"获取浏览器配置详情失败，ID: {profile_id}")
        raise

@log_function_call(logger)
def create_browser_profile(db: Session, profile: BrowserProfileCreate) -> BrowserProfile:
    """
    创建新的浏览器配置
    
    Args:
        db: 数据库会话
        profile: 浏览器配置创建模型
        
    Returns:
        创建的浏览器配置对象
    """
    logger.info(f"开始创建浏览器配置: {profile.name}")
    
    try:
        # 检查 proxy_id
        proxy = None
        if profile.proxy_id is not None:
            logger.debug(f"检查代理IP，ID: {profile.proxy_id}")
            proxy = db.query(Proxy).filter(Proxy.id == profile.proxy_id).first()
            if not proxy:
                error_msg = f"代理IP不存在: ID {profile.proxy_id}"
                logger.error(error_msg)
                raise ValueError(error_msg)
        
        # 生成存储路径
        storage_dir = os.path.join(settings.BROWSER_PROFILES_DIR, f"profile_{profile.name}")
        os.makedirs(storage_dir, exist_ok=True)
        storage_path = os.path.join(storage_dir, "storage_state.json")
        logger.debug(f"浏览器配置存储路径: {storage_path}")
        
        db_profile = BrowserProfile(
            name=profile.name,
            user_agent=profile.user_agent,
            screen_width=profile.screen_width,
            screen_height=profile.screen_height,
            storage_path=storage_path,
            proxy_id=profile.proxy_id
        )
        
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        
        logger.info(f"浏览器配置创建成功: {db_profile.name}, ID: {db_profile.id}")
        return db_profile
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"创建浏览器配置失败: {profile.name}")
        raise

@log_function_call(logger)
def update_browser_profile(db: Session, profile_id: int, profile: BrowserProfileUpdate) -> BrowserProfile:
    """
    更新浏览器配置
    
    Args:
        db: 数据库会话
        profile_id: 浏览器配置ID
        profile: 浏览器配置更新模型
        
    Returns:
        更新后的浏览器配置对象
    """
    logger.info(f"开始更新浏览器配置，ID: {profile_id}")
    
    try:
        db_profile = get_browser_profile(db, profile_id)
        if not db_profile:
            error_msg = f"浏览器配置不存在，ID: {profile_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 更新字段
        if profile.name is not None:
            logger.debug(f"更新配置名称: {db_profile.name} -> {profile.name}")
            db_profile.name = profile.name
        if profile.user_agent is not None:
            db_profile.user_agent = profile.user_agent
        if profile.screen_width is not None:
            db_profile.screen_width = profile.screen_width
        if profile.screen_height is not None:
            db_profile.screen_height = profile.screen_height
        if profile.proxy_id is not None:
            logger.debug(f"检查新的代理IP，ID: {profile.proxy_id}")
            proxy = db.query(Proxy).filter(Proxy.id == profile.proxy_id).first()
            if not proxy:
                error_msg = f"代理IP不存在: ID {profile.proxy_id}"
                logger.error(error_msg)
                raise ValueError(error_msg)
            db_profile.proxy_id = profile.proxy_id
        
        db_profile.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_profile)
        
        logger.info(f"浏览器配置更新成功: {db_profile.name} (ID: {profile_id})")
        return db_profile
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"更新浏览器配置失败，ID: {profile_id}")
        raise

@log_function_call(logger)
def delete_browser_profile(db: Session, profile_id: int) -> None:
    """
    删除浏览器配置
    
    Args:
        db: 数据库会话
        profile_id: 浏览器配置ID
    """
    logger.info(f"开始删除浏览器配置，ID: {profile_id}")
    
    try:
        db_profile = get_browser_profile(db, profile_id)
        if not db_profile:
            error_msg = f"浏览器配置不存在，ID: {profile_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 删除存储状态文件夹
        if db_profile.storage_path:
            storage_dir = os.path.dirname(db_profile.storage_path)
            if os.path.exists(storage_dir):
                try:
                    logger.debug(f"删除存储目录: {storage_dir}")
                    for f in os.listdir(storage_dir):
                        os.remove(os.path.join(storage_dir, f))
                    os.rmdir(storage_dir)
                    logger.debug("存储目录删除成功")
                except Exception as e:
                    logger.warning(f"删除存储目录失败: {e}")
        
        db.delete(db_profile)
        db.commit()
        
        logger.info(f"浏览器配置删除成功: {db_profile.name} (ID: {profile_id})")
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"删除浏览器配置失败，ID: {profile_id}")
        raise

# ==================== 代理IP相关函数 ====================

@log_function_call(logger)
def get_proxies(db: Session) -> List[Proxy]:
    """
    获取所有代理IP列表
    
    Args:
        db: 数据库会话
        
    Returns:
        代理IP列表
    """
    logger.debug("开始获取所有代理IP列表")
    
    try:
        proxies = db.query(Proxy).all()
        logger.info(f"成功获取 {len(proxies)} 个代理IP")
        return proxies
        
    except Exception as e:
        log_exception(logger, e, "获取代理IP列表失败")
        raise

@log_function_call(logger)
def get_proxy(db: Session, proxy_id: int) -> Optional[Proxy]:
    """
    获取特定代理IP详情
    
    Args:
        db: 数据库会话
        proxy_id: 代理IP的ID
        
    Returns:
        代理IP对象或None
    """
    logger.debug(f"开始获取代理IP详情，ID: {proxy_id}")
    
    try:
        proxy = db.query(Proxy).filter(Proxy.id == proxy_id).first()
        if proxy:
            logger.info(f"代理IP获取成功: {proxy.host}:{proxy.port} (ID: {proxy_id})")
        else:
            logger.warning(f"代理IP不存在，ID: {proxy_id}")
        return proxy
        
    except Exception as e:
        log_exception(logger, e, f"获取代理IP详情失败，ID: {proxy_id}")
        raise

@log_function_call(logger)
def create_proxy(db: Session, proxy: ProxyCreate) -> Proxy:
    """
    创建新的代理IP
    
    Args:
        db: 数据库会话
        proxy: 代理IP创建模型
        
    Returns:
        创建的代理IP对象
    """
    logger.info(f"开始创建代理IP: {proxy.host}:{proxy.port}")
    
    try:
        db_proxy = Proxy(
            host=proxy.host,
            port=proxy.port,
            username=proxy.username,
            password=proxy.password,
            proxy_type=proxy.proxy_type
        )
        
        db.add(db_proxy)
        db.commit()
        db.refresh(db_proxy)
        
        logger.info(f"代理IP创建成功: {db_proxy.host}:{db_proxy.port}, ID: {db_proxy.id}")
        return db_proxy
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"创建代理IP失败: {proxy.host}:{proxy.port}")
        raise

@log_function_call(logger)
def update_proxy(db: Session, proxy_id: int, proxy: ProxyUpdate) -> Proxy:
    """
    更新代理IP
    
    Args:
        db: 数据库会话
        proxy_id: 代理IP的ID
        proxy: 代理IP更新模型
        
    Returns:
        更新后的代理IP对象
    """
    logger.info(f"开始更新代理IP，ID: {proxy_id}")
    
    try:
        db_proxy = get_proxy(db, proxy_id)
        if not db_proxy:
            error_msg = f"代理IP不存在，ID: {proxy_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 更新字段
        if proxy.host is not None:
            logger.debug(f"更新代理主机: {db_proxy.host} -> {proxy.host}")
            db_proxy.host = proxy.host
        if proxy.port is not None:
            logger.debug(f"更新代理端口: {db_proxy.port} -> {proxy.port}")
            db_proxy.port = proxy.port
        if proxy.username is not None:
            db_proxy.username = proxy.username
        if proxy.password is not None:
            db_proxy.password = proxy.password
        if proxy.proxy_type is not None:
            db_proxy.proxy_type = proxy.proxy_type
        
        db_proxy.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_proxy)
        
        logger.info(f"代理IP更新成功: {db_proxy.host}:{db_proxy.port} (ID: {proxy_id})")
        return db_proxy
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"更新代理IP失败，ID: {proxy_id}")
        raise

@log_function_call(logger)
def delete_proxy(db: Session, proxy_id: int) -> None:
    """
    删除代理IP
    
    Args:
        db: 数据库会话
        proxy_id: 代理IP的ID
    """
    logger.info(f"开始删除代理IP，ID: {proxy_id}")
    
    try:
        db_proxy = get_proxy(db, proxy_id)
        if not db_proxy:
            error_msg = f"代理IP不存在，ID: {proxy_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        db.delete(db_proxy)
        db.commit()
        
        logger.info(f"代理IP删除成功: {db_proxy.host}:{db_proxy.port} (ID: {proxy_id})")
        
    except Exception as e:
        db.rollback()
        log_exception(logger, e, f"删除代理IP失败，ID: {proxy_id}")
        raise

@log_function_call(logger)
def test_proxy(db: Session, proxy_id: int) -> dict:
    """
    测试代理IP连通性
    
    Args:
        db: 数据库会话
        proxy_id: 代理IP的ID
        
    Returns:
        包含测试结果的字典
    """
    logger.info(f"开始测试代理IP连通性，ID: {proxy_id}")
    
    try:
        db_proxy = get_proxy(db, proxy_id)
        if not db_proxy:
            error_msg = f"代理IP不存在，ID: {proxy_id}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # 构建代理配置
        proxy_url = f"{db_proxy.proxy_type}://"
        if db_proxy.username and db_proxy.password:
            proxy_url += f"{db_proxy.username}:{db_proxy.password}@"
        proxy_url += f"{db_proxy.host}:{db_proxy.port}"
        
        logger.debug(f"测试代理配置: {db_proxy.proxy_type}://{db_proxy.host}:{db_proxy.port}")
        
        # 测试连接
        proxies = {
            'http': proxy_url,
            'https': proxy_url
        }
        
        try:
            response = requests.get(
                'http://httpbin.org/ip',
                proxies=proxies,
                timeout=10
            )
            
            if response.status_code == 200:
                result = {
                    'success': True,
                    'message': '代理连接测试成功',
                    'response_time': response.elapsed.total_seconds(),
                    'ip': response.json().get('origin', 'unknown')
                }
                logger.info(f"代理IP测试成功: {db_proxy.host}:{db_proxy.port}, 响应时间: {result['response_time']}s")
            else:
                result = {
                    'success': False,
                    'message': f'代理连接失败，状态码: {response.status_code}',
                    'response_time': response.elapsed.total_seconds()
                }
                logger.warning(f"代理IP测试失败: {db_proxy.host}:{db_proxy.port}, 状态码: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            result = {
                'success': False,
                'message': f'代理连接异常: {str(e)}',
                'response_time': None
            }
            logger.warning(f"代理IP测试异常: {db_proxy.host}:{db_proxy.port}, 错误: {e}")
        
        # 更新代理状态和最后测试时间
        db_proxy.last_test_time = datetime.utcnow()
        db_proxy.status = 'available' if result['success'] else 'unavailable'
        db.commit()
        
        return result
        
    except Exception as e:
        log_exception(logger, e, f"测试代理IP失败，ID: {proxy_id}")
        raise