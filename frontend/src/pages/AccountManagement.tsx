import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  WeiboOutlined,
  WechatOutlined,
  YoutubeOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Account {
  id: string;
  platform: string;
  accountName: string;
  browserConfig: string;
  loginStatus: 'online' | 'offline' | 'expired';
  lastLoginTime: string;
  createTime: string;
}

interface BrowserConfig {
  id: string;
  name: string;
}

/**
 * 账户管理页面组件
 * 管理多平台自媒体账户
 */
const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [browserConfigs, setBrowserConfigs] = useState<BrowserConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();

  /**
   * 获取账户列表
   */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API
      // 模拟数据
      setTimeout(() => {
        setAccounts([
          {
            id: '1',
            platform: 'weibo',
            accountName: '我的微博账号',
            browserConfig: '默认配置',
            loginStatus: 'online',
            lastLoginTime: '2024-01-15 14:30:00',
            createTime: '2024-01-10 10:00:00',
          },
          {
            id: '2',
            platform: 'wechat',
            accountName: '企业微信号',
            browserConfig: '高匿配置',
            loginStatus: 'offline',
            lastLoginTime: '2024-01-14 16:20:00',
            createTime: '2024-01-12 09:15:00',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('获取账户列表失败');
      setLoading(false);
    }
  };

  /**
   * 获取浏览器配置列表
   */
  const fetchBrowserConfigs = async () => {
    try {
      // TODO: 调用后端API
      setBrowserConfigs([
        { id: '1', name: '默认配置' },
        { id: '2', name: '高匿配置' },
        { id: '3', name: '移动端配置' },
      ]);
    } catch (error) {
      message.error('获取浏览器配置失败');
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBrowserConfigs();
  }, []);

  /**
   * 获取平台图标
   */
  const getPlatformIcon = (platform: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      weibo: <WeiboOutlined style={{ color: '#e6162d' }} />,
      wechat: <WechatOutlined style={{ color: '#07c160' }} />,
      youtube: <YoutubeOutlined style={{ color: '#ff0000' }} />,
      twitter: <TwitterOutlined style={{ color: '#1da1f2' }} />,
    };
    return iconMap[platform] || <Avatar size="small">{platform.charAt(0).toUpperCase()}</Avatar>;
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
   * 获取登录状态标签
   */
  const getLoginStatusTag = (status: Account['loginStatus']) => {
    const statusConfig = {
      online: { color: 'green', text: '在线' },
      offline: { color: 'default', text: '离线' },
      expired: { color: 'red', text: '已过期' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 打开添加/编辑账户模态框
   */
  const openModal = (account?: Account) => {
    setEditingAccount(account || null);
    setModalVisible(true);
    if (account) {
      form.setFieldsValue(account);
    } else {
      form.resetFields();
    }
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingAccount(null);
    form.resetFields();
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: 调用后端API
      if (editingAccount) {
        message.success('账户更新成功');
      } else {
        message.success('账户添加成功，请在弹出的浏览器中完成登录');
        // TODO: 触发有头浏览器登录流程
      }
      
      closeModal();
      fetchAccounts();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 删除账户
   */
  const handleDelete = async (accountId: string) => {
    try {
      // TODO: 调用后端API删除账户
      message.success('账户删除成功');
      fetchAccounts();
    } catch (error) {
      message.error('删除账户失败');
    }
  };

  /**
   * 刷新账户状态
   */
  const handleRefreshStatus = async (accountId: string) => {
    try {
      // TODO: 调用后端API刷新状态
      message.success('状态刷新成功');
      fetchAccounts();
    } catch (error) {
      message.error('刷新状态失败');
    }
  };

  // 表格列配置
  const columns: ColumnsType<Account> = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => (
        <Space>
          {getPlatformIcon(platform)}
          {getPlatformName(platform)}
        </Space>
      ),
    },
    {
      title: '账户名称',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: '浏览器配置',
      dataIndex: 'browserConfig',
      key: 'browserConfig',
    },
    {
      title: '登录状态',
      dataIndex: 'loginStatus',
      key: 'loginStatus',
      render: (status: Account['loginStatus']) => getLoginStatusTag(status),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<ReloadOutlined />} 
            onClick={() => handleRefreshStatus(record.id)}
          >
            刷新状态
          </Button>
          <Popconfirm
            title="确定要删除这个账户吗？"
            onConfirm={() => handleDelete(record.id)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>账户管理</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openModal()}
        >
          添加账户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个账户`,
        }}
      />

      <Modal
        title={editingAccount ? '编辑账户' : '添加账户'}
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
          <Form.Item
            name="platform"
            label="平台类型"
            rules={[{ required: true, message: '请选择平台类型' }]}
          >
            <Select placeholder="请选择平台类型">
              <Select.Option value="weibo">
                <Space>
                  <WeiboOutlined style={{ color: '#e6162d' }} />
                  微博
                </Space>
              </Select.Option>
              <Select.Option value="wechat">
                <Space>
                  <WechatOutlined style={{ color: '#07c160' }} />
                  微信
                </Space>
              </Select.Option>
              <Select.Option value="youtube">
                <Space>
                  <YoutubeOutlined style={{ color: '#ff0000' }} />
                  YouTube
                </Space>
              </Select.Option>
              <Select.Option value="twitter">
                <Space>
                  <TwitterOutlined style={{ color: '#1da1f2' }} />
                  Twitter
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="accountName"
            label="账户名称"
            rules={[{ required: true, message: '请输入账户名称' }]}
          >
            <Input placeholder="请输入账户名称" />
          </Form.Item>

          <Form.Item
            name="browserConfig"
            label="浏览器配置"
            rules={[{ required: true, message: '请选择浏览器配置' }]}
          >
            <Select placeholder="请选择浏览器配置">
              {browserConfigs.map(config => (
                <Select.Option key={config.id} value={config.name}>
                  {config.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManagement;