#!/usr/bin/env python3
"""
Supabase配置检查脚本
用于验证Supabase配置是否正确
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.config import settings
from app.database.supabase_init import test_supabase_connection, init_supabase_tables

def check_environment():
    """检查环境变量配置"""
    print("🔍 检查环境变量配置...")
    
    required_vars = {
        "SUPABASE_URL": settings.SUPABASE_URL,
        "SUPABASE_SERVICE_ROLE_KEY": settings.SUPABASE_SERVICE_ROLE_KEY
    }
    
    missing_vars = []
    for var_name, var_value in required_vars.items():
        if not var_value:
            missing_vars.append(var_name)
            print(f"  ❌ {var_name}: 未设置")
        else:
                    # 隐藏敏感信息
        if var_name == "SUPABASE_SERVICE_ROLE_KEY":
            display_value = var_value[:8] + "..." if len(var_value) > 8 else "***"
        else:
            display_value = var_value
            print(f"  ✅ {var_name}: {display_value}")
    
    if missing_vars:
        print(f"\n⚠️  缺少必要的环境变量: {', '.join(missing_vars)}")
        print("请创建 .env 文件并设置以下变量:")
        for var in missing_vars:
            if var == "SUPABASE_URL":
                print(f"  {var}=https://your-project-id.supabase.co")
            elif var == "SUPABASE_SERVICE_ROLE_KEY":
                print(f"  {var}=your-supabase-service-role-key")
        return False
    
    print("✅ 环境变量配置完整")
    return True

def check_supabase_config():
    """检查Supabase配置"""
    print("\n🔍 检查Supabase配置...")
    
    if not settings.is_using_supabase:
        print("  ❌ 未配置Supabase或配置不正确")
        print("  请确保:")
        print("    1. SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 已设置")
        return False
    
    print("  ✅ Supabase配置检测成功")
    
    # 显示连接信息
    print("\n📋 Supabase连接信息:")
    for key, value in settings.supabase_connection_info.items():
        if key == "has_key":
            print(f"  {key}: {'是' if value else '否'}")
        else:
            print(f"  {key}: {value}")
    
    return True

def test_connection():
    """测试Supabase连接"""
    print("\n🔍 测试Supabase连接...")
    
    try:
        if test_supabase_connection():
            print("  ✅ Supabase连接成功")
            return True
        else:
            print("  ❌ Supabase连接失败")
            return False
    except Exception as e:
        print(f"  ❌ 连接测试异常: {e}")
        return False

def init_database():
    """初始化数据库表"""
    print("\n🔍 初始化数据库表...")
    
    try:
        init_supabase_tables()
        print("  ✅ 数据库表初始化成功")
        return True
    except Exception as e:
        print(f"  ❌ 数据库表初始化失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 Supabase配置检查工具")
    print("=" * 50)
    
    # 检查环境变量
    if not check_environment():
        print("\n❌ 环境变量配置不完整，请先配置 .env 文件")
        return 1
    
    # 检查Supabase配置
    if not check_supabase_config():
        print("\n❌ Supabase配置不正确")
        return 1
    
    # 测试连接
    if not test_connection():
        print("\n❌ 无法连接到Supabase，请检查网络和配置")
        return 1
    
    # 初始化数据库
    if not init_database():
        print("\n❌ 数据库初始化失败")
        return 1
    
    print("\n🎉 所有检查通过！Supabase配置正确且可以正常使用")
    print("\n📝 下一步:")
    print("  1. 启动后端服务: python main.py")
    print("  2. 访问API文档: http://localhost:8000/docs")
    print("  3. 开始使用账号管理功能")
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 