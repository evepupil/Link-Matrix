import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Row, 
  Col, 
  Switch,
  InputNumber,
  Divider,
  Typography,
  Space,
  Alert
} from 'antd';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SystemConfig {
  ffmpegPath: string;
  aiApiKey: string;
  logLevel: string;
  storagePath: string;
  proxyStrategy: string;
  autoUpdate: boolean;
  maxConcurrentTasks: number;
  taskTimeout: number;
}

/**
 * 系统设置页面组件
 * 管理系统配置参数
 */
const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    ffmpegPath: '',
    aiApiKey: '',
    logLevel: 'info',
    storagePath: '',
    proxyStrategy: 'round_robin',
    autoUpdate: true,
    maxConcurrentTasks: 5,
    taskTimeout: 300,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /**
   * 获取系统配置
   */
  const fetchConfig = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API
      setTimeout(() => {
        const mockConfig = {
          ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
          aiApiKey: 'sk-****************************',
          logLevel: 'info',
          storagePath: 'D:\\LinkMatrix\\storage',
          proxyStrategy: 'round_robin',
          autoUpdate: true,
          maxConcurrentTasks: 5,
          taskTimeout: 300,
        };
        setConfig(mockConfig);
        form.setFieldsValue(mockConfig);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('获取系统配置失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  /**
   * 保存配置
   */
  const saveConfig = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      // TODO: 调用后端API保存配置
      setTimeout(() => {
        setConfig(values);
        message.success('配置保存成功');
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
      setSaving(false);
    }
  };

  /**
   * 重置配置
   */
  const resetConfig = () => {
    form.setFieldsValue(config);
    message.info('配置已重置');
  };

  /**
   * 测试FFmpeg路径
   */
  const testFFmpegPath = async () => {
    try {
      const ffmpegPath = form.getFieldValue('ffmpegPath');
      if (!ffmpegPath) {
        message.error('请先输入FFmpeg路径');
        return;
      }
      
      // TODO: 调用后端API测试FFmpeg
      message.success('FFmpeg路径测试成功');
    } catch (error) {
      message.error('FFmpeg路径测试失败');
    }
  };

  /**
   * 测试AI API
   */
  const testAIAPI = async () => {
    try {
      const apiKey = form.getFieldValue('aiApiKey');
      if (!apiKey) {
        message.error('请先输入AI API Key');
        return;
      }
      
      // TODO: 调用后端API测试AI API
      message.success('AI API连接测试成功');
    } catch (error) {
      message.error('AI API连接测试失败');
    }
  };

  /**
   * 检查更新
   */
  const checkUpdate = async () => {
    try {
      // TODO: 调用后端API检查更新
      message.info('正在检查更新...');
      setTimeout(() => {
        message.success('当前已是最新版本');
      }, 2000);
    } catch (error) {
      message.error('检查更新失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>系统设置</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={resetConfig}>
            重置
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={saveConfig}
            loading={saving}
          >
            保存配置
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
          >
            {/* 基础配置 */}
            <Card title="基础配置" style={{ marginBottom: 24 }}>
              <Form.Item
                name="ffmpegPath"
                label="FFmpeg路径"
                rules={[{ required: true, message: '请输入FFmpeg可执行文件路径' }]}
                extra="用于视频处理的FFmpeg可执行文件路径"
              >
                <Input 
                  placeholder="例如: C:\ffmpeg\bin\ffmpeg.exe"
                  addonAfter={
                    <Button type="link" onClick={testFFmpegPath}>
                      测试
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item
                name="storagePath"
                label="本地存储路径"
                rules={[{ required: true, message: '请输入本地存储路径' }]}
                extra="用于存储临时文件和处理结果的本地目录"
              >
                <Input placeholder="例如: D:\LinkMatrix\storage" />
              </Form.Item>

              <Form.Item
                name="logLevel"
                label="日志级别"
                extra="设置系统日志的详细程度"
              >
                <Select>
                  <Select.Option value="debug">Debug (调试)</Select.Option>
                  <Select.Option value="info">Info (信息)</Select.Option>
                  <Select.Option value="warning">Warning (警告)</Select.Option>
                  <Select.Option value="error">Error (错误)</Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {/* AI配置 */}
            <Card title="AI配置" style={{ marginBottom: 24 }}>
              <Form.Item
                name="aiApiKey"
                label="AI API Key"
                rules={[{ required: true, message: '请输入AI API Key' }]}
                extra="用于AI翻译和标题生成的API密钥"
              >
                <Input.Password 
                  placeholder="请输入AI API Key"
                  addonAfter={
                    <Button type="link" onClick={testAIAPI}>
                      测试
                    </Button>
                  }
                />
              </Form.Item>
            </Card>

            {/* 代理配置 */}
            <Card title="代理配置" style={{ marginBottom: 24 }}>
              <Form.Item
                name="proxyStrategy"
                label="代理IP轮询策略"
                extra="设置如何使用多个代理IP"
              >
                <Select>
                  <Select.Option value="round_robin">轮询 (Round Robin)</Select.Option>
                  <Select.Option value="random">随机 (Random)</Select.Option>
                  <Select.Option value="least_used">最少使用 (Least Used)</Select.Option>
                  <Select.Option value="fixed">固定 (Fixed)</Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {/* 任务配置 */}
            <Card title="任务配置" style={{ marginBottom: 24 }}>
              <Form.Item
                name="maxConcurrentTasks"
                label="最大并发任务数"
                extra="同时执行的最大任务数量"
              >
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="taskTimeout"
                label="任务超时时间 (秒)"
                extra="单个任务的最大执行时间"
              >
                <InputNumber min={60} max={3600} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            {/* 更新配置 */}
            <Card title="更新配置">
              <Form.Item
                name="autoUpdate"
                label="自动更新"
                valuePropName="checked"
                extra="是否自动检查和下载软件更新"
              >
                <Switch />
              </Form.Item>

              <Button icon={<CheckCircleOutlined />} onClick={checkUpdate}>
                检查更新
              </Button>
            </Card>
          </Form>
        </Col>

        <Col span={8}>
          <Card title="配置说明" style={{ marginBottom: 24 }}>
            <div style={{ lineHeight: '1.8' }}>
              <Title level={5}>FFmpeg配置</Title>
              <Text type="secondary">
                FFmpeg是视频处理的核心工具，请确保已正确安装并配置路径。
                可从官网下载：https://ffmpeg.org/
              </Text>

              <Divider />

              <Title level={5}>AI API配置</Title>
              <Text type="secondary">
                支持OpenAI、百度、阿里云等AI服务提供商的API。
                请确保API Key有足够的配额。
              </Text>

              <Divider />

              <Title level={5}>代理配置</Title>
              <Text type="secondary">
                合理配置代理策略可以提高任务成功率，
                避免因IP限制导致的发布失败。
              </Text>
            </div>
          </Card>

          <Card title="系统状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>FFmpeg状态：</Text>
                <Text type="success">正常</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>AI API状态：</Text>
                <Text type="success">正常</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>存储空间：</Text>
                <Text>85.2 GB 可用</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>当前版本：</Text>
                <Text>v1.0.0</Text>
              </div>
            </Space>
          </Card>

          <Alert
            message="配置提醒"
            description="修改配置后请点击保存按钮，部分配置需要重启应用后生效。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SystemSettings;