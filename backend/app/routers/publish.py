from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import (
    PublishTaskCreate, PublishTaskResponse
)
from app.services import publish_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

@router.post("/video", response_model=PublishTaskResponse)
async def publish_video(
    request: Request,
    video: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    tags: str = Form(...),
    account_ids: List[int] = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """创建视频发布任务"""
    client_ip = request.client.host
    logger.info(f"创建视频发布任务请求 - IP: {client_ip}, 标题: {title}, 账户数量: {len(account_ids)}")
    
    try:
        logger.debug(f"视频发布任务参数 - IP: {client_ip}, 视频文件: {video.filename}, 描述长度: {len(description)}, 标签: {tags}")
        
        result = await publish_service.create_video_publish_task(
            db, 
            video, 
            title, 
            description, 
            tags.split(","), 
            account_ids, 
            cover_image
        )
        
        logger.info(f"视频发布任务创建成功 - IP: {client_ip}, 任务ID: {result.id}")
        return result
        
    except Exception as e:
        log_exception(logger, e, f"创建视频发布任务失败 - IP: {client_ip}, 标题: {title}")
        raise HTTPException(status_code=500, detail="创建视频发布任务失败")

@router.post("/article", response_model=PublishTaskResponse)
async def publish_article(
    request: Request,
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(...),
    account_ids: List[int] = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """创建文章发布任务"""
    client_ip = request.client.host
    logger.info(f"创建文章发布任务请求 - IP: {client_ip}, 标题: {title}, 账户数量: {len(account_ids)}")
    
    try:
        logger.debug(f"文章发布任务参数 - IP: {client_ip}, 内容长度: {len(content)}, 标签: {tags}")
        
        result = await publish_service.create_article_publish_task(
            db, 
            title, 
            content, 
            tags.split(","), 
            account_ids, 
            cover_image
        )
        
        logger.info(f"文章发布任务创建成功 - IP: {client_ip}, 任务ID: {result.id}")
        return result
        
    except Exception as e:
        log_exception(logger, e, f"创建文章发布任务失败 - IP: {client_ip}, 标题: {title}")
        raise HTTPException(status_code=500, detail="创建文章发布任务失败")