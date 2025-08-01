from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import TaskResponse, TaskLog
from app.services import task_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    request: Request,
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取任务列表，可按类型和状态筛选"""
    client_ip = request.client.host
    logger.info(f"获取任务列表请求 - IP: {client_ip}, 类型: {task_type}, 状态: {status}, skip: {skip}, limit: {limit}")
    
    try:
        tasks = task_service.get_tasks(db, task_type, status, skip, limit)
        logger.info(f"任务列表获取成功 - IP: {client_ip}, 返回 {len(tasks)} 个任务")
        return tasks
    except Exception as e:
        log_exception(logger, e, f"获取任务列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取任务列表失败: {str(e)}")

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定任务详情"""
    client_ip = request.client.host
    logger.info(f"获取任务详情请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        logger.info(f"任务详情获取成功 - IP: {client_ip}, 任务: {task.name} (ID: {task_id})")
        return task
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取任务详情失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"获取任务详情失败: {str(e)}")

@router.get("/{task_id}/logs", response_model=List[TaskLog])
def get_task_logs(task_id: int, request: Request, db: Session = Depends(get_db)):
    """获取任务执行日志"""
    client_ip = request.client.host
    logger.info(f"获取任务日志请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        logs = task_service.get_task_logs(db, task_id)
        logger.info(f"任务日志获取成功 - IP: {client_ip}, 任务ID: {task_id}, 日志条数: {len(logs)}")
        return logs
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取任务日志失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"获取任务日志失败: {str(e)}")

@router.post("/{task_id}/pause", response_model=TaskResponse)
def pause_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    """暂停任务"""
    client_ip = request.client.host
    logger.info(f"暂停任务请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        result = task_service.pause_task(db, task_id)
        logger.info(f"任务暂停成功 - IP: {client_ip}, 任务: {result.name} (ID: {task_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"暂停任务失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"暂停任务失败: {str(e)}")

@router.post("/{task_id}/resume", response_model=TaskResponse)
def resume_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    """恢复任务"""
    client_ip = request.client.host
    logger.info(f"恢复任务请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        result = task_service.resume_task(db, task_id)
        logger.info(f"任务恢复成功 - IP: {client_ip}, 任务: {result.name} (ID: {task_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"恢复任务失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"恢复任务失败: {str(e)}")

@router.post("/{task_id}/cancel", response_model=TaskResponse)
def cancel_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    """取消任务"""
    client_ip = request.client.host
    logger.info(f"取消任务请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        result = task_service.cancel_task(db, task_id)
        logger.info(f"任务取消成功 - IP: {client_ip}, 任务: {result.name} (ID: {task_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"取消任务失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"取消任务失败: {str(e)}")

@router.post("/{task_id}/retry", response_model=TaskResponse)
def retry_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    """重试失败的任务"""
    client_ip = request.client.host
    logger.info(f"重试任务请求 - IP: {client_ip}, 任务ID: {task_id}")
    
    try:
        task = task_service.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在 - IP: {client_ip}, 任务ID: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        result = task_service.retry_task(db, task_id)
        logger.info(f"任务重试成功 - IP: {client_ip}, 任务: {result.name} (ID: {task_id})")
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"重试任务失败 - IP: {client_ip}, 任务ID: {task_id}")
        raise HTTPException(status_code=500, detail=f"重试任务失败: {str(e)}")