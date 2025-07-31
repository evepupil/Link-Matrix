from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.schemas import (
    BrowserProfileCreate, BrowserProfileUpdate, BrowserProfileResponse,
    ProxyCreate, ProxyUpdate, ProxyResponse
)
from app.services import resource_service

router = APIRouter()

# 浏览器配置相关路由
@router.get("/browser-profiles", response_model=List[BrowserProfileResponse])
def get_browser_profiles(db: Session = Depends(get_db)):
    """获取所有浏览器配置列表"""
    return resource_service.get_browser_profiles(db)

@router.post("/browser-profiles", response_model=BrowserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_browser_profile(profile: BrowserProfileCreate, db: Session = Depends(get_db)):
    """创建新的浏览器配置"""
    return resource_service.create_browser_profile(db, profile)

@router.get("/browser-profiles/{profile_id}", response_model=BrowserProfileResponse)
def get_browser_profile(profile_id: int, db: Session = Depends(get_db)):
    """获取特定浏览器配置详情"""
    profile = resource_service.get_browser_profile(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="浏览器配置不存在")
    return profile

@router.put("/browser-profiles/{profile_id}", response_model=BrowserProfileResponse)
def update_browser_profile(profile_id: int, profile: BrowserProfileUpdate, db: Session = Depends(get_db)):
    """更新浏览器配置"""
    db_profile = resource_service.get_browser_profile(db, profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="浏览器配置不存在")
    return resource_service.update_browser_profile(db, profile_id, profile)

@router.delete("/browser-profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_browser_profile(profile_id: int, db: Session = Depends(get_db)):
    """删除浏览器配置"""
    db_profile = resource_service.get_browser_profile(db, profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="浏览器配置不存在")
    resource_service.delete_browser_profile(db, profile_id)
    return None

# 代理IP相关路由
@router.get("/proxies", response_model=List[ProxyResponse])
def get_proxies(db: Session = Depends(get_db)):
    """获取所有代理IP列表"""
    return resource_service.get_proxies(db)

@router.post("/proxies", response_model=ProxyResponse, status_code=status.HTTP_201_CREATED)
def create_proxy(proxy: ProxyCreate, db: Session = Depends(get_db)):
    """创建新的代理IP"""
    return resource_service.create_proxy(db, proxy)

@router.get("/proxies/{proxy_id}", response_model=ProxyResponse)
def get_proxy(proxy_id: int, db: Session = Depends(get_db)):
    """获取特定代理IP详情"""
    proxy = resource_service.get_proxy(db, proxy_id)
    if not proxy:
        raise HTTPException(status_code=404, detail="代理IP不存在")
    return proxy

@router.put("/proxies/{proxy_id}", response_model=ProxyResponse)
def update_proxy(proxy_id: int, proxy: ProxyUpdate, db: Session = Depends(get_db)):
    """更新代理IP"""
    db_proxy = resource_service.get_proxy(db, proxy_id)
    if not db_proxy:
        raise HTTPException(status_code=404, detail="代理IP不存在")
    return resource_service.update_proxy(db, proxy_id, proxy)

@router.delete("/proxies/{proxy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proxy(proxy_id: int, db: Session = Depends(get_db)):
    """删除代理IP"""
    db_proxy = resource_service.get_proxy(db, proxy_id)
    if not db_proxy:
        raise HTTPException(status_code=404, detail="代理IP不存在")
    resource_service.delete_proxy(db, proxy_id)
    return None

@router.post("/proxies/{proxy_id}/test", response_model=dict)
def test_proxy(proxy_id: int, db: Session = Depends(get_db)):
    """测试代理IP连通性"""
    proxy = resource_service.get_proxy(db, proxy_id)
    if not proxy:
        raise HTTPException(status_code=404, detail="代理IP不存在")
    result = resource_service.test_proxy(db, proxy_id)
    return {"is_available": result, "message": "代理IP测试成功" if result else "代理IP测试失败"}