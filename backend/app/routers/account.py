from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models import schemas
from app.services import account_service
from app.core.logger import get_logger, log_exception

router = APIRouter()
logger = get_logger(__name__)

# ==================== 浏览器账户路由 ====================

@router.post("/browser/", response_model=schemas.Account)
def create_browser_account(account: schemas.AccountCreate, request: Request, db: Session = Depends(get_db)):
    """创建新的浏览器账户"""
    client_ip = request.client.host
    logger.info(f"创建浏览器账户请求 - IP: {client_ip}, 用户名: {account.username}, 平台: {account.platform}")
    
    try:
        result = account_service.create_browser_account(db, account)
        logger.info(f"浏览器账户创建成功 - ID: {result.id}, 用户名: {result.username}")
        return result
    except ValueError as e:
        logger.warning(f"创建浏览器账户参数错误 - IP: {client_ip}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"创建浏览器账户失败 - IP: {client_ip}, 用户名: {account.username}")
        raise HTTPException(status_code=500, detail=f"创建浏览器账户失败: {str(e)}")

@router.get("/browser/", response_model=List[schemas.Account])
def read_browser_accounts(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取浏览器账户列表"""
    client_ip = request.client.host
    logger.info(f"获取浏览器账户列表请求 - IP: {client_ip}, skip: {skip}, limit: {limit}")
    
    try:
        accounts = account_service.get_browser_accounts(db)
        logger.info(f"浏览器账户列表获取成功 - IP: {client_ip}, 返回 {len(accounts)} 个账户")
        return accounts
    except Exception as e:
        log_exception(logger, e, f"获取浏览器账户列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取浏览器账户列表失败: {str(e)}")

@router.get("/browser/{account_id}", response_model=schemas.Account)
def read_browser_account(account_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定浏览器账户"""
    client_ip = request.client.host
    logger.info(f"获取浏览器账户详情请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account = account_service.get_browser_account(db, account_id)
        if account is None:
            logger.warning(f"浏览器账户不存在 - IP: {client_ip}, 账户ID: {account_id}")
            raise HTTPException(status_code=404, detail="浏览器账户不存在")
        
        logger.info(f"浏览器账户详情获取成功 - IP: {client_ip}, 账户: {account.username}@{account.platform}")
        return account
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取浏览器账户详情失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"获取浏览器账户详情失败: {str(e)}")

@router.put("/browser/{account_id}", response_model=schemas.Account)
def update_browser_account(account_id: int, account: schemas.AccountUpdate, request: Request, db: Session = Depends(get_db)):
    """更新浏览器账户信息"""
    client_ip = request.client.host
    logger.info(f"更新浏览器账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = account_service.update_browser_account(db, account_id, account)
        logger.info(f"浏览器账户更新成功 - IP: {client_ip}, 账户: {result.username}@{result.platform}")
        return result
    except ValueError as e:
        logger.warning(f"更新浏览器账户参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"更新浏览器账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"更新浏览器账户失败: {str(e)}")

@router.delete("/browser/{account_id}")
def delete_browser_account(account_id: int, request: Request, db: Session = Depends(get_db)):
    """删除浏览器账户"""
    client_ip = request.client.host
    logger.info(f"删除浏览器账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account_service.delete_browser_account(db, account_id)
        logger.info(f"浏览器账户删除成功 - IP: {client_ip}, 账户ID: {account_id}")
        return {"message": "浏览器账户删除成功"}
    except Exception as e:
        log_exception(logger, e, f"删除浏览器账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"删除浏览器账户失败: {str(e)}")

# ==================== API账户路由 ====================

@router.post("/api/wx/", response_model=schemas.ApiAccountWx)
def create_api_account_wx(account: schemas.ApiAccountWxCreate, request: Request, db: Session = Depends(get_db)):
    """创建新的微信公众号API账户"""
    client_ip = request.client.host
    logger.info(f"创建微信公众号API账户请求 - IP: {client_ip}, 名称: {account.name}")
    
    try:
        result = account_service.create_api_account_wx(db, account)
        logger.info(f"微信公众号API账户创建成功 - ID: {result.id}, 名称: {result.name}")
        return result
    except ValueError as e:
        logger.warning(f"创建微信公众号API账户参数错误 - IP: {client_ip}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"创建微信公众号API账户失败 - IP: {client_ip}, 名称: {account.name}")
        raise HTTPException(status_code=500, detail=f"创建微信公众号API账户失败: {str(e)}")

@router.get("/api/wx/", response_model=List[schemas.ApiAccountWx])
def read_api_accounts_wx(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取微信公众号API账户列表"""
    client_ip = request.client.host
    logger.info(f"获取微信公众号API账户列表请求 - IP: {client_ip}, skip: {skip}, limit: {limit}")
    
    try:
        accounts = account_service.get_api_accounts_wx(db)
        logger.info(f"微信公众号API账户列表获取成功 - IP: {client_ip}, 返回 {len(accounts)} 个账户")
        return accounts
    except Exception as e:
        log_exception(logger, e, f"获取微信公众号API账户列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取微信公众号API账户列表失败: {str(e)}")

@router.get("/api/wx/{account_id}", response_model=schemas.ApiAccountWx)
def read_api_account_wx(account_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定微信公众号API账户"""
    client_ip = request.client.host
    logger.info(f"获取微信公众号API账户详情请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account = account_service.get_api_account_wx(db, account_id)
        if account is None:
            logger.warning(f"微信公众号API账户不存在 - IP: {client_ip}, 账户ID: {account_id}")
            raise HTTPException(status_code=404, detail="微信公众号API账户不存在")
        
        logger.info(f"微信公众号API账户详情获取成功 - IP: {client_ip}, 账户: {account.name}")
        return account
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取微信公众号API账户详情失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"获取微信公众号API账户详情失败: {str(e)}")

@router.put("/api/wx/{account_id}", response_model=schemas.ApiAccountWx)
def update_api_account_wx(account_id: int, account: schemas.ApiAccountWxUpdate, request: Request, db: Session = Depends(get_db)):
    """更新微信公众号API账户信息"""
    client_ip = request.client.host
    logger.info(f"更新微信公众号API账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = account_service.update_api_account_wx(db, account_id, account)
        logger.info(f"微信公众号API账户更新成功 - IP: {client_ip}, 账户: {result.name}")
        return result
    except ValueError as e:
        logger.warning(f"更新微信公众号API账户参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"更新微信公众号API账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"更新微信公众号API账户失败: {str(e)}")

@router.delete("/api/wx/{account_id}")
def delete_api_account_wx(account_id: int, request: Request, db: Session = Depends(get_db)):
    """删除微信公众号API账户"""
    client_ip = request.client.host
    logger.info(f"删除微信公众号API账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account_service.delete_api_account_wx(db, account_id)
        logger.info(f"微信公众号API账户删除成功 - IP: {client_ip}, 账户ID: {account_id}")
        return {"message": "微信公众号API账户删除成功"}
    except Exception as e:
        log_exception(logger, e, f"删除微信公众号API账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"删除微信公众号API账户失败: {str(e)}")

# ==================== 兼容性路由（保留原有接口） ====================

@router.post("/", response_model=schemas.Account)
def create_account(account: schemas.AccountCreate, request: Request, db: Session = Depends(get_db)):
    """创建新账户"""
    client_ip = request.client.host
    logger.info(f"创建账户请求 - IP: {client_ip}, 用户名: {account.username}, 平台: {account.platform}")
    
    try:
        result = account_service.create_account(db, account)
        logger.info(f"账户创建成功 - ID: {result.id}, 用户名: {result.username}")
        return result
    except ValueError as e:
        logger.warning(f"创建账户参数错误 - IP: {client_ip}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"创建账户失败 - IP: {client_ip}, 用户名: {account.username}")
        raise HTTPException(status_code=500, detail=f"创建账户失败: {str(e)}")

@router.get("/", response_model=List[schemas.Account])
def read_accounts(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取账户列表"""
    client_ip = request.client.host
    logger.info(f"获取账户列表请求 - IP: {client_ip}, skip: {skip}, limit: {limit}")
    
    try:
        accounts = account_service.get_accounts(db)
        logger.info(f"账户列表获取成功 - IP: {client_ip}, 返回 {len(accounts)} 个账户")
        return accounts
    except Exception as e:
        log_exception(logger, e, f"获取账户列表失败 - IP: {client_ip}")
        raise HTTPException(status_code=500, detail=f"获取账户列表失败: {str(e)}")

@router.get("/{account_id}", response_model=schemas.Account)
def read_account(account_id: int, request: Request, db: Session = Depends(get_db)):
    """获取特定账户"""
    client_ip = request.client.host
    logger.info(f"获取账户详情请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account = account_service.get_account(db, account_id)
        if account is None:
            logger.warning(f"账户不存在 - IP: {client_ip}, 账户ID: {account_id}")
            raise HTTPException(status_code=404, detail="账户不存在")
        
        logger.info(f"账户详情获取成功 - IP: {client_ip}, 账户: {account.username}@{account.platform}")
        return account
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, f"获取账户详情失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"获取账户详情失败: {str(e)}")

@router.put("/{account_id}", response_model=schemas.Account)
def update_account(account_id: int, account: schemas.AccountUpdate, request: Request, db: Session = Depends(get_db)):
    """更新账户信息"""
    client_ip = request.client.host
    logger.info(f"更新账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = account_service.update_account(db, account_id, account)
        logger.info(f"账户更新成功 - IP: {client_ip}, 账户: {result.username}@{result.platform}")
        return result
    except ValueError as e:
        logger.warning(f"更新账户参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"更新账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"更新账户失败: {str(e)}")

@router.delete("/{account_id}")
def delete_account(account_id: int, request: Request, db: Session = Depends(get_db)):
    """删除账户"""
    client_ip = request.client.host
    logger.info(f"删除账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        account_service.delete_account(db, account_id)
        logger.info(f"账户删除成功 - IP: {client_ip}, 账户ID: {account_id}")
        return {"message": "账户删除成功"}
    except Exception as e:
        log_exception(logger, e, f"删除账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"删除账户失败: {str(e)}")

@router.post("/{account_id}/activate", response_model=schemas.Account)
async def activate_account(account_id: int, request: Request, db: Session = Depends(get_db)):
    """激活账户 - 启动有头浏览器让用户手动登录"""
    client_ip = request.client.host
    logger.info(f"激活账户请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = await account_service.activate_account(db, account_id)
        logger.info(f"账户激活成功 - IP: {client_ip}, 账户: {result.username}@{result.platform}")
        return result
    except ValueError as e:
        logger.warning(f"激活账户参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"激活账户失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"激活账户失败: {str(e)}")

@router.get("/{account_id}/check-login")
async def check_login_status(account_id: int, request: Request, db: Session = Depends(get_db)):
    """检查账户登录状态"""
    client_ip = request.client.host
    logger.info(f"检查登录状态请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = await account_service.check_login_status(db, account_id)
        logger.info(f"登录状态检查完成 - IP: {client_ip}, 账户ID: {account_id}, 登录状态: {result.get('is_logged_in', False)}")
        return result
    except ValueError as e:
        logger.warning(f"检查登录状态参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"检查登录状态失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"检查登录状态失败: {str(e)}")

@router.post("/{account_id}/refresh-login", response_model=schemas.Account)
async def refresh_login(account_id: int, request: Request, db: Session = Depends(get_db)):
    """刷新账户登录状态"""
    client_ip = request.client.host
    logger.info(f"刷新登录状态请求 - IP: {client_ip}, 账户ID: {account_id}")
    
    try:
        result = await account_service.refresh_login(db, account_id)
        logger.info(f"登录状态刷新完成 - IP: {client_ip}, 账户: {result.username}@{result.platform}")
        return result
    except ValueError as e:
        logger.warning(f"刷新登录状态参数错误 - IP: {client_ip}, 账户ID: {account_id}, 错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_exception(logger, e, f"刷新登录状态失败 - IP: {client_ip}, 账户ID: {account_id}")
        raise HTTPException(status_code=500, detail=f"刷新登录状态失败: {str(e)}")