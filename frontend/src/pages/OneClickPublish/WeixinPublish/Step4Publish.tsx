import React from 'react';
import { Card, Button, Progress, Space, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Step4Props {
  fitCount: number;
  publishProgress: number;
  loading: boolean;
  onPublish: () => void;
}

const Step4Publish: React.FC<Step4Props> = ({ 
  fitCount, 
  publishProgress, 
  loading, 
  onPublish 
}) => {
  return (
    <Card>
      <Text strong>发布到公众号</Text>
      
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Text>准备发布 {fitCount} 张图片到微信公众号</Text>
        
        {publishProgress > 0 && (
          <Progress percent={publishProgress} status="active" />
        )}
        
        <Button 
          type="primary" 
          onClick={onPublish} 
          loading={loading}
          disabled={publishProgress > 0}
          icon={<UploadOutlined />}
        >
          开始发布
        </Button>
      </Space>
    </Card>
  );
};

export default Step4Publish; 