import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Table, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  List,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { Text } = Typography;

interface BrowserConfig {
  id: string;
  name: string;
  userAgent?: string;
  screenResolution: string;
  associatedAccounts: number;
  createTime: string;
}

interface ProxyIP {
  id: string;
  address: string;
  port: number;
  username?: string;
  password?: string;
  status: 'available' | 'unavailable';
  lastTestTime: string;
}

/**
 * 资源管理页面组件
 * 管理浏览器配置和代理IP
 */
const ResourceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browser');
  const [browserConfigs, setBrowserConfigs] = useState<BrowserConfig[]>([]);
  const [proxyIPs, setProxyIPs] = useState<ProxyIP[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'browser' | 'proxy'>('browser');
  const [editingItem, setEditingItem] = useState<BrowserConfig | ProxyIP | null>(null);
  const [form] = Form.useForm();

  /**
   * 获取浏览器配置列表
   */
  const fetchBrowserConfigs = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API
      setTimeout(() => {
        setBrowserConfigs([
          {
            id: '1',
            name: '默认配置',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            screenResolution: '1920x1080',
            associatedAccounts: 3,
            createTime: '2024-01-10 10:00:00',
          },
          {
            id: '2',
            name: '高匿配置',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            screenResolution: '1440x900',
            associatedAccounts: 2,
            createTime: '2024-01-12 14:30:00',
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error('获取浏览器配置失败');
      setLoading(false);
    }
  };

  /**
   * 获取代理IP列表
   */
  const fetchProxyIPs = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API
      setTimeout(() => {
        setProxyIPs([
          {
            id: '1',
            address: '192.168.1.100',
            port: 8080,
            username: 'user1',
            password: '****',
            status: 'available',
            lastTestTime: '2024-01-15 14:30:00',
          },
          {
            id: '2',
            address: '10.0.0.50',
            port: 3128,
            status: 'unavailable',
            lastTestTime: '2024-01-15 12:15:00',
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      message.error('获取代理IP列表失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrowserConfigs();
    fetchProxyIPs();
  }, []);

  /**
   * 打开添加/编辑模态框
   */
  const openModal = (type: 'browser' | 'proxy', item?: BrowserConfig | ProxyIP) => {
    setModalType(type);
    setEditingItem(item || null);
    setModalVisible(true);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: 调用后端API
      if (editingItem) {
        message.success(`${modalType === 'browser' ? '浏览器配置' : '代理IP'}更新成功`);
      } else {
        message.success(`${modalType === 'browser' ? '浏览器配置' : '代理IP'}添加成功`);
      }
      
      closeModal();
      if (modalType === 'browser') {
        fetchBrowserConfigs();
      } else {
        fetchProxyIPs();
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 删除项目
   */
  const handleDelete = async (type: 'browser' | 'proxy', id: string) => {
    try {
      // TODO: 调用后端API删除
      message.success(`${type === 'browser' ? '浏览器配置' : '代理IP'}删除成功`);
      if (type === 'browser') {
        fetchBrowserConfigs();
      } else {
        fetchProxyIPs();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  /**
   * 测试代理连接
   */
  const testProxyConnection = async (proxyId: string) => {
    try {
      // TODO: 调用后端API测试代理
      message.success('代理连接测试成功');
      fetchProxyIPs();
    } catch (error) {
      message.error('代理连接测试失败');
    }
  };

  // 代理IP表格列配置
  const proxyColumns: ColumnsType<ProxyIP> = [
    {
      title: '代理地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => username ? `${username.substring(0, 3)}***` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProxyIP['status']) => (
        <Tag 
          color={status === 'available' ? 'green' : 'red'}
          icon={status === 'available' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {status === 'available' ? '可用' : '不可用'}
        </Tag>
      ),
    },
    {
      title: '最后测试时间',
      dataIndex: 'lastTestTime',
      key: 'lastTestTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<GlobalOutlined />} 
            onClick={() => testProxyConnection(record.id)}
          >
            测试连接
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => openModal('proxy', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个代理IP吗？"
            onConfirm={() => handleDelete('proxy', record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>资源管理</h1>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="浏览器配置" key="browser">
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal('browser')}
            >
              创建新配置
            </Button>
          </div>
          
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={browserConfigs}
            loading={loading}
            renderItem={(config) => (
              <List.Item>
                <Card
                  title={config.name}
                  extra={
                    <Space>
                      <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => openModal('browser', config)}
                      />
                      <Popconfirm
                        title="确定要删除这个配置吗？"
                        onConfirm={() => handleDelete('browser', config.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  }
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">User-Agent:</Text>
                    <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                      {config.userAgent || '默认'}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">屏幕分辨率:</Text> {config.screenResolution}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">关联账户:</Text> {config.associatedAccounts} 个
                  </div>
                  <div>
                    <Text type="secondary">创建时间:</Text> {config.createTime}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="代理IP" key="proxy">
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal('proxy')}
            >
              添加代理IP
            </Button>
          </div>
          
          <Table
            columns={proxyColumns}
            dataSource={proxyIPs}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个代理IP`,
            }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={
          modalType === 'browser' 
            ? (editingItem ? '编辑浏览器配置' : '创建浏览器配置')
            : (editingItem ? '编辑代理IP' : '添加代理IP')
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {modalType === 'browser' ? (
            <>
              <Form.Item
                name="name"
                label="配置名称"
                rules={[{ required: true, message: '请输入配置名称' }]}
              >
                <Input placeholder="请输入配置名称" />
              </Form.Item>

              <Form.Item
                name="userAgent"
                label="User-Agent"
              >
                <Input.TextArea 
                  placeholder="可选，留空使用默认值" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="screenResolution"
                label="屏幕分辨率"
                rules={[{ required: true, message: '请选择屏幕分辨率' }]}
              >
                <Select placeholder="请选择屏幕分辨率">
                  <Select.Option value="1920x1080">1920x1080</Select.Option>
                  <Select.Option value="1440x900">1440x900</Select.Option>
                  <Select.Option value="1366x768">1366x768</Select.Option>
                  <Select.Option value="1280x720">1280x720</Select.Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="address"
                label="代理地址"
                rules={[{ required: true, message: '请输入代理地址' }]}
              >
                <Input placeholder="请输入代理地址" />
              </Form.Item>

              <Form.Item
                name="port"
                label="端口"
                rules={[{ required: true, message: '请输入端口号' }]}
              >
                <Input type="number" placeholder="请输入端口号" />
              </Form.Item>

              <Form.Item
                name="username"
                label="用户名"
              >
                <Input placeholder="可选" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
              >
                <Input.Password placeholder="可选" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceManagement;