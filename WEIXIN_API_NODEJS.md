# Node.js 微信公众号API实现

## 🎯 功能概述

基于Python版本的微信公众号API，在Node.js + TypeScript环境中实现了完整的微信公众号发布功能。

## 📁 文件结构

```
nodejs_backend/src/services/
├── weixinAPI.ts          # 微信API核心类
├── weixinService.ts      # 微信服务集成
└── supabase.ts          # 数据库服务
```

## 🛠️ 核心类和方法

### WeixinAPI 类

#### 构造函数
```typescript
constructor(appid: string, secret: string)
```

#### 主要方法

##### 1. 获取访问令牌
```typescript
async getAccessToken(): Promise<string | null>
```
- 自动获取微信API访问令牌
- 令牌会缓存在实例中

##### 2. 上传图片到素材库
```typescript
async addMediaAndReturnPids(imageDir: string): Promise<string[]>
```
- 批量上传指定目录的图片到微信素材库
- 自动从文件名提取PID
- 返回成功上传的PID列表

##### 3. 创建草稿文章
```typescript
async addDraft(articleData: ArticleData): Promise<{ success: boolean; media_id?: string; error?: string }>
```
- 创建包含图片的草稿文章
- 自动生成模板化的HTML内容
- 返回草稿的media_id

### WeixinService 集成类

#### 主要方法

##### 1. 发布到微信（任务队列）
```typescript
static async publishToWeixin(account_id: number, pids: number[], unfit_pids: number[]): Promise<string>
```
- 异步任务队列方式发布
- 返回任务ID，可用于监控进度

##### 2. 直接发布到微信
```typescript
static async publishToWeixinReal(account_id: number, pids: number[], unfit_pids: number[]): Promise<{ success: boolean; media_id?: string; error?: string }>
```
- 同步方式直接发布
- 完整的发布流程实现

## 🚀 使用流程

### 1. 基本发布流程

```typescript
// 1. 准备参数
const account_id = 1;
const pids = [123456, 789012, 345678];
const unfit_pids = [456789];

// 2. 调用发布服务
const result = await WeixinService.publishToWeixinReal(account_id, pids, unfit_pids);

if (result.success) {
  console.log('发布成功，media_id:', result.media_id);
} else {
  console.error('发布失败:', result.error);
}
```

### 2. 任务队列发布

```typescript
// 1. 创建发布任务
const taskId = await WeixinService.publishToWeixin(account_id, pids, unfit_pids);

// 2. 监控任务进度
const progress = await WeixinService.getPublishProgress(taskId);
console.log('进度:', progress);
```

## 📋 详细发布流程

### 1. 准备阶段
1. 获取微信账户配置（从数据库）
2. 创建临时目录
3. 复制已下载的图片到临时目录

### 2. 上传阶段
1. 初始化微信API实例
2. 批量上传图片到微信素材库
3. 获取上传后的图片URL

### 3. 文章创建阶段
1. 生成文章标题（基于日期和账户配置）
2. 使用模板生成HTML内容
3. 创建草稿文章

### 4. 数据库更新阶段
1. 标记不合格图片（unfit=true）
2. 更新发布图片的wx_name字段
3. 清理临时文件

## 🔧 API接口

### 发布相关接口

#### 1. 任务队列发布
```http
POST /api/v1/weixin/publish
Content-Type: application/json

{
  "account_id": 1,
  "pids": [123456, 789012],
  "unfit_pids": [456789]
}
```

#### 2. 直接发布
```http
POST /api/v1/weixin/publish-direct
Content-Type: application/json

{
  "account_id": 1,
  "pids": [123456, 789012],
  "unfit_pids": [456789]
}
```

#### 3. 获取发布进度
```http
GET /api/v1/weixin/publish-progress/{taskId}
```

## 📊 数据结构

### 微信账户配置
```typescript
interface WeixinConfig {
  appid: string;           // 微信AppID
  secret: string;          // 微信AppSecret
  author: string;          // 文章作者
  thumb_media_id: string;  // 封面图片媒体ID
}
```

### 文章数据
```typescript
interface ArticleData {
  title: string;                  // 文章标题
  author: string;                 // 作者
  content: string;                // 文章内容（HTML）
  thumb_media_id: string;         // 封面图片媒体ID
  digest?: string;                // 摘要
  need_open_comment?: number;     // 是否开启评论
  only_fans_can_comment?: number; // 仅粉丝可评论
}
```

## 🎨 HTML模板

文章使用预定义的HTML模板，包含：
- 顶部装饰图片
- "点击蓝字，关注我们" 引导文字
- 分割线装饰
- 图片展示区域
- 底部版权声明
- "觉得内容还不错的话，给我点个在看呗" 互动引导

## 🔍 错误处理

### 常见错误类型
1. **Token获取失败**：检查AppID和AppSecret
2. **图片上传失败**：检查图片格式和大小
3. **文章创建失败**：检查内容格式和权限
4. **数据库更新失败**：检查数据库连接和权限

### 错误日志
所有操作都有详细的日志输出：
- ✅ 成功操作
- ❌ 失败操作  
- ⚠️ 警告信息
- 📊 状态信息

## 🧪 测试

### 运行测试脚本
```bash
node test_weixin_publish_real.js
```

### 测试覆盖
- 图片查询和下载
- 微信API调用
- 任务队列功能
- 数据库更新
- 错误处理

## ⚙️ 配置要求

### 环境变量
```bash
# Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 数据库表结构

#### api_accounts_wx 表
```sql
CREATE TABLE api_accounts_wx (
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
```

#### pic 表更新
需要包含以下字段：
- `wx_name`: VARCHAR - 关联的微信公众号名称
- `unfit`: BOOLEAN - 是否为不合格图片

### 依赖包
```json
{
  "dependencies": {
    "axios": "^1.x.x",
    "form-data": "^4.x.x"
  }
}
```

## 🔒 安全注意事项

1. **访问令牌安全**：访问令牌会缓存在内存中，生产环境建议使用Redis
2. **AppSecret保护**：确保AppSecret不会暴露在日志或前端代码中
3. **文件权限**：临时文件目录需要适当的读写权限
4. **错误信息**：生产环境中避免暴露敏感的错误信息

## 📈 性能优化

1. **并发上传**：图片上传支持并发处理
2. **临时文件清理**：自动清理临时文件避免磁盘空间问题
3. **错误重试**：关键操作支持重试机制
4. **内存管理**：及时释放大文件占用的内存

## 🔄 与Python版本的对比

| 功能 | Python版本 | Node.js版本 | 说明 |
|------|------------|-------------|------|
| 访问令牌获取 | ✅ | ✅ | 功能一致 |
| 图片上传 | ✅ | ✅ | 支持并发处理 |
| 草稿创建 | ✅ | ✅ | HTML模板一致 |
| 数据库更新 | ✅ | ✅ | 使用Supabase |
| 错误处理 | 基础 | 增强 | 更详细的日志 |
| 任务队列 | ❌ | ✅ | 新增功能 |
| TypeScript支持 | ❌ | ✅ | 类型安全 |

---

## 📞 技术支持

如有问题，请检查：
1. 微信API权限和配置
2. 数据库连接状态
3. 图片文件存在性
4. 网络连接状况

查看详细日志：
```bash
npm run dev
```