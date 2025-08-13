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
  Avatar,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  WeiboOutlined,
  WechatOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  BilibiliOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { browserAccountAPI } from '../../../services/api';

interface BrowserAccount {
  id: number;
  platform: string;
  name: string;
  username: string;
  browser_profile_id: number;
  status: string;
  last_login: string;
  created_at: string;
  updated_at: string;
}

interface BrowserProfile {
  id: number;
  name: string;
}

/**
 * 浏览器账户管理页面
 * 管理通过浏览器登录的账户
 */
const BrowserAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BrowserAccount[]>([]);
  const [browserProfiles, setBrowserProfiles] = useState<BrowserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BrowserAccount | null>(null);
  const [form] = Form.useForm();

  /**
   * 获取浏览器账户列表
   */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await browserAccountAPI.getAll();
      setAccounts(response.data || []);
    } catch (error) {
      message.error('获取浏览器账户列表失败');
      console.error('获取浏览器账户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取浏览器配置列表
   */
  const fetchBrowserProfiles = async () => {
    try {
      // TODO: 调用后端API获取浏览器配置
      setBrowserProfiles([
        { id: 1, name: '默认配置' },
        { id: 2, name: '高匿配置' },
        { id: 3, name: '移动端配置' },
      ]);
    } catch (error) {
      message.error('获取浏览器配置失败');
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBrowserProfiles();
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
      bilibili: <BilibiliOutlined style={{ color: '#00a1d6' }} />,
      douyin: <PlayCircleOutlined style={{ color: '#000000' }} />,
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
      bilibili: 'B站',
      douyin: '抖音',
    };
    return nameMap[platform] || platform;
  };

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '正常' },
      inactive: { color: 'default', text: '未激活' },
      expired: { color: 'red', text: '已过期' },
      error: { color: 'red', text: '错误' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 打开添加/编辑账户模态框
   */
  const openModal = (account?: BrowserAccount) => {
    setEditingAccount(account || null);
    setModalVisible(true);
    if (account) {
      form.setFieldsValue({
        platform: account.platform,
        name: account.name,
        username: account.username,
        browser_profile_id: account.browser_profile_id,
      });
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
      
      if (editingAccount) {
        await browserAccountAPI.update(editingAccount.id, values);
        message.success('浏览器账户更新成功');
      } else {
        await browserAccountAPI.create(values);
        message.success('浏览器账户添加成功，请在弹出的浏览器中完成登录');
      }
      
      closeModal();
      fetchAccounts();
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error(editingAccount ? '更新浏览器账户失败' : '添加浏览器账户失败');
    }
  };

  /**
   * 删除账户
   */
  const handleDelete = async (accountId: number) => {
    try {
      await browserAccountAPI.delete(accountId);
      message.success('浏览器账户删除成功');
      fetchAccounts();
    } catch (error) {
      console.error('删除浏览器账户失败:', error);
      message.error('删除浏览器账户失败');
    }
  };

  /**
   * 刷新账户状态
   */
  const handleRefreshStatus = async (accountId: number) => {
    try {
      // TODO: 调用后端API刷新状态
      message.success('状态刷新成功');
      fetchAccounts();
    } catch (error) {
      message.error('刷新状态失败');
    }
  };

  // 表格列配置
  const columns: ColumnsType<BrowserAccount> = [
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
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '最近登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑账户">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title="刷新状态">
            <Button 
              type="link" 
              icon={<ReloadOutlined />} 
              onClick={() => handleRefreshStatus(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个浏览器账户吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除账户">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>浏览器账户</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            通过浏览器登录的账户，支持手动登录和状态管理
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openModal()}
        >
          添加浏览器账户
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
          showTotal: (total) => `共 ${total} 个浏览器账户`,
        }}
      />

      <Modal
        title={editingAccount ? '编辑浏览器账户' : '添加浏览器账户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText="确定"
        cancelText="取消"
        width={600}
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
              <Select.Option value="bilibili">
                <Space>
                  <BilibiliOutlined style={{ color: '#00a1d6' }} />
                  B站
                </Space>
              </Select.Option>
              <Select.Option value="douyin">
                <Space>
                  <PlayCircleOutlined style={{ color: '#000000' }} />
                  抖音
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="账户名称"
            rules={[{ required: true, message: '请输入账户名称' }]}
          >
            <Input placeholder="请输入账户名称" />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="browser_profile_id"
            label="浏览器配置"
            rules={[{ required: true, message: '请选择浏览器配置' }]}
          >
            <Select placeholder="请选择浏览器配置">
              {browserProfiles.map(profile => (
                <Select.Option key={profile.id} value={profile.id}>
                  {profile.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrowserAccounts; 