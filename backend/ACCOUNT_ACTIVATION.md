# 账户激活和登录检查功能

## 功能概述

本系统实现了完整的账户激活和登录状态检查功能，支持：

1. **账户激活**：启动有头浏览器让用户手动登录
2. **登录状态检查**：使用无头浏览器检查用户是否已登录
3. **登录状态刷新**：自动检查并更新账户登录状态

## 核心功能

### 1. 激活账户 (Activate Account)

**API端点**: `POST /api/v1/accounts/{account_id}/activate`

**功能描述**:
- 启动有头浏览器（用户可见）
- 导航到对应平台的登录页面
- 等待用户手动完成登录操作
- 自动保存登录状态到存储文件
- 更新账户状态为 "active"

**使用流程**:
1. 用户调用激活API
2. 系统弹出浏览器窗口
3. 用户在浏览器中完成登录
4. 系统检测登录完成并保存状态
5. 返回激活结果

### 2. 检查登录状态 (Check Login Status)

**API端点**: `GET /api/v1/accounts/{account_id}/check-login`

**功能描述**:
- 使用无头浏览器访问个人中心页面
- 检测登录状态指示器
- 获取用户信息（如果已登录）
- 更新账户状态

**返回信息**:
```json
{
    "account_id": 1,
    "username": "test_user",
    "platform": "douyin",
    "is_logged_in": true,
    "user_info": {
        "username": "用户昵称"
    },
    "status": "active",
    "last_login": "2024-01-01T12:00:00"
}
```

### 3. 刷新登录状态 (Refresh Login Status)

**API端点**: `POST /api/v1/accounts/{account_id}/refresh-login`

**功能描述**:
- 先检查当前登录状态
- 如果未登录，将状态设置为 "need_activation"
- 如果已登录，保持当前状态
- 返回更新后的账户信息

## 技术实现

### 自动化基类 (BrowserAutomationBase)

```python
class BrowserAutomationBase(ABC):
    async def start(self, headless: bool = True) -> None:
        """启动浏览器实例"""
    
    @abstractmethod
    def get_login_url(self) -> str:
        """获取登录页面URL"""
    
    @abstractmethod
    async def wait_for_login_completion(self) -> None:
        """等待用户登录完成"""
    
    @abstractmethod
    async def save_login_state(self) -> None:
        """保存登录状态"""
    
    @abstractmethod
    async def check_login_status(self) -> dict:
        """检查登录状态"""
```

### 平台实现 (以抖音为例)

```python
class DouyinAutomation(BrowserAutomationBase):
    def get_login_url(self) -> str:
        return "https://www.douyin.com/login"
    
    async def wait_for_login_completion(self) -> None:
        # 等待URL变化和登录成功标志
        await self.page.wait_for_url(
            lambda url: not url.startswith(self.login_url) and "douyin.com" in url,
            timeout=300000
        )
    
    async def check_login_status(self) -> dict:
        # 访问个人中心并检查登录状态
        await self.page.goto("https://www.douyin.com/user")
        # 检查登录指示器...
```

## 使用示例

### 1. 创建账户和浏览器配置

```python
# 创建浏览器配置
browser_profile = BrowserProfile(
    name="我的配置",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    screen_width=1920,
    screen_height=1080,
    storage_path="./browser_profiles/my_profile/storage_state.json"
)

# 创建账户
account = Account(
    platform="douyin",
    name="我的抖音账户",
    username="my_douyin_user",
    browser_profile_id=browser_profile.id
)
```

### 2. 激活账户

```bash
# 调用激活API
curl -X POST "http://localhost:8000/api/v1/accounts/1/activate"
```

系统会：
1. 启动有头浏览器
2. 导航到抖音登录页面
3. 等待用户手动登录
4. 保存登录状态

### 3. 检查登录状态

```bash
# 检查登录状态
curl "http://localhost:8000/api/v1/accounts/1/check-login"
```

### 4. 刷新登录状态

```bash
# 刷新登录状态
curl -X POST "http://localhost:8000/api/v1/accounts/1/refresh-login"
```

## 状态说明

### 账户状态 (Account Status)

- `inactive`: 未激活，需要调用激活接口
- `active`: 已激活且登录正常
- `need_activation`: 需要激活（登录状态检查失败）
- `error`: 发生错误
- `login_failed`: 登录失败

### 登录检查结果

- `is_logged_in`: true/false
- `user_info`: 用户信息（如果已登录）
- `current_url`: 当前页面URL
- `error`: 错误信息（如果有）

## 扩展支持

### 添加新平台支持

1. 创建新的自动化类继承 `BrowserAutomationBase`
2. 实现所有抽象方法
3. 在 `AutomationFactory` 中注册新平台

```python
class KuaishouAutomation(BrowserAutomationBase):
    def get_login_url(self) -> str:
        return "https://www.kuaishou.com/login"
    
    # 实现其他抽象方法...

# 注册新平台
AutomationFactory.register_platform("kuaishou", KuaishouAutomation)
```

## 注意事项

1. **浏览器依赖**: 需要安装 Playwright 浏览器
   ```bash
   playwright install
   ```

2. **存储路径**: 确保浏览器配置目录有写入权限

3. **代理支持**: 可以在浏览器配置中设置代理

4. **超时设置**: 登录等待时间默认为5分钟，可根据需要调整

5. **错误处理**: 所有操作都有完整的错误处理和日志记录

## 测试

运行测试脚本：

```bash
cd backend
python test_account_activation.py
```

这将创建一个测试账户并演示完整的激活流程。 