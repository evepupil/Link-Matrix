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
  Typography
} from 'antd';
import { 
  UploadOutlined, 
  SendOutlined, 
  FileTextOutlined, 
  VideoCameraOutlined 
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

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
 * 支持视频和文章的多平台发布
 */
const OneClickPublish: React.FC = () => {
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
   * 获取平台名称
   */
  const getPlatformName = (platform: string) => {
    const nameMap: Record<string, string> = {
      weibo: '微博',
      wechat: '微信',
      youtube: 'YouTube',
      twitter: 'Twitter',
    };
    return nameMap[platform] || platform;
  };

  /**
   * 处理账户选择
   */
  const handleAccountSelection = (accountIds: string[]) => {
    setSelectedAccounts(accountIds);
  };

  /**
   * 提交发布任务
   */
  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedAccounts.length === 0) {
        message.error('请至少选择一个发布账户');
        return;
      }

      if (contentType === 'video' && !publishContent.videoFile) {
        message.error('请上传视频文件');
        return;
      }

      // TODO: 调用后端API提交发布任务
      message.success('发布任务已提交到任务队列');
      
      // 重置表单
      form.resetFields();
      setSelectedAccounts([]);
      setPublishContent({
        type: contentType,
        title: '',
        description: '',
        tags: [],
      });
      
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div>
      <h1>一键发布</h1>
      
      <Row gutter={24}>
        <Col span={16}>
          <Card title="发布内容" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical">
              <Form.Item label="内容类型">
                <Radio.Group 
                  value={contentType} 
                  onChange={(e) => {
                    setContentType(e.target.value);
                    setPublishContent(prev => ({ ...prev, type: e.target.value }));
                  }}
                >
                  <Radio.Button value="video">
                    <VideoCameraOutlined /> 发布视频
                  </Radio.Button>
                  <Radio.Button value="article">
                    <FileTextOutlined /> 发布文章
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {contentType === 'video' ? (
                <Form.Item label="视频文件">
                  <Upload {...uploadProps} accept=".mp4,.avi,.mov,.mkv">
                    <Button icon={<UploadOutlined />}>选择视频文件</Button>
                  </Upload>
                  {publishContent.videoFile && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">已选择：{publishContent.videoFile}</Text>
                    </div>
                  )}
                </Form.Item>
              ) : (
                <Form.Item 
                  name="content" 
                  label="文章内容"
                  rules={[{ required: true, message: '请输入文章内容' }]}
                >
                  <TextArea 
                    rows={8} 
                    placeholder="请输入文章内容..."
                    onChange={(e) => 
                      setPublishContent(prev => ({ ...prev, content: e.target.value }))
                    }
                  />
                </Form.Item>
              )}

              <Form.Item 
                name="title" 
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input 
                  placeholder="请输入标题"
                  onChange={(e) => 
                    setPublishContent(prev => ({ ...prev, title: e.target.value }))
                  }
                />
              </Form.Item>

              <Form.Item 
                name="description" 
                label="描述"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入描述..."
                  onChange={(e) => 
                    setPublishContent(prev => ({ ...prev, description: e.target.value }))
                  }
                />
              </Form.Item>

              <Form.Item name="tags" label="标签">
                <Select
                  mode="tags"
                  placeholder="请输入标签，按回车添加"
                  onChange={(tags) => 
                    setPublishContent(prev => ({ ...prev, tags }))
                  }
                />
              </Form.Item>

              <Form.Item label="封面图片">
                <Upload {...uploadProps} accept=".jpg,.jpeg,.png,.gif">
                  <Button icon={<UploadOutlined />}>上传封面</Button>
                </Upload>
                {publishContent.cover && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">已选择：{publishContent.cover}</Text>
                  </div>
                )}
              </Form.Item>
            </Form>
          </Card>

          <Card title="平台适配设置">
            <Form layout="vertical">
              <Form.Item label="微博设置">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox>同时发布到微博故事</Checkbox>
                  <Checkbox>添加话题标签</Checkbox>
                  <Input placeholder="自定义话题标签" />
                </Space>
              </Form.Item>

              <Form.Item label="微信设置">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox>发布到朋友圈</Checkbox>
                  <Checkbox>同步到微信群</Checkbox>
                </Space>
              </Form.Item>

              <Form.Item label="YouTube设置">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Select placeholder="选择分类" style={{ width: '100%' }}>
                    <Select.Option value="education">教育</Select.Option>
                    <Select.Option value="entertainment">娱乐</Select.Option>
                    <Select.Option value="technology">科技</Select.Option>
                  </Select>
                  <Checkbox>添加到播放列表</Checkbox>
                </Space>
              </Form.Item>
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
    </div>
  );
};

export default OneClickPublish;