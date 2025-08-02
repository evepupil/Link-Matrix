from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.schemas import (
    VideoTranslationCreate, VideoTranslationResponse,
    SubtitleSettings, VideoToTextResponse
)
from app.services import media_tool_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

@router.post("/translate-video", response_model=VideoTranslationResponse)
async def translate_video(
    request: Request,
    video: UploadFile = File(...),
    target_language: str = Form(...),
    db: Session = Depends(get_db)
):
    """上传视频并进行翻译"""
    client_ip = request.client.host
    logger.info(f"视频翻译请求 - IP: {client_ip}, 视频文件: {video.filename}, 目标语言: {target_language}")
    
    try:
        logger.debug(f"视频翻译参数 - IP: {client_ip}, 文件大小: {video.size if hasattr(video, 'size') else 'unknown'}")
        
        result = await media_tool_service.translate_video(db, video, target_language)
        
        logger.info(f"视频翻译任务创建成功 - IP: {client_ip}, 任务ID: {result.id}")
        return result
        
    except Exception as e:
        log_exception(logger, e, f"视频翻译失败 - IP: {client_ip}, 文件: {video.filename}")
        raise HTTPException(status_code=500, detail="视频翻译失败")

@router.post("/generate-subtitles", response_model=str)
async def generate_subtitles(
    request: Request,
    translation_id: int,
    settings: SubtitleSettings,
    db: Session = Depends(get_db)
):
    """根据翻译结果生成字幕文件"""
    client_ip = request.client.host
    logger.info(f"生成字幕请求 - IP: {client_ip}, 翻译ID: {translation_id}")
    
    try:
        logger.debug(f"字幕生成参数 - IP: {client_ip}, 设置: {settings}")
        
        result = await media_tool_service.generate_subtitles(db, translation_id, settings)
        
        if not result:
            logger.warning(f"字幕生成失败，翻译结果不存在 - IP: {client_ip}, 翻译ID: {translation_id}")
            raise HTTPException(status_code=404, detail="翻译结果不存在")
        
        logger.info(f"字幕生成成功 - IP: {client_ip}, 翻译ID: {translation_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"字幕生成失败 - IP: {client_ip}, 翻译ID: {translation_id}")
        raise HTTPException(status_code=500, detail="字幕生成失败")

@router.post("/embed-subtitles", response_model=str)
async def embed_subtitles(
    request: Request,
    translation_id: int,
    subtitle_file: str,
    is_hardcoded: bool = False,
    db: Session = Depends(get_db)
):
    """将字幕嵌入视频"""
    client_ip = request.client.host
    logger.info(f"字幕嵌入请求 - IP: {client_ip}, 翻译ID: {translation_id}, 硬编码: {is_hardcoded}")
    
    try:
        logger.debug(f"字幕嵌入参数 - IP: {client_ip}, 字幕文件: {subtitle_file}")
        
        result = await media_tool_service.embed_subtitles(db, translation_id, subtitle_file, is_hardcoded)
        
        if not result:
            logger.warning(f"字幕嵌入失败 - IP: {client_ip}, 翻译ID: {translation_id}")
            raise HTTPException(status_code=404, detail="处理失败")
        
        logger.info(f"字幕嵌入成功 - IP: {client_ip}, 翻译ID: {translation_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"字幕嵌入失败 - IP: {client_ip}, 翻译ID: {translation_id}")
        raise HTTPException(status_code=500, detail="字幕嵌入失败")

@router.post("/video-to-text", response_model=VideoToTextResponse)
async def video_to_text(
    request: Request,
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """将视频转换为文本"""
    client_ip = request.client.host
    logger.info(f"视频转文本请求 - IP: {client_ip}, 视频文件: {video.filename}")
    
    try:
        logger.debug(f"视频转文本参数 - IP: {client_ip}, 文件大小: {video.size if hasattr(video, 'size') else 'unknown'}")
        
        result = await media_tool_service.video_to_text(db, video)
        
        logger.info(f"视频转文本成功 - IP: {client_ip}, 任务ID: {result.id}")
        return result
        
    except Exception as e:
        log_exception(logger, e, f"视频转文本失败 - IP: {client_ip}, 文件: {video.filename}")
        raise HTTPException(status_code=500, detail="视频转文本失败")

@router.post("/generate-titles", response_model=List[str])
async def generate_titles(
    request: Request,
    content: str,
    keywords: Optional[str] = None,
    count: int = 5,
    db: Session = Depends(get_db)
):
    """使用AI生成文章标题"""
    client_ip = request.client.host
    logger.info(f"生成标题请求 - IP: {client_ip}, 内容长度: {len(content)}, 数量: {count}")
    
    try:
        logger.debug(f"标题生成参数 - IP: {client_ip}, 关键词: {keywords}")
        
        result = await media_tool_service.generate_titles(db, content, keywords, count)
        
        logger.info(f"标题生成成功 - IP: {client_ip}, 生成数量: {len(result)}")
        return result
        
    except Exception as e:
        log_exception(logger, e, f"标题生成失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail="标题生成失败")