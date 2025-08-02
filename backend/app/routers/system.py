from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.session import get_db
from app.models.schemas import SystemSettings
from app.services import system_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

@router.get("/settings", response_model=SystemSettings)
def get_settings(request: Request, db: Session = Depends(get_db)):
    """获取系统设置"""
    client_ip = request.client.host
    logger.info(f"获取系统设置请求 - IP: {client_ip}")
    
    try:
        settings = system_service.get_settings(db)
        logger.info(f"系统设置获取成功 - IP: {client_ip}")
        return settings
    except Exception as e:
        log_exception(logger, e, f"获取系统设置失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取系统设置失败: {str(e)}")

@router.put("/settings", response_model=SystemSettings)
def update_settings(settings: SystemSettings, request: Request, db: Session = Depends(get_db)):
    """更新系统设置"""
    client_ip = request.client.host
    logger.info(f"更新系统设置请求 - IP: {client_ip}")
    
    try:
        result = system_service.update_settings(db, settings)
        logger.info(f"系统设置更新成功 - IP: {client_ip}")
        return result
    except Exception as e:
        log_exception(logger, e, f"更新系统设置失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"更新系统设置失败: {str(e)}")

@router.get("/status", response_model=Dict[str, Any])
def get_system_status(request: Request, db: Session = Depends(get_db)):
    """获取系统状态"""
    client_ip = request.client.host
    logger.info(f"获取系统状态请求 - IP: {client_ip}")
    
    try:
        status = system_service.get_system_status(db)
        logger.info(f"系统状态获取成功 - IP: {client_ip}")
        return status
    except Exception as e:
        log_exception(logger, e, f"获取系统状态失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取系统状态失败: {str(e)}")

@router.post("/check-update", response_model=Dict[str, Any])
def check_update(request: Request, db: Session = Depends(get_db)):
    """检查软件更新"""
    client_ip = request.client.host
    logger.info(f"检查软件更新请求 - IP: {client_ip}")
    
    try:
        result = system_service.check_update(db)
        logger.info(f"软件更新检查完成 - IP: {client_ip}, 有更新: {result.get('has_update', False)}")
        return result
    except Exception as e:
        log_exception(logger, e, f"检查软件更新失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"检查软件更新失败: {str(e)}")

@router.post("/update", response_model=Dict[str, str])
def update_software(background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    """更新软件"""
    client_ip = request.client.host
    logger.info(f"软件更新请求 - IP: {client_ip}")
    
    try:
        background_tasks.add_task(system_service.update_software, db)
        logger.info(f"软件更新任务已启动 - IP: {client_ip}")
        return {"status": "更新已开始，请稍后查看更新状态"}
    except Exception as e:
        log_exception(logger, e, f"启动软件更新失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"启动软件更新失败: {str(e)}")

@router.post("/test-ai-api", response_model=Dict[str, bool])
def test_ai_api(api_key: str, request: Request, db: Session = Depends(get_db)):
    """测试AI API连接"""
    client_ip = request.client.host
    logger.info(f"测试AI API连接请求 - IP: {client_ip}")
    
    try:
        result = system_service.test_ai_api(db, api_key)
        logger.info(f"AI API连接测试完成 - IP: {client_ip}, 结果: {result}")
        return {"success": result}
    except Exception as e:
        log_exception(logger, e, f"测试AI API连接失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"测试AI API连接失败: {str(e)}")