import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, List, Tag, Spin } from 'antd';
import {
  VideoCameraOutlined,
  TranslationOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  SendOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  pendingVideos: number;
  pendingTranslations: number;
  totalAccounts: number;
  completedTasks: number;
}

interface QuickTask {
  id: string;
  title: string;
  type: 'video' | 'translation' | 'publish';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createTime: string;
}

interface SystemStatus {
  browserInstances: number;
  availableProxies: number;
  systemHealth: 'good' | 'warning' | 'error';
}

/**
 * 主页组件
 * 显示系统概览、待处理任务和快速导航
 */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingVideos: 0,
    pendingTranslations: 0,
    totalAccounts: 0,
    completedTasks: 0,
  });
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    browserInstances: 0,
    availableProxies: 0,
    systemHealth: 'good',
  });
  
  const navigate = useNavigate();

  /**
   * 获取仪表板数据
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: 调用后端API获取数据
      // 模拟数据
      setTimeout(() => {
        setStats({
          pendingVideos: 12,
          pendingTranslations: 5,
          totalAccounts: 8,
          completedTasks: 156,
        });
        
        setQuickTasks([
          {
            id: '1',
            title: '视频翻译任务 - 产品介绍.mp4',
            type: 'translation',
            status: 'processing',
            createTime: '2024-01-15 14:30',
          },
          {
            id: '2',
            title: '发布到微博 - 新年祝福视频',
            type: 'publish',
            status: 'pending',
            createTime: '2024-01-15 13:45',
          },
          {
            id: '3',
            title: '视频处理 - 教程合集.mp4',
            type: 'video',
            status: 'completed',
            createTime: '2024-01-15 12:20',
          },
        ]);
        
        setSystemStatus({
          browserInstances: 3,
          availableProxies: 15,
          systemHealth: 'good',
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * 获取任务状态标签
   */
  const getTaskStatusTag = (status: QuickTask['status']) => {
    const statusConfig = {
      pending: { color: 'orange', text: '等待中' },
      processing: { color: 'blue', text: '处理中' },
      completed: { color: 'green', text: '已完成' },
      failed: { color: 'red', text: '失败' },
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 获取系统健康状态
   */
  const getSystemHealthStatus = () => {
    const healthConfig = {
      good: { color: '#52c41a', text: '良好', icon: <CheckCircleOutlined /> },
      warning: { color: '#faad14', text: '警告', icon: <ExclamationCircleOutlined /> },
      error: { color: '#f5222d', text: '异常', icon: <ExclamationCircleOutlined /> },
    };
    
    return healthConfig[systemStatus.systemHealth];
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1>系统概览</h1>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理视频"
              value={stats.pendingVideos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待翻译任务"
              value={stats.pendingTranslations}
              prefix={<TranslationOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理账户"
              value={stats.totalAccounts}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成任务"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 快速导航 */}
        <Col span={8}>
          <Card title="快速导航" style={{ height: 400 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<VideoCameraOutlined />}
                onClick={() => navigate('/media-tools')}
                block
              >
                视频处理工具
              </Button>
              <Button 
                size="large" 
                icon={<SendOutlined />}
                onClick={() => navigate('/publish')}
                block
              >
                一键发布
              </Button>
              <Button 
                size="large" 
                icon={<UserOutlined />}
                onClick={() => navigate('/accounts')}
                block
              >
                账户管理
              </Button>
              <Button 
                size="large" 
                icon={<UnorderedListOutlined />}
                onClick={() => navigate('/tasks')}
                block
              >
                任务管理
              </Button>
            </div>
          </Card>
        </Col>

        {/* 最近任务 */}
        <Col span={8}>
          <Card 
            title="最近任务" 
            style={{ height: 400 }}
            extra={
              <Button 
                type="link" 
                icon={<RightOutlined />}
                onClick={() => navigate('/tasks')}
              >
                查看全部
              </Button>
            }
          >
            <List
              dataSource={quickTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>{task.title}</span>
                        {getTaskStatusTag(task.status)}
                      </div>
                    }
                    description={task.createTime}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col span={8}>
          <Card title="系统状态" style={{ height: 400 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ marginBottom: 8 }}>系统健康状态</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {React.cloneElement(getSystemHealthStatus().icon, { 
                    style: { color: getSystemHealthStatus().color } 
                  })}
                  <span style={{ color: getSystemHealthStatus().color, fontWeight: 'bold' }}>
                    {getSystemHealthStatus().text}
                  </span>
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: 8 }}>浏览器实例</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {systemStatus.browserInstances} 个运行中
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: 8 }}>可用代理IP</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {systemStatus.availableProxies} 个可用
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;