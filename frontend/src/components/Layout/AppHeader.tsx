import React from 'react';
import { Layout, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header } = Layout;

/**
 * 应用顶部导航栏组件
 * 显示应用名称和用户操作菜单
 */
const AppHeader: React.FC = () => {
  // 用户菜单项配置
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: '个人设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
    },
  ];

  /**
   * 处理用户菜单点击事件
   */
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'settings':
        // TODO: 跳转到个人设置页面
        console.log('跳转到个人设置');
        break;
      case 'logout':
        // TODO: 处理退出登录逻辑
        console.log('退出登录');
        break;
    }
  };

  return (
    <Header style={{ 
      padding: '0 24px', 
      background: '#fff', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
        LinkMatrix 自媒体矩阵运营工具
      </div>
      
      <Dropdown 
        menu={{ items: userMenuItems, onClick: handleUserMenuClick }} 
        placement="bottomRight"
      >
        <Space style={{ cursor: 'pointer' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>管理员</span>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;