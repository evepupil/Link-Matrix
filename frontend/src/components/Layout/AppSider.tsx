import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  DatabaseOutlined,
  ToolOutlined,
  SendOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface AppSiderProps {
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * 侧边栏导航组件
 * 提供主要功能模块的导航菜单
 */
const AppSider: React.FC<AppSiderProps> = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '主页',
    },
    {
      key: '/accounts',
      icon: <UserOutlined />,
      label: '账户管理',
    },
    {
      key: '/resources',
      icon: <DatabaseOutlined />,
      label: '资源管理',
    },
    {
      key: '/media-tools',
      icon: <ToolOutlined />,
      label: '自媒体工具',
    },
    {
      key: '/publish',
      icon: <SendOutlined />,
      label: '一键发布',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      key: '/docs',
      icon: <FileTextOutlined />,
      label: '使用文档',
    },
  ];

  /**
   * 处理菜单点击事件
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  /**
   * 获取当前选中的菜单项
   */
  const getSelectedKeys = () => {
    const path = location.pathname;
    return path === '/' ? ['/dashboard'] : [path];
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => {
        setCollapsed(value);
        if (onCollapse) {
          onCollapse(value);
        }
      }}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
      }}
      width={200}
    >
      <div className="logo">
        {collapsed ? 'LM' : 'LinkMatrix'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AppSider;