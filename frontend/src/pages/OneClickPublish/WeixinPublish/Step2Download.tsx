import React, { useEffect, useState } from 'react';
import { Card, Progress, Space, Typography, Alert } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Step2Props {
  picList: any[];
  onNext: () => void;
}

const Step2Download: React.FC<Step2Props> = ({ picList, onNext }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [status, setStatus] = useState<'downloading' | 'completed' | 'error'>('downloading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (picList.length > 0) {
      startDownloadProgress();
    }
  }, [picList]);

  const startDownloadProgress = async () => {
    const pids = picList.map(pic => pic.pid);
    const startTime = Date.now();
    const timeout = 60000; // 1分钟超时

    const checkProgress = async () => {
      try {
        // 检查下载状态
        const response = await fetch('http://localhost:8000/api/v1/weixin/check-download-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pids }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const downloaded = result.data.filter((item: any) => item.downloaded);
          const progress = Math.round((downloaded.length / pids.length) * 100);
          
          setDownloadedCount(downloaded.length);
          setDownloadProgress(progress);

          // 检查是否超时
          if (Date.now() - startTime > timeout) {
            setStatus('error');
            setErrorMessage('下载超时，请检查网络连接或稍后重试');
            return;
          }

          // 如果还有未下载的图片，继续检查
          if (downloaded.length < pids.length) {
            setTimeout(checkProgress, 1000); // 每秒检查一次
          } else {
            setStatus('completed');
            setDownloadProgress(100);
            // 3秒后自动进入下一步
            setTimeout(() => {
              onNext();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('检查下载进度失败:', error);
        setStatus('error');
        setErrorMessage('检查下载进度失败，请稍后重试');
      }
    };

    // 开始检查进度
    checkProgress();
  };

  return (
    <Card>
      <Text strong>图片下载</Text>
      
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Text>已查询到 {picList.length} 张符合条件的图片</Text>
        
        {status === 'downloading' && (
          <>
            <Progress 
              percent={downloadProgress} 
              status="active" 
              format={(percent) => `${percent}% (${downloadedCount}/${picList.length})`}
            />
            <Text type="secondary">
              <DownloadOutlined /> 正在自动下载图片到Cloudflare R2存储，请稍候...
            </Text>
          </>
        )}

        {status === 'completed' && (
          <>
            <Progress 
              percent={100} 
              status="success" 
              format={() => '下载完成'}
            />
            <Alert
              message="下载完成"
              description={`所有图片已成功下载，${downloadedCount} 张图片准备就绪`}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
            <Text type="secondary">3秒后自动进入下一步...</Text>
          </>
        )}

        {status === 'error' && (
          <Alert
            message="下载失败"
            description={errorMessage}
            type="error"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default Step2Download; 