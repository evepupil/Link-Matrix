from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.session import get_db
from app.models.schemas import SystemSettings
from app.services import system_service

router = APIRouter()

@router.get("/settings", response_model=SystemSettings)
def get_settings(db: Session = Depends(get_db)):
    """获取系统设置"""
    return system_service.get_settings(db)

@router.put("/settings", response_model=SystemSettings)
def update_settings(settings: SystemSettings, db: Session = Depends(get_db)):
    """更新系统设置"""
    return system_service.update_settings(db, settings)

@router.get("/status", response_model=Dict[str, Any])
def get_system_status(db: Session = Depends(get_db)):
    """获取系统状态"""
    return system_service.get_system_status(db)

@router.post("/check-update", response_model=Dict[str, Any])
def check_update(db: Session = Depends(get_db)):
    """检查软件更新"""
    return system_service.check_update(db)

@router.post("/update", response_model=Dict[str, str])
def update_software(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """更新软件"""
    background_tasks.add_task(system_service.update_software, db)
    return {"status": "更新已开始，请稍后查看更新状态"}

@router.post("/test-ai-api", response_model=Dict[str, bool])
def test_ai_api(api_key: str, db: Session = Depends(get_db)):
    """测试AI API连接"""
    result = system_service.test_ai_api(db, api_key)
    return {"success": result}