from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models import schemas
from app.services import account_service

router = APIRouter()

@router.post("/", response_model=schemas.Account)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    """创建新账户"""
    try:
        return account_service.create_account(db, account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建账户失败: {str(e)}")

@router.get("/", response_model=List[schemas.Account])
def read_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取账户列表"""
    return account_service.get_accounts(db, skip=skip, limit=limit)

@router.get("/{account_id}", response_model=schemas.Account)
def read_account(account_id: int, db: Session = Depends(get_db)):
    """获取特定账户"""
    account = account_service.get_account(db, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="账户不存在")
    return account

@router.put("/{account_id}", response_model=schemas.Account)
def update_account(account_id: int, account: schemas.AccountUpdate, db: Session = Depends(get_db)):
    """更新账户信息"""
    try:
        return account_service.update_account(db, account_id, account)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新账户失败: {str(e)}")

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """删除账户"""
    try:
        account_service.delete_account(db, account_id)
        return {"message": "账户删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除账户失败: {str(e)}")

@router.post("/{account_id}/activate", response_model=schemas.Account)
async def activate_account(account_id: int, db: Session = Depends(get_db)):
    """激活账户 - 启动有头浏览器让用户手动登录"""
    try:
        return await account_service.activate_account(db, account_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"激活账户失败: {str(e)}")

@router.get("/{account_id}/check-login")
async def check_login_status(account_id: int, db: Session = Depends(get_db)):
    """检查账户登录状态"""
    try:
        return await account_service.check_login_status(db, account_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查登录状态失败: {str(e)}")

@router.post("/{account_id}/refresh-login", response_model=schemas.Account)
async def refresh_login(account_id: int, db: Session = Depends(get_db)):
    """刷新账户登录状态"""
    try:
        return await account_service.refresh_login(db, account_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刷新登录状态失败: {str(e)}")