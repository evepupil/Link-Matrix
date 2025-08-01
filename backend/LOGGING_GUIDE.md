# 日志系统使用指南

## 概述

本项目已集成了完整的日志系统，支持文件和控制台输出，并能记录代码文件和行数信息。日志文件存储在 `log` 目录中。

## 日志配置

### 环境变量配置

在 `.env` 文件中可以配置以下日志相关参数：

```env
LOG_LEVEL=INFO                    # 日志级别 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_DIR=log                       # 日志目录
LOG_MAX_SIZE=10485760            # 单个日志文件最大大小 (10MB)
LOG_BACKUP_COUNT=5               # 日志文件备份数量
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s
```

### 日志文件结构

```
log/
├── app.log              # 应用主日志
├── app_debug.log        # DEBUG级别日志
├── app_info.log         # INFO级别日志
├── app_warning.log      # WARNING级别日志
├── app_error.log        # ERROR级别日志
└── app_critical.log     # CRITICAL级别日志
```

## 使用方法

### 1. 基本使用

```python
from app.core.logger import get_logger

# 获取日志记录器
logger = get_logger(__name__)

# 记录不同级别的日志
logger.debug("调试信息")
logger.info("一般信息")
logger.warning("警告信息")
logger.error("错误信息")
logger.critical("严重错误")
```

### 2. 函数装饰器

使用 `@log_function_call` 装饰器自动记录函数调用：

```python
from app.core.logger import get_logger, log_function_call

logger = get_logger(__name__)

@log_function_call(logger)
def my_function(param1, param2):
    """这个函数会自动记录调用和返回信息"""
    return param1 + param2
```

### 3. 异常日志记录

使用 `log_exception` 函数记录异常信息：

```python
from app.core.logger import get_logger, log_exception

logger = get_logger(__name__)

try:
    # 可能出错的代码
    result = risky_operation()
except Exception as e:
    log_exception(logger, e, "执行风险操作时发生错误")
    raise
```

### 4. 在路由中使用

```python
from fastapi import APIRouter, Request
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

@router.get("/example")
def example_endpoint(request: Request):
    client_ip = request.client.host
    logger.info(f"示例接口请求 - IP: {client_ip}")
    
    try:
        # 业务逻辑
        result = process_request()
        logger.info(f"示例接口处理成功 - IP: {client_ip}")
        return result
    except Exception as e:
        log_exception(logger, e, f"示例接口处理失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail="处理失败")
```

## 日志格式说明

日志输出格式包含以下信息：
- 时间戳
- 日志记录器名称
- 日志级别
- 文件名和行号
- 日志消息

示例输出：
```
2024-01-15 10:30:45,123 - app.routers.account - INFO - account.py:25 - 创建账户请求 - IP: 127.0.0.1, 用户名: test_user, 平台: platform1
```

## 日志级别说明

- **DEBUG**: 详细的调试信息，通常只在诊断问题时使用
- **INFO**: 一般信息，确认程序按预期工作
- **WARNING**: 警告信息，程序仍在工作，但可能出现问题
- **ERROR**: 错误信息，程序某些功能无法正常工作
- **CRITICAL**: 严重错误，程序可能无法继续运行

## 最佳实践

1. **合理选择日志级别**：
   - 使用 INFO 记录重要的业务操作
   - 使用 WARNING 记录潜在问题
   - 使用 ERROR 记录错误但不影响程序继续运行
   - 使用 CRITICAL 记录严重错误

2. **包含上下文信息**：
   - 记录用户IP、用户ID、操作对象等关键信息
   - 使用结构化的日志消息格式

3. **避免敏感信息**：
   - 不要记录密码、API密钥等敏感信息
   - 对敏感数据进行脱敏处理

4. **性能考虑**：
   - 避免在高频调用的函数中使用DEBUG级别日志
   - 使用延迟格式化避免不必要的字符串操作

## 日志监控

日志文件会自动轮转，当文件大小超过配置的最大值时会创建新文件。建议定期检查日志文件，监控应用运行状态。

可以使用以下命令查看实时日志：

```bash
# 查看所有日志
tail -f log/app.log

# 查看错误日志
tail -f log/app_error.log

# 搜索特定内容
grep "ERROR" log/app.log
```