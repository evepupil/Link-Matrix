import React, { useState } from 'react';
import { Card, Button, Progress, Space, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PicItem {
  pid: number;
  url?: string;
  image_path?: string;
  isUnfit: boolean;
  localPath?: string;
  downloadStatus?: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress?: number;
}

interface Step4Props {
  selectedPics: PicItem[];
  onComplete: () => void;
  onBack: () => void;
}

const Step4Publish: React.FC<Step4Props> = ({ 
  selectedPics, 
  onComplete, 
  onBack 
}) => {
  const [loading, setLoading] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  const handlePublish = async () => {
    try {
      setLoading(true);
      setPublishProgress(10);
      
      // 模拟发布过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishProgress(50);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishProgress(100);
      
      message.success('发布成功！');
      setTimeout(() => onComplete(), 1000);
    } catch (error) {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Text strong>发布到公众号</Text>
      
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Text>准备发布 {selectedPics.length} 张图片到微信公众号</Text>
        
        {publishProgress > 0 && (
          <Progress percent={publishProgress} status="active" />
        )}
        
        <Space>
          <Button onClick={onBack}>上一步</Button>
          <Button 
            type="primary" 
            onClick={handlePublish} 
            loading={loading}
            disabled={publishProgress > 0}
            icon={<UploadOutlined />}
          >
            开始发布
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default Step4Publish; 