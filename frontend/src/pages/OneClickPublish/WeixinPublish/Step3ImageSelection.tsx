import React, { useState, useEffect } from 'react';
import { Card, Image, Checkbox, Button, Row, Col, Typography, Space, Progress, Alert, Divider, message } from 'antd';
import { CheckCircleOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PicItem {
  pid: number;
  url?: string; // Original URL
  image_path?: string; // CF R2 public link
  author_name?: string; // 作者名称
  isUnfit: boolean;
  localPath?: string; // 本地下载路径
  downloadStatus?: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress?: number;
}

interface Step3Props {
  picList: PicItem[];
  onNext: (selectedPics: PicItem[]) => void;
  onBack: () => void;
  onRefresh: () => void; // 新增：换一批回调
}

const Step3ImageSelection: React.FC<Step3Props> = ({ picList, onNext, onBack, onRefresh }) => {
  const [pics, setPics] = useState<PicItem[]>(picList);
  const [selectedPics, setSelectedPics] = useState<PicItem[]>([]);
  const [downloadingCount, setDownloadingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // 当picList变化时更新内部状态（换一批时）
  useEffect(() => {
    setPics(picList);
    setDownloadingCount(0);
    setCompletedCount(0);
  }, [picList]);

  // 生成代理API链接
  const getProxyImageUrl = (pid: number, size: string = 'regular') => {
    return `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=${size}`;
  };

  // 处理图片标记为不合格
  const handlePicToggle = (pid: number) => {
    setPics(prev => prev.map(pic => 
      pic.pid === pid ? { ...pic, isUnfit: !pic.isUnfit } : pic
    ));
  };

  // 开始本地下载（只下载合格的图片）
  const startLocalDownload = async () => {
    // 只下载合格的图片（未标记为不合格且未下载完成的）
    const pendingPics = pics.filter(pic => 
      !pic.isUnfit && 
      !pic.localPath && 
      pic.downloadStatus !== 'completed'
    );
    
    if (pendingPics.length === 0) {
      message.info('没有需要下载的合格图片');
      return;
    }

    console.log(`开始下载 ${pendingPics.length} 张合格图片`);
    setDownloadingCount(pendingPics.length);
    
    // 更新状态为下载中
    setPics(prev => prev.map(pic => 
      pendingPics.some(p => p.pid === pic.pid) 
        ? { ...pic, downloadStatus: 'downloading', downloadProgress: 0 }
        : pic
    ));

    // 并发下载所有合格图片
    const downloadPromises = pendingPics.map(async (pic) => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/weixin/download-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid: pic.pid }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // 更新下载状态
            setPics(prev => prev.map(p => 
              p.pid === pic.pid 
                ? { 
                    ...p, 
                    downloadStatus: 'completed', 
                    downloadProgress: 100,
                    localPath: result.data.localPath 
                  }
                : p
            ));
            setCompletedCount(prev => prev + 1);
            setDownloadingCount(prev => prev - 1);
          } else {
            throw new Error(result.error || '下载失败');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`下载图片 ${pic.pid} 失败:`, error);
        setPics(prev => prev.map(p => 
          p.pid === pic.pid 
            ? { ...p, downloadStatus: 'failed', downloadProgress: 0 }
            : p
        ));
        setDownloadingCount(prev => prev - 1);
      }
    });

    await Promise.all(downloadPromises);
  };

  // 处理下一步
  const handleNext = () => {
    const validPics = pics.filter(pic => !pic.isUnfit);
    onNext(validPics);
  };

  // 检查是否可以进入下一步（图片已下载且没有正在下载的）
  const hasDownloadedPics = pics.some(pic => pic.downloadStatus === 'completed' || pic.localPath);
  const isDownloading = downloadingCount > 0;
  const canProceed = pics.length > 0 && pics.some(pic => !pic.isUnfit) && hasDownloadedPics && !isDownloading;

  return (
    <Card>
      <Title level={3}>图片选择</Title>
      <Text type="secondary">
        已查询到 {picList.length} 张符合条件的图片，请标记不合格的图片
      </Text>

      <Divider />

      {/* 下载控制区域 */}
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={startLocalDownload}
            disabled={downloadingCount > 0}
          >
            开始本地下载
          </Button>
          <Button 
            icon={<EyeOutlined />}
            onClick={onRefresh}
            disabled={downloadingCount > 0}
          >
            换一批
          </Button>
          <Text type="secondary">
            {downloadingCount > 0 && `正在下载: ${downloadingCount} 张`}
            {completedCount > 0 && `已完成: ${completedCount} 张`}
          </Text>
        </Space>
      </div>

      {/* 图片网格 */}
      <Row gutter={[16, 16]}>
        {pics.map((pic) => (
          <Col key={pic.pid} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              size="small"
              style={{ 
                border: pic.isUnfit ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                position: 'relative'
              }}
            >
              {/* 图片显示 */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Image
                  src={getProxyImageUrl(pic.pid)}
                  alt={`图片 ${pic.pid}`}
                  preview={false}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover',
                    filter: pic.isUnfit ? 'grayscale(100%)' : 'none'
                  }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
                
                {/* 下载状态指示器 */}
                {pic.downloadStatus === 'downloading' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    下载中...
                  </div>
                )}
                
                {pic.downloadStatus === 'completed' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#52c41a',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    <CheckCircleOutlined />
                  </div>
                )}
              </div>

              {/* 图片信息 */}
              <div style={{ textAlign: 'center' }}>
                <Text strong>PID: {pic.pid}</Text>
                {pic.author_name && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      作者: {pic.author_name}
                    </Text>
                  </>
                )}
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {pic.localPath ? '本地已下载' : '使用代理显示'}
                </Text>
              </div>

              {/* 下载进度条 */}
              {pic.downloadStatus === 'downloading' && (
                <Progress 
                  percent={pic.downloadProgress || 0} 
                  size="small" 
                  style={{ marginTop: '8px' }}
                />
              )}

              {/* 操作按钮 */}
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Checkbox
                  checked={pic.isUnfit}
                  onChange={() => handlePicToggle(pic.pid)}
                >
                  标记为不合格
                </Checkbox>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 底部操作区域 */}
      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button onClick={onBack}>上一步</Button>
            <Button 
              type="primary" 
              onClick={handleNext}
              disabled={!canProceed}
            >
              下一步
            </Button>
          </Space>
          {!canProceed && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {!hasDownloadedPics && '请先下载图片再进入下一步'}
              {isDownloading && '请等待图片下载完成'}
              {hasDownloadedPics && !isDownloading && pics.every(pic => pic.isUnfit) && '请至少选择一张合格图片'}
            </Text>
          )}
        </Space>
      </div>

      {/* 统计信息 */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Text type="secondary">
          共 {pics.length} 张图片，其中 {pics.filter(p => !p.isUnfit).length} 张合格
        </Text>
      </div>
    </Card>
  );
};

export default Step3ImageSelection; 