#!/usr/bin/env python3
"""
测试账户激活和登录检查功能
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.services import account_service
from app.models.models import Account, BrowserProfile
from app.models.schemas import AccountCreate

async def test_account_activation():
    """测试账户激活功能"""
    print("=== 测试账户激活功能 ===")
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 1. 创建浏览器配置
        browser_profile = BrowserProfile(
            name="测试配置",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            screen_width=1920,
            screen_height=1080,
            storage_path="./browser_profiles/test_profile/storage_state.json"
        )
        db.add(browser_profile)
        db.commit()
        db.refresh(browser_profile)
        
        print(f"创建浏览器配置: ID={browser_profile.id}")
        
        # 2. 创建账户
        account_data = AccountCreate(
            platform="douyin",
            name="测试账户",
            username="test_user",
            browser_profile_id=browser_profile.id
        )
        
        account = account_service.create_account(db, account_data)
        print(f"创建账户: ID={account.id}, 用户名={account.username}")
        
        # 3. 激活账户（启动有头浏览器）
        print("\n开始激活账户...")
        print("请在弹出的浏览器中完成登录操作")
        
        activated_account = await account_service.activate_account(db, account.id)
        print(f"账户激活完成: 状态={activated_account.status}")
        
        # 4. 检查登录状态
        print("\n检查登录状态...")
        login_status = await account_service.check_login_status(db, account.id)
        print(f"登录状态: {login_status}")
        
        # 5. 刷新登录状态
        print("\n刷新登录状态...")
        refreshed_account = await account_service.refresh_login(db, account.id)
        print(f"刷新结果: 状态={refreshed_account.status}")
        
    except Exception as e:
        print(f"测试过程中出错: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_account_activation()) 