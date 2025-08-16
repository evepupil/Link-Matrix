import React, { useEffect, useState } from 'react';
import { Card, Progress, Space, Typography, Alert, Button, Row, Col, Divider } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloudDownloadOutlined, DesktopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Step2Props {
  picList: any[];
  onNext: () => void;
  onLocalDownload: () => void; // 新增：本地下载回调
  onBack: () => void; // 新增：返回上一步回调
}

const Step2Download: React.FC<Step2Props> = ({ picList, onNext, onLocalDownload, onBack }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [status, setStatus] = useState<'selecting' | 'downloading' | 'completed' | 'error'>('selecting');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLocalDownload = () => {
    // 直接跳转到图片选择界面，使用代理API显示图片
    onLocalDownload();
  };

  const handleCloudDownload = async () => {
    setStatus('downloading');
    const pids = picList.map(pic => pic.pid);
    const startTime = Date.now();
    const timeout = 60000; // 1分钟超时

    const checkProgress = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/weixin/check-download-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pids }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const downloaded = data.data.filter((item: any) => item.image_path).length;
            const progress = Math.round((downloaded / pids.length) * 100);
            
            setDownloadProgress(progress);
            setDownloadedCount(downloaded);

            if (downloaded === pids.length) {
              setStatus('completed');
              setTimeout(() => onNext(), 1500);
              return;
            }
          }
        }

        // 检查超时
        if (Date.now() - startTime > timeout) {
          setStatus('error');
          setErrorMessage('下载超时，请检查网络连接');
          return;
        }

        // 继续轮询
        setTimeout(checkProgress, 1000);
      } catch (error) {
        console.error('检查下载进度失败:', error);
        setStatus('error');
        setErrorMessage('检查下载进度失败');
      }
    };

    checkProgress();
  };

  return (
    <Card>
      <Title level={3}>选择下载方式</Title>
      <Text type="secondary">请选择图片的下载方式</Text>
      
      <Divider />
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card 
            hoverable 
            style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={handleLocalDownload}
          >
            <DesktopOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>本地下载</Title>
            <Text type="secondary">
              使用代理API直接显示图片，无需等待下载完成
            </Text>
            <div style={{ marginTop: '16px' }}>
              <Button type="primary" icon={<DownloadOutlined />}>
                开始本地下载
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            hoverable 
            style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={handleCloudDownload}
          >
            <CloudDownloadOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4}>云端下载</Title>
            <Text type="secondary">
              下载图片到云端存储，显示下载进度
            </Text>
            <div style={{ marginTop: '16px' }}>
              <Button type="primary" icon={<CloudDownloadOutlined />}>
                开始云端下载
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 云端下载进度显示 */}
      {status === 'downloading' && (
        <div style={{ marginTop: '24px' }}>
          <Divider />
          <Title level={4}>云端下载进度</Title>
          <Progress 
            percent={downloadProgress} 
            status="active"
            format={() => `${downloadedCount}/${picList.length}`}
          />
          <Text type="secondary">
            正在下载图片到云端存储...
          </Text>
        </div>
      )}

      {/* 下载完成 */}
      {status === 'completed' && (
        <div style={{ marginTop: '24px' }}>
          <Alert
            message="下载完成"
            description={`所有图片已成功下载到云端，共 ${picList.length} 张`}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </div>
      )}

      {/* 下载错误 */}
      {status === 'error' && (
        <div style={{ marginTop: '24px' }}>
          <Alert
            message="下载失败"
            description={errorMessage}
            type="error"
            showIcon
          />
        </div>
      )}

      {/* 底部操作按钮 */}
      <Divider />
      <div style={{ textAlign: 'left' }}>
        <Button onClick={onBack}>上一步</Button>
      </div>
    </Card>
  );
};

export default Step2Download; 