import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Progress, 
  Modal, 
  Typography, 
  Card, 
  Row, 
  Col,
  message,
  Popconfirm,
  Select,
  Input
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { TextArea } = Input;

interface Task {
  id: string;
  type: 'publish' | 'translation' | 'video_processing';
  title: string;
  platform?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'waiting_verification';
  progress: number;
  createTime: string;
  updateTime: string;
  logs: string[];
  errorMessage?: string;
}

/**
 * 任务管理页面组件
 * 管理所有发布任务和处理任务
 */
const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  /**
   * 获取任务列表
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API
      setTimeout(() => {
        setTasks([
          {
            id: '1',
            type: 'publish',
            title: '发布到微博 - 新年祝福视频',
            platform: 'weibo',
            status: 'running',
            progress: 65,
            createTime: '2024-01-15 14:30:00',
            updateTime: '2024-01-15 14:35:00',
            logs: [
              '任务开始执行',
              '正在上传视频文件...',
              '视频上传完成',
              '正在填写发布信息...',
            ],
          },
          {
            id: '2',
            type: 'translation',
            title: '视频翻译 - 产品介绍.mp4',
            status: 'completed',
            progress: 100,
            createTime: '2024-01-15 13:20:00',
            updateTime: '2024-01-15 14:10:00',
            logs: [
              '开始语音识别',
              '语音识别完成',
              '开始翻译',
              '翻译完成',
              '生成字幕文件',
              '任务完成',
            ],
          },
          {
            id: '3',
            type: 'publish',
            title: '发布到YouTube - 教程视频',
            platform: 'youtube',
            status: 'waiting_verification',
            progress: 80,
            createTime: '2024-01-15 12:45:00',
            updateTime: '2024-01-15 13:30:00',
            logs: [
              '任务开始执行',
              '正在上传视频...',
              '视频上传完成',
              '等待人工验证...',
            ],
          },
          {
            id: '4',
            type: 'publish',
            title: '发布到Twitter - 日常分享',
            platform: 'twitter',
            status: 'failed',
            progress: 30,
            createTime: '2024-01-15 11:20:00',
            updateTime: '2024-01-15 11:25:00',
            logs: [
              '任务开始执行',
              '正在登录账户...',
              '登录失败',
            ],
            errorMessage: '账户登录失败，请检查账户状态',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('获取任务列表失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // 设置定时刷新
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 获取任务状态标签
   */
  const getStatusTag = (status: Task['status']) => {
    const statusConfig = {
      queued: { color: 'default', text: '排队中' },
      running: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' },
      failed: { color: 'red', text: '失败' },
      paused: { color: 'orange', text: '已暂停' },
      waiting_verification: { color: 'gold', text: '等待人工验证' },
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 获取任务类型标签
   */
  const getTypeTag = (type: Task['type']) => {
    const typeConfig = {
      publish: { color: 'blue', text: '发布任务' },
      translation: { color: 'green', text: '翻译任务' },
      video_processing: { color: 'purple', text: '视频处理' },
    };
    
    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 暂停任务
   */
  const pauseTask = async (taskId: string) => {
    try {
      // TODO: 调用后端API
      message.success('任务已暂停');
      fetchTasks();
    } catch (error) {
      message.error('暂停任务失败');
    }
  };

  /**
   * 恢复任务
   */
  const resumeTask = async (taskId: string) => {
    try {
      // TODO: 调用后端API
      message.success('任务已恢复');
      fetchTasks();
    } catch (error) {
      message.error('恢复任务失败');
    }
  };

  /**
   * 取消任务
   */
  const cancelTask = async (taskId: string) => {
    try {
      // TODO: 调用后端API
      message.success('任务已取消');
      fetchTasks();
    } catch (error) {
      message.error('取消任务失败');
    }
  };

  /**
   * 重试任务
   */
  const retryTask = async (taskId: string) => {
    try {
      // TODO: 调用后端API
      message.success('任务已重新开始');
      fetchTasks();
    } catch (error) {
      message.error('重试任务失败');
    }
  };

  /**
   * 人工验证
   */
  const handleManualVerification = async (taskId: string) => {
    try {
      // TODO: 调用后端API触发有头浏览器
      message.success('已触发人工验证，请在弹出的浏览器中完成验证');
      fetchTasks();
    } catch (error) {
      message.error('触发人工验证失败');
    }
  };

  /**
   * 查看日志
   */
  const viewLogs = (task: Task) => {
    setSelectedTask(task);
    setLogModalVisible(true);
  };

  /**
   * 过滤任务
   */
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const typeMatch = filterType === 'all' || task.type === filterType;
      return statusMatch && typeMatch;
    });
  };

  // 表格列配置
  const columns: ColumnsType<Task> = [
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: Task['type']) => getTypeTag(type),
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => platform || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Task['status']) => getStatusTag(status),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record) => (
        <div style={{ width: 100 }}>
          <Progress 
            percent={progress} 
            size="small" 
            status={record.status === 'failed' ? 'exception' : 'normal'}
          />
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => viewLogs(record)}
          >
            日志
          </Button>
          
          {record.status === 'running' && (
            <Button 
              type="link" 
              icon={<PauseCircleOutlined />} 
              onClick={() => pauseTask(record.id)}
            >
              暂停
            </Button>
          )}
          
          {record.status === 'paused' && (
            <Button 
              type="link" 
              icon={<PlayCircleOutlined />} 
              onClick={() => resumeTask(record.id)}
            >
              恢复
            </Button>
          )}
          
          {record.status === 'failed' && (
            <Button 
              type="link" 
              icon={<ReloadOutlined />} 
              onClick={() => retryTask(record.id)}
            >
              重试
            </Button>
          )}
          
          {record.status === 'waiting_verification' && (
            <Button 
              type="link" 
              icon={<ExclamationCircleOutlined />} 
              onClick={() => handleManualVerification(record.id)}
            >
              人工验证
            </Button>
          )}
          
          {['queued', 'running', 'paused'].indexOf(record.status) !== -1 && (
            <Popconfirm
              title="确定要取消这个任务吗？"
              onConfirm={() => cancelTask(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>任务管理</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {tasks.filter(t => t.status === 'running').length}
              </div>
              <div>进行中</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <div>已完成</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {tasks.filter(t => t.status === 'failed').length}
              </div>
              <div>失败</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {tasks.filter(t => t.status === 'waiting_verification').length}
              </div>
              <div>等待验证</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 过滤器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>状态筛选：</span>
          <Select 
            value={filterStatus} 
            onChange={setFilterStatus} 
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="queued">排队中</Select.Option>
            <Select.Option value="running">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="failed">失败</Select.Option>
            <Select.Option value="paused">已暂停</Select.Option>
            <Select.Option value="waiting_verification">等待验证</Select.Option>
          </Select>
          
          <span>类型筛选：</span>
          <Select 
            value={filterType} 
            onChange={setFilterType} 
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="publish">发布任务</Select.Option>
            <Select.Option value="translation">翻译任务</Select.Option>
            <Select.Option value="video_processing">视频处理</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* 任务列表 */}
      <Table
        columns={columns}
        dataSource={getFilteredTasks()}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个任务`,
        }}
      />

      {/* 日志查看模态框 */}
      <Modal
        title={`任务日志 - ${selectedTask?.title}`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLogModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedTask && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>任务状态：</Text>
                {getStatusTag(selectedTask.status)}
                <Text strong>进度：</Text>
                <Progress percent={selectedTask.progress} size="small" style={{ width: 100 }} />
              </Space>
            </div>
            
            {selectedTask.errorMessage && (
              <div style={{ marginBottom: 16, padding: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
                <Text type="danger">错误信息：{selectedTask.errorMessage}</Text>
              </div>
            )}
            
            <div>
              <Text strong>执行日志：</Text>
              <TextArea
                value={selectedTask.logs.map((log, index) => 
                  `[${new Date().toLocaleTimeString()}] ${log}`
                ).join('\n')}
                rows={10}
                readOnly
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskManagement;