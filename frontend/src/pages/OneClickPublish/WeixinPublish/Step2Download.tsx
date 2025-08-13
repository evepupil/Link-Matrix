import React from 'react';
import { Card, Button, Progress, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Step2Props {
  picCount: number;
  downloadProgress: number;
  loading: boolean;
  onDownload: () => void;
  onNext: () => void;
}

const Step2Download: React.FC<Step2Props> = ({ 
  picCount, 
  downloadProgress, 
  loading, 
  onDownload, 
  onNext 
}) => {
  return (
    <Card>
      <Text strong>图片下载</Text>
      
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Text>已查询到 {picCount} 张符合条件的图片</Text>
        
        {downloadProgress > 0 && (
          <Progress percent={downloadProgress} status="active" />
        )}
        
        <Space>
          <Button 
            type="primary" 
            onClick={onDownload} 
            loading={loading}
            disabled={downloadProgress > 0}
            icon={<DownloadOutlined />}
          >
            开始下载
          </Button>
          
          {downloadProgress >= 100 && (
            <Button type="primary" onClick={onNext}>
              下一步
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default Step2Download; 