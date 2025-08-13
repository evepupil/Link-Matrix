"""
Supabase数据库初始化脚本
用于在Supabase中创建表和初始数据
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database.session import get_db, engine
from app.core.config import settings
from app.core.logger import get_logger, log_exception

logger = get_logger(__name__)

def init_supabase_tables():
    """在Supabase中初始化表结构"""
    if not settings.is_using_supabase:
        logger.warning("当前未配置Supabase，跳过表初始化")
        return
    
    logger.info("开始初始化Supabase数据库表")
    
    try:
        # 创建微信公众号API账户表
        create_api_accounts_wx_table()
        
        # 创建其他必要的表（如果不存在）
        create_other_tables()
        
        logger.info("Supabase数据库表初始化完成")
        
    except Exception as e:
        log_exception(logger, e, "Supabase数据库表初始化失败")
        raise

def create_api_accounts_wx_table():
    """创建微信公众号API账户表"""
    logger.info("创建微信公众号API账户表")
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS api_accounts_wx (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        appid VARCHAR(255) UNIQUE NOT NULL,
        app_secret VARCHAR(255) NOT NULL,
        wx_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        thumb_media_id TEXT,
        illust_tag JSONB,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 创建索引
    create_indexes_sql = [
        "CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_name ON api_accounts_wx(name);",
        "CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_appid ON api_accounts_wx(appid);",
        "CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_wx_id ON api_accounts_wx(wx_id);",
        "CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_status ON api_accounts_wx(status);",
        "CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_created_at ON api_accounts_wx(created_at);"
    ]
    
    try:
        with engine.connect() as conn:
            # 创建表
            conn.execute(text(create_table_sql))
            
            # 创建索引
            for index_sql in create_indexes_sql:
                conn.execute(text(index_sql))
            
            conn.commit()
            logger.info("微信公众号API账户表创建成功")
            
    except Exception as e:
        log_exception(logger, e, "创建微信公众号API账户表失败")
        raise

def create_other_tables():
    """创建其他必要的表"""
    logger.info("检查并创建其他必要的表")
    
    # 这里可以添加其他表的创建逻辑
    # 例如：accounts, browser_profiles, proxies等
    
    pass

def insert_sample_data():
    """插入示例数据"""
    if not settings.is_using_supabase:
        return
    
    logger.info("插入示例数据")
    
    sample_data_sql = """
    INSERT INTO api_accounts_wx (name, appid, app_secret, wx_id, title, author, thumb_media_id, illust_tag, status) 
    VALUES (
        'ACG萌图宅',
        'wxf4b120c317485aca',
        '49781f3e442f416f965aeb66f427d27c',
        'ACG_otaku_',
        '每日萌图',
        'ACG萌图宅',
        'JjT38Mys-rP5OosVgMwh2cPubSUaMvTBlkVzSliYTjOw15E3F-ZAeY375z7zYHri',
        '[["黑裤袜", "黑丝"], ["碧蓝档案"]]',
        'active'
    ) ON CONFLICT (appid) DO NOTHING;
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(sample_data_sql))
            conn.commit()
            logger.info("示例数据插入成功")
            
    except Exception as e:
        log_exception(logger, e, "插入示例数据失败")
        # 不抛出异常，因为示例数据不是必需的

def test_supabase_connection():
    """测试Supabase连接"""
    if not settings.is_using_supabase:
        logger.warning("当前未配置Supabase")
        return False
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            logger.info(f"Supabase连接成功，PostgreSQL版本: {version}")
            return True
            
    except Exception as e:
        log_exception(logger, e, "Supabase连接测试失败")
        return False

if __name__ == "__main__":
    """直接运行时的测试"""
    logger.info("开始测试Supabase连接和初始化")
    
    # 测试连接
    if test_supabase_connection():
        # 初始化表
        init_supabase_tables()
        # 插入示例数据
        insert_sample_data()
        logger.info("Supabase初始化完成")
    else:
        logger.error("Supabase连接失败，请检查配置") 