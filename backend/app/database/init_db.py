import logging
from sqlalchemy.orm import Session

from app.database.session import Base, engine
from app.models.models import SystemSetting
from app.core.config import settings

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    初始化数据库
    创建表并添加初始数据
    
    Args:
        db: 数据库会话
    """
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    logger.info("数据库表创建完成")
    
    # 添加系统设置
    init_system_settings(db)
    logger.info("系统设置初始化完成")

def init_system_settings(db: Session) -> None:
    """
    初始化系统设置
    
    Args:
        db: 数据库会话
    """
    # 定义默认系统设置
    default_settings = [
        {
            "key": "ffmpeg_path",
            "value": "",
            "value_type": "string",
            "description": "FFmpeg可执行文件路径"
        },
        {
            "key": "ai_api_key",
            "value": "",
            "value_type": "string",
            "description": "AI API密钥"
        },
        {
            "key": "log_level",
            "value": "INFO",
            "value_type": "string",
            "description": "日志级别"
        },
        {
            "key": "storage_path",
            "value": str(settings.STORAGE_DIR),
            "value_type": "string",
            "description": "存储路径"
        },
        {
            "key": "proxy_selection_strategy",
            "value": "random",
            "value_type": "string",
            "description": "代理IP选择策略"
        }
    ]
    
    # 检查并添加默认设置
    for setting in default_settings:
        existing = db.query(SystemSetting).filter(SystemSetting.key == setting["key"]).first()
        if not existing:
            db_setting = SystemSetting(
                key=setting["key"],
                value=setting["value"],
                value_type=setting["value_type"],
                description=setting["description"]
            )
            db.add(db_setting)
    
    db.commit()