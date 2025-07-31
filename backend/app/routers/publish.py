from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import (
    PublishTaskCreate, PublishTaskResponse
)
from app.services import publish_service

router = APIRouter()

@router.post("/video", response_model=PublishTaskResponse)
async def publish_video(
    video: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    tags: str = Form(...),
    account_ids: List[int] = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """创建视频发布任务"""
    return await publish_service.create_video_publish_task(
        db, 
        video, 
        title, 
        description, 
        tags.split(","), 
        account_ids, 
        cover_image
    )

@router.post("/article", response_model=PublishTaskResponse)
async def publish_article(
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(...),
    account_ids: List[int] = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """创建文章发布任务"""
    return await publish_service.create_article_publish_task(
        db, 
        title, 
        content, 
        tags.split(","), 
        account_ids, 
        cover_image
    )