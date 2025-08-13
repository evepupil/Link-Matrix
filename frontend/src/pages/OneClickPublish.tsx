import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Radio, 
  Upload, 
  Form, 
  Input, 
  Select, 
  Button, 
  Checkbox, 
  Row, 
  Col, 
  message,
  Space,
  Image,
  Typography,
  Tabs
} from 'antd';
import { 
  UploadOutlined, 
  SendOutlined, 
  FileTextOutlined, 
  VideoCameraOutlined,
  WechatOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import WeixinPublish from './OneClickPublish/WeixinPublish/index';

const { TextArea } = Input;
const { Text } = Typography;

interface Account {
  id: string;
  platform: string;
  accountName: string;
  status: 'online' | 'offline';
}

interface PublishContent {
  type: 'video' | 'article';
  title: string;
  description: string;
  tags: string[];
  cover?: string;
  content?: string;
  videoFile?: string;
}

/**
 * 一键发布页面组件
 * 支持视频、文章和微信公众号的多平台发布
 */
const OneClickPublish: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [contentType, setContentType] = useState<'video' | 'article'>('video');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [publishContent, setPublishContent] = useState<PublishContent>({
    type: 'video',
    title: '',
    description: '',
    tags: [],
  });
  const [form] = Form.useForm();

  /**
   * 获取账户列表
   */
  const fetchAccounts = async () => {
    try {
      // TODO: 调用后端API
      setAccounts([
        { id: '1', platform: 'weibo', accountName: '我的微博账号', status: 'online' },
        { id: '2', platform: 'wechat', accountName: '企业微信号', status: 'online' },
        { id: '3', platform: 'youtube', accountName: 'My YouTube Channel', status: 'offline' },
        { id: '4', platform: 'twitter', accountName: '@mytwitter', status: 'online' },
      ]);
    } catch (error) {
      message.error('获取账户列表失败');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /**
   * 文件上传配置
   */
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info) => {
      if (info.fileList.length > 0) {
        const file = info.fileList[0];
        if (contentType === 'video') {
          setPublishContent(prev => ({ ...prev, videoFile: file.name }));
        } else {
          // 处理封面图片
          setPublishContent(prev => ({ ...prev, cover: file.name }));
        }
      }
    },
  };

  /**
   * 处理账户选择
   */
  const handleAccountSelection = (checkedValues: string[]) => {
    setSelectedAccounts(checkedValues);
  };

  /**
   * 获取平台名称
   */
  const getPlatformName = (platform: string) => {
    const platformNames: Record<string, string> = {
      'weibo': '微博',
      'wechat': '微信',
      'youtube': 'YouTube',
      'twitter': 'Twitter',
    };
    return platformNames[platform] || platform;
  };

  /**
   * 处理发布
   */
  const handlePublish = () => {
    if (selectedAccounts.length === 0) {
      message.warning('请选择至少一个发布平台');
      return;
    }

    if (!publishContent.title || !publishContent.description) {
      message.warning('请填写标题和描述');
      return;
    }

    message.success('发布任务已提交');
    console.log('发布内容:', publishContent);
    console.log('选择的账户:', selectedAccounts);
  };

  // 通用发布内容
  const GeneralPublish = () => (
    <Row gutter={24}>
      <Col span={16}>
        <Card title="内容配置" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical">
            <Form.Item label="内容类型">
              <Radio.Group 
                value={contentType} 
                onChange={(e) => setContentType(e.target.value)}
              >
                <Radio.Button value="video">
                  <VideoCameraOutlined /> 视频
                </Radio.Button>
                <Radio.Button value="article">
                  <FileTextOutlined /> 文章
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input 
                placeholder="请输入内容标题" 
                value={publishContent.title}
                onChange={(e) => setPublishContent(prev => ({ ...prev, title: e.target.value }))}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea 
                rows={4}
                placeholder="请输入内容描述"
                value={publishContent.description}
                onChange={(e) => setPublishContent(prev => ({ ...prev, description: e.target.value }))}
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="标签"
            >
              <Select
                mode="tags"
                placeholder="请输入标签，按回车确认"
                value={publishContent.tags}
                onChange={(value) => setPublishContent(prev => ({ ...prev, tags: value }))}
              />
            </Form.Item>

            {contentType === 'video' ? (
              <Form.Item
                name="videoFile"
                label="视频文件"
                rules={[{ required: true, message: '请上传视频文件' }]}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>选择视频文件</Button>
                </Upload>
              </Form.Item>
            ) : (
              <Form.Item
                name="content"
                label="文章内容"
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <TextArea 
                  rows={8}
                  placeholder="请输入文章内容"
                  value={publishContent.content}
                  onChange={(e) => setPublishContent(prev => ({ ...prev, content: e.target.value }))}
                />
              </Form.Item>
            )}
          </Form>
        </Card>
      </Col>

      <Col span={8}>
        <Card title="选择发布账户" style={{ marginBottom: 16 }}>
          <Checkbox.Group 
            value={selectedAccounts}
            onChange={handleAccountSelection}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {accounts.map(account => (
                <Checkbox 
                  key={account.id} 
                  value={account.id}
                  disabled={account.status === 'offline'}
                >
                  <Space>
                    <span>{getPlatformName(account.platform)}</span>
                    <span style={{ color: '#666' }}>({account.accountName})</span>
                    {account.status === 'offline' && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>离线</Text>
                    )}
                  </Space>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Card>

        <Card title="发布预览">
          <div style={{ marginBottom: 16 }}>
            <Text strong>标题：</Text>
            <div>{publishContent.title || '请输入标题'}</div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>描述：</Text>
            <div style={{ 
              maxHeight: '100px', 
              overflow: 'auto',
              color: publishContent.description ? 'inherit' : '#999'
            }}>
              {publishContent.description || '请输入描述'}
            </div>
          </div>

          {publishContent.tags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>标签：</Text>
              <div>
                {publishContent.tags.map(tag => (
                  <span key={tag} style={{ 
                    background: '#f0f0f0', 
                    padding: '2px 8px', 
                    margin: '2px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <Text strong>发布平台：</Text>
            <div>
              {selectedAccounts.length > 0 
                ? selectedAccounts.map(id => {
                    const account = accounts.find(acc => acc.id === id);
                    return account ? getPlatformName(account.platform) : '';
                  }).join('、')
                : '请选择发布平台'
              }
            </div>
          </div>

          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handlePublish}
            block
            size="large"
          >
            提交发布任务
          </Button>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          一键发布
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          支持视频、文章和微信公众号的多平台发布，提高内容分发效率
        </p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'general',
            label: (
              <span>
                <SendOutlined />
                通用发布
              </span>
            ),
            children: <GeneralPublish />,
          },
          {
            key: 'weixin',
            label: (
              <span>
                <WechatOutlined />
                微信公众号
              </span>
            ),
            children: <WeixinPublish />,
          },
        ]}
      />
    </div>
  );
};

export default OneClickPublish;