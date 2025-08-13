-- 创建微信公众号API账户表
-- 表名: api_accounts_wx
-- 描述: 存储微信公众号API账户信息

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_name ON api_accounts_wx(name);
CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_appid ON api_accounts_wx(appid);
CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_wx_id ON api_accounts_wx(wx_id);
CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_status ON api_accounts_wx(status);
CREATE INDEX IF NOT EXISTS idx_api_accounts_wx_created_at ON api_accounts_wx(created_at);

-- 添加注释
COMMENT ON TABLE api_accounts_wx IS '微信公众号API账户表';
COMMENT ON COLUMN api_accounts_wx.id IS '主键ID';
COMMENT ON COLUMN api_accounts_wx.name IS '账户名称';
COMMENT ON COLUMN api_accounts_wx.appid IS '微信公众号AppID';
COMMENT ON COLUMN api_accounts_wx.app_secret IS '微信公众号AppSecret';
COMMENT ON COLUMN api_accounts_wx.wx_id IS '微信公众号ID';
COMMENT ON COLUMN api_accounts_wx.title IS '默认标题';
COMMENT ON COLUMN api_accounts_wx.author IS '作者名称';
COMMENT ON COLUMN api_accounts_wx.thumb_media_id IS '默认封面媒体ID';
COMMENT ON COLUMN api_accounts_wx.illust_tag IS '插图标签，JSON格式';
COMMENT ON COLUMN api_accounts_wx.status IS '账户状态';
COMMENT ON COLUMN api_accounts_wx.created_at IS '创建时间';
COMMENT ON COLUMN api_accounts_wx.updated_at IS '更新时间';

-- 插入示例数据
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

-- 创建更新时间触发器（PostgreSQL）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_accounts_wx_updated_at 
    BEFORE UPDATE ON api_accounts_wx 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 