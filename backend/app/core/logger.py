"""
日志配置模块

提供统一的日志配置，支持：
- 文件日志输出到log目录
- 控制台日志输出
- 记录代码文件名和行数
- 按日期轮转日志文件
- 不同级别的日志分离
"""

import logging
import logging.handlers
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

from app.core.config import settings


class CustomFormatter(logging.Formatter):
    """自定义日志格式化器，包含文件名和行数信息"""
    
    def __init__(self, include_location: bool = True):
        """
        初始化格式化器
        
        Args:
            include_location: 是否包含文件位置信息
        """
        self.include_location = include_location
        
        # 定义不同级别的颜色
        self.COLORS = {
            'DEBUG': '\033[36m',    # 青色
            'INFO': '\033[32m',     # 绿色
            'WARNING': '\033[33m',  # 黄色
            'ERROR': '\033[31m',    # 红色
            'CRITICAL': '\033[35m', # 紫色
            'RESET': '\033[0m'      # 重置
        }
        
        if include_location:
            # 包含文件位置的格式
            self.base_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(funcName)s() | %(message)s"
        else:
            # 不包含文件位置的格式
            self.base_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
            
        super().__init__(self.base_format, datefmt='%Y-%m-%d %H:%M:%S')
    
    def format(self, record):
        """格式化日志记录"""
        # 为控制台输出添加颜色
        if hasattr(record, 'stream') and record.stream == sys.stdout:
            color = self.COLORS.get(record.levelname, '')
            reset = self.COLORS['RESET']
            
            # 临时修改格式字符串添加颜色
            original_format = self._style._fmt
            colored_format = f"{color}{original_format}{reset}"
            self._style._fmt = colored_format
            
            formatted = super().format(record)
            
            # 恢复原始格式
            self._style._fmt = original_format
            return formatted
        else:
            return super().format(record)


class LoggerManager:
    """日志管理器"""
    
    def __init__(self):
        """初始化日志管理器"""
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        
        # 创建不同级别的日志目录
        (self.log_dir / "debug").mkdir(exist_ok=True)
        (self.log_dir / "info").mkdir(exist_ok=True)
        (self.log_dir / "warning").mkdir(exist_ok=True)
        (self.log_dir / "error").mkdir(exist_ok=True)
        
        self._setup_root_logger()
    
    def _setup_root_logger(self):
        """设置根日志记录器"""
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.DEBUG)
        
        # 清除现有的处理器
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # 添加控制台处理器
        self._add_console_handler(root_logger)
        
        # 添加文件处理器
        self._add_file_handlers(root_logger)
    
    def _add_console_handler(self, logger: logging.Logger):
        """添加控制台处理器"""
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, settings.LOG_LEVEL))
        
        # 为控制台处理器添加标记，用于颜色格式化
        console_handler.stream = sys.stdout
        
        formatter = CustomFormatter(include_location=True)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
    
    def _add_file_handlers(self, logger: logging.Logger):
        """添加文件处理器"""
        # 所有日志文件处理器
        all_handler = self._create_rotating_handler(
            self.log_dir / "all.log",
            level=logging.DEBUG
        )
        logger.addHandler(all_handler)
        
        # 错误日志文件处理器
        error_handler = self._create_rotating_handler(
            self.log_dir / "error" / "error.log",
            level=logging.ERROR
        )
        logger.addHandler(error_handler)
        
        # 警告日志文件处理器
        warning_handler = self._create_rotating_handler(
            self.log_dir / "warning" / "warning.log",
            level=logging.WARNING
        )
        logger.addHandler(warning_handler)
        
        # 信息日志文件处理器
        info_handler = self._create_rotating_handler(
            self.log_dir / "info" / "info.log",
            level=logging.INFO
        )
        logger.addHandler(info_handler)
        
        # 调试日志文件处理器
        debug_handler = self._create_rotating_handler(
            self.log_dir / "debug" / "debug.log",
            level=logging.DEBUG
        )
        logger.addHandler(debug_handler)
    
    def _create_rotating_handler(
        self, 
        filename: Path, 
        level: int,
        max_bytes: int = 10 * 1024 * 1024,  # 10MB
        backup_count: int = 5
    ) -> logging.handlers.RotatingFileHandler:
        """
        创建轮转文件处理器
        
        Args:
            filename: 日志文件路径
            level: 日志级别
            max_bytes: 单个文件最大字节数
            backup_count: 备份文件数量
            
        Returns:
            轮转文件处理器
        """
        handler = logging.handlers.RotatingFileHandler(
            filename=filename,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        handler.setLevel(level)
        
        formatter = CustomFormatter(include_location=True)
        handler.setFormatter(formatter)
        
        return handler
    
    def get_logger(self, name: str) -> logging.Logger:
        """
        获取指定名称的日志记录器
        
        Args:
            name: 日志记录器名称
            
        Returns:
            日志记录器实例
        """
        return logging.getLogger(name)


# 全局日志管理器实例
logger_manager = LoggerManager()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    获取日志记录器
    
    Args:
        name: 日志记录器名称，如果为None则使用调用者的模块名
        
    Returns:
        日志记录器实例
    """
    if name is None:
        # 自动获取调用者的模块名
        import inspect
        frame = inspect.currentframe().f_back
        name = frame.f_globals.get('__name__', 'unknown')
    
    return logger_manager.get_logger(name)


def log_function_call(func):
    """
    装饰器：记录函数调用日志
    
    Args:
        func: 被装饰的函数
        
    Returns:
        装饰后的函数
    """
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        logger.debug(f"调用函数 {func.__name__}，参数: args={args}, kwargs={kwargs}")
        
        try:
            result = func(*args, **kwargs)
            logger.debug(f"函数 {func.__name__} 执行成功")
            return result
        except Exception as e:
            logger.error(f"函数 {func.__name__} 执行失败: {str(e)}")
            raise
    
    return wrapper


def log_exception(logger: logging.Logger, exc: Exception, context: str = ""):
    """
    记录异常日志
    
    Args:
        logger: 日志记录器
        exc: 异常对象
        context: 异常上下文信息
    """
    import traceback
    
    error_msg = f"异常发生: {type(exc).__name__}: {str(exc)}"
    if context:
        error_msg = f"{context} - {error_msg}"
    
    logger.error(error_msg)
    logger.error(f"异常堆栈:\n{traceback.format_exc()}")