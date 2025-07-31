from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import TaskResponse, TaskLog
from app.services import task_service

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取任务列表，可按类型和状态筛选"""
    return task_service.get_tasks(db, task_type, status, skip, limit)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """获取特定任务详情"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@router.get("/{task_id}/logs", response_model=List[TaskLog])
def get_task_logs(task_id: int, db: Session = Depends(get_db)):
    """获取任务执行日志"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task_service.get_task_logs(db, task_id)

@router.post("/{task_id}/pause", response_model=TaskResponse)
def pause_task(task_id: int, db: Session = Depends(get_db)):
    """暂停任务"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task_service.pause_task(db, task_id)

@router.post("/{task_id}/resume", response_model=TaskResponse)
def resume_task(task_id: int, db: Session = Depends(get_db)):
    """恢复任务"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task_service.resume_task(db, task_id)

@router.post("/{task_id}/cancel", response_model=TaskResponse)
def cancel_task(task_id: int, db: Session = Depends(get_db)):
    """取消任务"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task_service.cancel_task(db, task_id)

@router.post("/{task_id}/retry", response_model=TaskResponse)
def retry_task(task_id: int, db: Session = Depends(get_db)):
    """重试失败的任务"""
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task_service.retry_task(db, task_id)