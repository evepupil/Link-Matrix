import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  Tooltip,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  WechatOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiAccountAPI } from '../../../services/api';

const { TextArea } = Input;
const { Text } = Typography;

interface ApiAccountWx {
  id: number;
  name: string;
  appid: string;
  app_secret: string;
  wx_id: string;
  title: string;
  author: string;
  thumb_media_id?: string;
  illust_tag?: string[][];
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * API账户管理页面
 * 管理微信公众号API账户
 */
const ApiAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<ApiAccountWx[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ApiAccountWx | null>(null);
  const [showSecret, setShowSecret] = useState<Record<number, boolean>>({});
  const [form] = Form.useForm();

  /**
   * 获取微信公众号API账户列表
   */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiAccountAPI.getAll();
      setAccounts(response.data || []);
    } catch (error) {
      message.error('获取微信公众号API账户列表失败');
      console.error('获取API账户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '正常' },
      inactive: { color: 'default', text: '未激活' },
      error: { color: 'red', text: '错误' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 切换显示/隐藏AppSecret
   */
  const toggleSecretVisibility = (accountId: number) => {
    setShowSecret(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  /**
   * 打开添加/编辑账户模态框
   */
  const openModal = (account?: ApiAccountWx) => {
    setEditingAccount(account || null);
    setModalVisible(true);
    if (account) {
      form.setFieldsValue({
        name: account.name,
        appid: account.appid,
        app_secret: account.app_secret,
        wx_id: account.wx_id,
        title: account.title,
        author: account.author,
        thumb_media_id: account.thumb_media_id,
        illust_tag: account.illust_tag ? JSON.stringify(account.illust_tag, null, 2) : '',
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
      
      // 处理illust_tag字段
      let illust_tag = undefined;
      if (values.illust_tag) {
        try {
          illust_tag = JSON.parse(values.illust_tag);
        } catch (error) {
          message.error('插图标签格式错误，请检查JSON格式');
          return;
        }
      }

      const submitData = {
        ...values,
        illust_tag,
      };
      
      if (editingAccount) {
        await apiAccountAPI.update(editingAccount.id, submitData);
        message.success('微信公众号API账户更新成功');
      } else {
        await apiAccountAPI.create(submitData);
        message.success('微信公众号API账户添加成功');
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
  const handleDelete = async (accountId: number) => {
    try {
      await apiAccountAPI.delete(accountId);
      message.success('微信公众号API账户删除成功');
      fetchAccounts();
    } catch (error) {
      console.error('删除API账户失败:', error);
      message.error('删除微信公众号API账户失败');
    }
  };

  // 表格列配置
  const columns: ColumnsType<ApiAccountWx> = [
    {
      title: '账户名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <WechatOutlined style={{ color: '#07c160' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'AppID',
      dataIndex: 'appid',
      key: 'appid',
      render: (appid: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {appid.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: 'AppSecret',
      dataIndex: 'app_secret',
      key: 'app_secret',
      render: (secret: string, record) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>
            {showSecret[record.id] ? secret : '••••••••••••••••'}
          </Text>
          <Button
            type="text"
            size="small"
            icon={showSecret[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleSecretVisibility(record.id)}
          />
        </Space>
      ),
    },
    {
      title: '微信公众号ID',
      dataIndex: 'wx_id',
      key: 'wx_id',
    },
    {
      title: '默认标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
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
          <Popconfirm
            title="确定要删除这个微信公众号API账户吗？"
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
          <h2 style={{ margin: 0 }}>微信公众号API账户</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            通过微信公众号API进行内容发布的账户
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openModal()}
        >
          添加微信公众号API账户
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
          showTotal: (total) => `共 ${total} 个微信公众号API账户`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <Card size="small" style={{ margin: '8px 0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>完整AppID:</Text>
                  <br />
                  <Text code>{record.appid}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>完整AppSecret:</Text>
                  <br />
                  <Text code>{record.app_secret}</Text>
                </Col>
              </Row>
              {record.thumb_media_id && (
                <Row style={{ marginTop: 8 }}>
                  <Col span={24}>
                    <Text strong>封面媒体ID:</Text>
                    <br />
                    <Text code style={{ fontSize: '12px' }}>{record.thumb_media_id}</Text>
                  </Col>
                </Row>
              )}
              {record.illust_tag && record.illust_tag.length > 0 && (
                <Row style={{ marginTop: 8 }}>
                  <Col span={24}>
                    <Text strong>插图标签:</Text>
                    <br />
                    {record.illust_tag.map((tagGroup, index) => (
                      <Tag key={index} color="blue" style={{ margin: '2px' }}>
                        {tagGroup.join(' + ')}
                      </Tag>
                    ))}
                  </Col>
                </Row>
              )}
            </Card>
          ),
        }}
      />

      <Modal
        title={editingAccount ? '编辑微信公众号API账户' : '添加微信公众号API账户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText="确定"
        cancelText="取消"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="账户名称"
                rules={[{ required: true, message: '请输入账户名称' }]}
              >
                <Input placeholder="请输入账户名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appid"
                label="AppID"
                rules={[{ required: true, message: '请输入AppID' }]}
              >
                <Input placeholder="请输入微信公众号AppID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="app_secret"
                label="AppSecret"
                rules={[{ required: true, message: '请输入AppSecret' }]}
              >
                <Input.Password placeholder="请输入微信公众号AppSecret" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="wx_id"
                label="微信公众号ID"
                rules={[{ required: true, message: '请输入微信公众号ID' }]}
              >
                <Input placeholder="请输入微信公众号ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="默认标题"
                rules={[{ required: true, message: '请输入默认标题' }]}
              >
                <Input placeholder="请输入默认标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="author"
                label="作者"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input placeholder="请输入作者" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="thumb_media_id"
            label="默认封面媒体ID"
          >
            <Input placeholder="请输入默认封面媒体ID（可选）" />
          </Form.Item>

          <Form.Item
            name="illust_tag"
            label="插图标签"
            extra="JSON格式，例如：[['黑裤袜', '黑丝'], ['碧蓝档案']]"
          >
            <TextArea 
              placeholder="请输入插图标签，JSON格式"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiAccounts; 