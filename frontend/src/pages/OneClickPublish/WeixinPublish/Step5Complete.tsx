import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Step5Props {
  onBack: () => void;
}

const Step5Complete: React.FC<Step5Props> = ({ onBack }) => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <Title level={3} style={{ marginTop: 16 }}>
          发布成功！
        </Title>
        <Text>
          已成功发布图片到微信公众号，请在公众号后台草稿箱查看
        </Text>
        
        <div style={{ marginTop: '24px' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              重新开始
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default Step5Complete; 