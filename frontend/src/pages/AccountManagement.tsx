import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { DesktopOutlined, ApiOutlined } from '@ant-design/icons';
import BrowserAccounts from './AccountManagement/BrowserAccounts';
import ApiAccounts from './AccountManagement/ApiAccounts';

const { TabPane } = Tabs;

/**
 * 账号管理主页面
 * 包含浏览器账户和API账户两个子页面
 */
const AccountManagement: React.FC = () => {
  const [activeKey, setActiveKey] = useState('browser');

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          账号管理
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          管理浏览器账户和API账户，支持不同平台的自媒体账号
        </p>
      </div>

      <Card>
        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <DesktopOutlined />
                浏览器账户
              </span>
            } 
            key="browser"
          >
            <BrowserAccounts />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ApiOutlined />
                API账户
              </span>
            } 
            key="api"
          >
            <ApiAccounts />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AccountManagement; 