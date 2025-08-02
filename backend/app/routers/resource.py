from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.schemas import (
    BrowserProfileCreate, BrowserProfileUpdate, BrowserProfileResponse,
    ProxyCreate, ProxyUpdate, ProxyResponse
)
from app.services import resource_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

# 浏览器配置相关路由
@router.get("/browser-profiles", response_model=List[BrowserProfileResponse])
def get_browser_profiles(request: Request, db: Session = Depends(get_db)):
    """获取所有浏览器配置列表"""
    client_ip = request.client.host
    logger.info(f"获取浏览器配置列表请求 - IP: {client_ip}")
    
    try:
        profiles = resource_service.get_browser_profiles(db)
        logger.info(f"浏览器配置列表获取成功 - IP: {client_ip}, 返回 {len(profiles)} 个配置")
        return profiles
    except Exception as e:
        log_exception(logger, e, f"获取浏览器配置列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取浏览器配置列表失败: {str(e)}")

@router.post("/browser-profiles", response_model=BrowserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_browser_profile(profile: BrowserProfileCreate, request: Request, db: Session = Depends(get_db)):
    """创建新的浏览器配置"""
    client_ip = request.client.host
    logger.info(f"创建浏览器配置请求 - IP: {client_ip}, 名称: {profile.name}")
    
    try:
        result = resource_service.create_browser_profile(db, profile)
        logger.info(f"浏览器配置创建成功 - IP: {client_ip}, ID: {result.id}, 名称: {result.name}")
        return result
    except Exception as e:
        log_exception(logger, e, f"创建浏览器配置失败 - IP: {client_ip}, 名称: {profile.name}")
        raise HTTPException(status_code=500, detail=f"创建浏览器配置失败: {str(e)}")

@router.get("/browser-profiles/{profile_id}", response_model=BrowserProfileResponse)
def get_browser_profile(profile_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定浏览器配置详情"""
    client_ip = request.client.host
    logger.info(f"获取浏览器配置详情请求 - IP: {client_ip}, 配置ID: {profile_id}")
    
    try:
        profile = resource_service.get_browser_profile(db, profile_id)
        if not profile:
            logger.warning(f"浏览器配置不存在 - IP: {client_ip}, 配置ID: {profile_id}")
            raise HTTPException(status_code=404, detail="浏览器配置不存在")
        
        logger.info(f"浏览器配置详情获取成功 - IP: {client_ip}, 配置: {profile.name} (ID: {profile_id})")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取浏览器配置详情失败 - IP: {client_ip}, 配置ID: {profile_id}")
        raise HTTPException(status_code=500, detail=f"获取浏览器配置详情失败: {str(e)}")

@router.put("/browser-profiles/{profile_id}", response_model=BrowserProfileResponse)
def update_browser_profile(profile_id: int, profile: BrowserProfileUpdate, request: Request, db: Session = Depends(get_db)):
    """更新浏览器配置"""
    client_ip = request.client.host
    logger.info(f"更新浏览器配置请求 - IP: {client_ip}, 配置ID: {profile_id}")
    
    try:
        db_profile = resource_service.get_browser_profile(db, profile_id)
        if not db_profile:
            logger.warning(f"浏览器配置不存在 - IP: {client_ip}, 配置ID: {profile_id}")
            raise HTTPException(status_code=404, detail="浏览器配置不存在")
        
        result = resource_service.update_browser_profile(db, profile_id, profile)
        logger.info(f"浏览器配置更新成功 - IP: {client_ip}, 配置: {result.name} (ID: {profile_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"更新浏览器配置失败 - IP: {client_ip}, 配置ID: {profile_id}")
        raise HTTPException(status_code=500, detail=f"更新浏览器配置失败: {str(e)}")

@router.delete("/browser-profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_browser_profile(profile_id: int, request: Request, db: Session = Depends(get_db)):
    """删除浏览器配置"""
    client_ip = request.client.host
    logger.info(f"删除浏览器配置请求 - IP: {client_ip}, 配置ID: {profile_id}")
    
    try:
        db_profile = resource_service.get_browser_profile(db, profile_id)
        if not db_profile:
            logger.warning(f"浏览器配置不存在 - IP: {client_ip}, 配置ID: {profile_id}")
            raise HTTPException(status_code=404, detail="浏览器配置不存在")
        
        resource_service.delete_browser_profile(db, profile_id)
        logger.info(f"浏览器配置删除成功 - IP: {client_ip}, 配置ID: {profile_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"删除浏览器配置失败 - IP: {client_ip}, 配置ID: {profile_id}")
        raise HTTPException(status_code=500, detail=f"删除浏览器配置失败: {str(e)}")

# 代理IP相关路由
@router.get("/proxies", response_model=List[ProxyResponse])
def get_proxies(request: Request, db: Session = Depends(get_db)):
    """获取所有代理IP列表"""
    client_ip = request.client.host
    logger.info(f"获取代理IP列表请求 - IP: {client_ip}")
    
    try:
        proxies = resource_service.get_proxies(db)
        logger.info(f"代理IP列表获取成功 - IP: {client_ip}, 返回 {len(proxies)} 个代理")
        return proxies
    except Exception as e:
        log_exception(logger, e, f"获取代理IP列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取代理IP列表失败: {str(e)}")

@router.post("/proxies", response_model=ProxyResponse, status_code=status.HTTP_201_CREATED)
def create_proxy(proxy: ProxyCreate, request: Request, db: Session = Depends(get_db)):
    """创建新的代理IP"""
    client_ip = request.client.host
    logger.info(f"创建代理IP请求 - IP: {client_ip}, 代理地址: {proxy.host}:{proxy.port}")
    
    try:
        result = resource_service.create_proxy(db, proxy)
        logger.info(f"代理IP创建成功 - IP: {client_ip}, ID: {result.id}, 地址: {result.host}:{result.port}")
        return result
    except Exception as e:
        log_exception(logger, e, f"创建代理IP失败 - IP: {client_ip}, 地址: {proxy.host}:{proxy.port}")
        raise HTTPException(status_code=500, detail=f"创建代理IP失败: {str(e)}")

@router.get("/proxies/{proxy_id}", response_model=ProxyResponse)
def get_proxy(proxy_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定代理IP详情"""
    client_ip = request.client.host
    logger.info(f"获取代理IP详情请求 - IP: {client_ip}, 代理ID: {proxy_id}")
    
    try:
        proxy = resource_service.get_proxy(db, proxy_id)
        if not proxy:
            logger.warning(f"代理IP不存在 - IP: {client_ip}, 代理ID: {proxy_id}")
            raise HTTPException(status_code=404, detail="代理IP不存在")
        
        logger.info(f"代理IP详情获取成功 - IP: {client_ip}, 代理: {proxy.host}:{proxy.port} (ID: {proxy_id})")
        return proxy
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取代理IP详情失败 - IP: {client_ip}, 代理ID: {proxy_id}")
        raise HTTPException(status_code=500, detail=f"获取代理IP详情失败: {str(e)}")

@router.put("/proxies/{proxy_id}", response_model=ProxyResponse)
def update_proxy(proxy_id: int, proxy: ProxyUpdate, request: Request, db: Session = Depends(get_db)):
    """更新代理IP"""
    client_ip = request.client.host
    logger.info(f"更新代理IP请求 - IP: {client_ip}, 代理ID: {proxy_id}")
    
    try:
        db_proxy = resource_service.get_proxy(db, proxy_id)
        if not db_proxy:
            logger.warning(f"代理IP不存在 - IP: {client_ip}, 代理ID: {proxy_id}")
            raise HTTPException(status_code=404, detail="代理IP不存在")
        
        result = resource_service.update_proxy(db, proxy_id, proxy)
        logger.info(f"代理IP更新成功 - IP: {client_ip}, 代理: {result.host}:{result.port} (ID: {proxy_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"更新代理IP失败 - IP: {client_ip}, 代理ID: {proxy_id}")
        raise HTTPException(status_code=500, detail=f"更新代理IP失败: {str(e)}")

@router.delete("/proxies/{proxy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proxy(proxy_id: int, request: Request, db: Session = Depends(get_db)):
    """删除代理IP"""
    client_ip = request.client.host
    logger.info(f"删除代理IP请求 - IP: {client_ip}, 代理ID: {proxy_id}")
    
    try:
        db_proxy = resource_service.get_proxy(db, proxy_id)
        if not db_proxy:
            logger.warning(f"代理IP不存在 - IP: {client_ip}, 代理ID: {proxy_id}")
            raise HTTPException(status_code=404, detail="代理IP不存在")
        
        resource_service.delete_proxy(db, proxy_id)
        logger.info(f"代理IP删除成功 - IP: {client_ip}, 代理ID: {proxy_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"删除代理IP失败 - IP: {client_ip}, 代理ID: {proxy_id}")
        raise HTTPException(status_code=500, detail=f"删除代理IP失败: {str(e)}")

@router.post("/proxies/{proxy_id}/test", response_model=dict)
def test_proxy(proxy_id: int, request: Request, db: Session = Depends(get_db)):
    """测试代理IP连通性"""
    client_ip = request.client.host
    logger.info(f"测试代理IP连通性请求 - IP: {client_ip}, 代理ID: {proxy_id}")
    
    try:
        proxy = resource_service.get_proxy(db, proxy_id)
        if not proxy:
            logger.warning(f"代理IP不存在 - IP: {client_ip}, 代理ID: {proxy_id}")
            raise HTTPException(status_code=404, detail="代理IP不存在")
        
        result = resource_service.test_proxy(db, proxy_id)
        logger.info(f"代理IP连通性测试完成 - IP: {client_ip}, 代理: {proxy.host}:{proxy.port}, 结果: {result}")
        return {"is_available": result, "message": "代理IP测试成功" if result else "代理IP测试失败"}
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"测试代理IP连通性失败 - IP: {client_ip}, 代理ID: {proxy_id}")
        raise HTTPException(status_code=500, detail=f"测试代理IP连通性失败: {str(e)}")