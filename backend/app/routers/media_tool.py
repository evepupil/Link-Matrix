from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import (
    VideoTranslationCreate, VideoTranslationResponse,
    SubtitleSettings, VideoToTextResponse
)
from app.services import media_tool_service

router = APIRouter()

@router.post("/translate-video", response_model=VideoTranslationResponse)
async def translate_video(
    video: UploadFile = File(...),
    target_language: str = Form(...),
    db: Session = Depends(get_db)
):
    """上传视频并进行翻译"""
    return await media_tool_service.translate_video(db, video, target_language)

@router.post("/generate-subtitles", response_model=str)
async def generate_subtitles(
    translation_id: int,
    settings: SubtitleSettings,
    db: Session = Depends(get_db)
):
    """根据翻译结果生成字幕文件"""
    result = await media_tool_service.generate_subtitles(db, translation_id, settings)
    if not result:
        raise HTTPException(status_code=404, detail="翻译结果不存在")
    return result

@router.post("/embed-subtitles", response_model=str)
async def embed_subtitles(
    translation_id: int,
    subtitle_file: str,
    is_hardcoded: bool = False,
    db: Session = Depends(get_db)
):
    """将字幕嵌入视频"""
    result = await media_tool_service.embed_subtitles(db, translation_id, subtitle_file, is_hardcoded)
    if not result:
        raise HTTPException(status_code=404, detail="处理失败")
    return result

@router.post("/video-to-text", response_model=VideoToTextResponse)
async def video_to_text(
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """将视频转换为文本"""
    return await media_tool_service.video_to_text(db, video)

@router.post("/generate-titles", response_model=List[str])
async def generate_titles(
    content: str,
    keywords: Optional[str] = None,
    count: int = 5,
    db: Session = Depends(get_db)
):
    """使用AI生成文章标题"""
    return await media_tool_service.generate_titles(db, content, keywords, count)