import React from 'react';
import { Card, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Step5Props {
  fitCount: number;
}

const Step5Complete: React.FC<Step5Props> = ({ fitCount }) => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <Title level={3} style={{ marginTop: 16 }}>
          发布成功！
        </Title>
        <Text>
          已成功发布 {fitCount} 张图片到微信公众号
        </Text>
      </div>
    </Card>
  );
};

export default Step5Complete; 