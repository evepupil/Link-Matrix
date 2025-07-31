import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Layout/AppHeader';
import AppSider from './components/Layout/AppSider';
import Dashboard from './pages/Dashboard';
import AccountManagement from './pages/AccountManagement';
import ResourceManagement from './pages/ResourceManagement';
import MediaTools from './pages/MediaTools';
import OneClickPublish from './pages/OneClickPublish';
import TaskManagement from './pages/TaskManagement';
import SystemSettings from './pages/SystemSettings';
import Documentation from './pages/Documentation';

const { Content } = Layout;

/**
 * 主应用组件
 * 包含整体布局和路由配置
 */
const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  const handleSiderCollapse = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppSider onCollapse={handleSiderCollapse} />
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
          <AppHeader />
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<AccountManagement />} />
              <Route path="/resources" element={<ResourceManagement />} />
              <Route path="/media-tools" element={<MediaTools />} />
              <Route path="/publish" element={<OneClickPublish />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;