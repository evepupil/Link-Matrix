from sqlalchemy.orm import Session

from app.database.session import Base, engine
from app.models.models import SystemSetting
from app.core.config import settings
from app.core.logger import get_logger, log_exception

logger = get_logger(__name__)

def init_db(db: Session) -> None:
    """
    初始化数据库
    创建表并添加初始数据
    
    Args:
        db: 数据库会话
    """
    logger.info("开始初始化数据库")
    
    try:
        # 创建所有表
        logger.debug("正在创建数据库表...")
        Base.metadata.create_all(bind=engine)
        logger.info("数据库表创建完成")
        
        # 添加系统设置
        logger.debug("正在初始化系统设置...")
        init_system_settings(db)
        logger.info("系统设置初始化完成")
        
        logger.info("数据库初始化成功")
        
    except Exception as e:
        log_exception(logger, e, "数据库初始化失败")
        raise

def init_system_settings(db: Session) -> None:
    """
    初始化系统设置
    
    Args:
        db: 数据库会话
    """
    logger.debug("开始初始化系统设置")
    
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
            "value": settings.LOG_LEVEL,
            "value_type": "string",
            "description": "日志级别"
        },
        {
            "key": "storage_path",
            "value": "./storage",
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
    
    logger.debug(f"准备初始化 {len(default_settings)} 个系统设置")
    
    # 检查并添加默认设置
    added_count = 0
    for setting in default_settings:
        try:
            existing = db.query(SystemSetting).filter(SystemSetting.key == setting["key"]).first()
            if not existing:
                db_setting = SystemSetting(
                    key=setting["key"],
                    value=setting["value"],
                    value_type=setting["value_type"],
                    description=setting["description"]
                )
                db.add(db_setting)
                added_count += 1
                logger.debug(f"添加系统设置: {setting['key']} = {setting['value']}")
            else:
                logger.debug(f"系统设置已存在: {setting['key']}")
        except Exception as e:
            log_exception(logger, e, f"添加系统设置失败: {setting['key']}")
            raise
    
    try:
        db.commit()
        logger.info(f"系统设置初始化完成，新增 {added_count} 个设置")
    except Exception as e:
        db.rollback()
        log_exception(logger, e, "提交系统设置失败")
        raise