import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Space, Typography, message, Alert, Divider } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { weixinPublishAPI } from '@/services/api';

const { Text, Title } = Typography;

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
  accountId: number; // 添加账户ID
  onComplete: () => void;
  onBack: () => void;
}

const Step4Publish: React.FC<Step4Props> = ({ 
  selectedPics, 
  accountId,
  onComplete, 
  onBack 
}) => {
  const [loading, setLoading] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'completed' | 'failed'>('idle');
  const [taskId, setTaskId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 监控发布进度
  useEffect(() => {
    if (taskId && publishStatus === 'publishing') {
      const interval = setInterval(async () => {
        try {
          const result = await weixinPublishAPI.getPublishProgress(taskId);
          if (result.success) {
            const { progress, status, result: taskResult } = result.data;
            setPublishProgress(progress);
            
            if (status === 'completed') {
              setPublishStatus('completed');
              message.success('发布成功！');
              setTimeout(() => onComplete(), 1000);
            } else if (status === 'failed') {
              setPublishStatus('failed');
              setErrorMessage(taskResult?.error || '发布失败');
              message.error('发布失败');
            }
          }
        } catch (error) {
          console.error('获取发布进度失败:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [taskId, publishStatus, onComplete]);

  const handlePublish = async () => {
    try {
      setLoading(true);
      setPublishStatus('publishing');
      setPublishProgress(0);
      setErrorMessage('');

      // 分离合格和不合格的图片
      const qualifiedPics = selectedPics.filter(pic => !pic.isUnfit);
      const unfitPics = selectedPics.filter(pic => pic.isUnfit);

      if (qualifiedPics.length === 0) {
        message.error('没有合格的图片可以发布');
        setPublishStatus('failed');
        setErrorMessage('没有合格的图片');
        return;
      }

      console.log(`准备发布 ${qualifiedPics.length} 张合格图片，${unfitPics.length} 张不合格图片`);

      // 调用微信发布API
      const result = await weixinPublishAPI.publishToWeixin({
        account_id: accountId,
        pids: qualifiedPics.map(pic => pic.pid),
        unfit_pids: unfitPics.map(pic => pic.pid)
      });

      if (result.success) {
        setTaskId(result.data.task_id);
        message.success('发布任务已创建，正在处理中...');
      } else {
        throw new Error(result.error || '创建发布任务失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      setPublishStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : String(error));
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title level={4}>发布到公众号</Title>
      
      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        {/* 发布统计 */}
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <Text strong>发布统计：</Text>
          <br />
          <Text>✅ 合格图片：{selectedPics.filter(pic => !pic.isUnfit).length} 张</Text>
          <br />
          <Text>❌ 不合格图片：{selectedPics.filter(pic => pic.isUnfit).length} 张</Text>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <Alert
            message="发布失败"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage('')}
          />
        )}

        {/* 发布进度 */}
        {publishStatus === 'publishing' && (
          <div>
            <Text strong>发布进度：</Text>
            <Progress 
              percent={publishProgress} 
              status="active" 
              style={{ marginTop: 8 }}
            />
            <Text type="secondary">正在上传图片到微信素材库并创建草稿文章...</Text>
          </div>
        )}

        {/* 发布完成 */}
        {publishStatus === 'completed' && (
          <Alert
            message="发布成功"
            description="图片已成功上传到微信公众号，草稿文章已创建"
            type="success"
            showIcon
          />
        )}

        <Divider />

        {/* 操作按钮 */}
        <Space>
          <Button onClick={onBack} disabled={publishStatus === 'publishing'}>
            上一步
          </Button>
          
          {publishStatus === 'idle' && (
            <Button 
              type="primary" 
              onClick={handlePublish} 
              loading={loading}
              icon={<UploadOutlined />}
            >
              开始发布
            </Button>
          )}

          {publishStatus === 'failed' && (
            <Button 
              type="primary" 
              onClick={handlePublish} 
              loading={loading}
              icon={<UploadOutlined />}
            >
              重试发布
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default Step4Publish; 