import React, { useState, useEffect } from 'react';
import { Steps, Spin, message, Typography } from 'antd';
import { 
  WechatOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  UploadOutlined,
  CheckCircleFilled 
} from '@ant-design/icons';

import Step1AccountSelection from './Step1AccountSelection';
import Step2Download from './Step2Download';
import Step3ImageSelection from './Step3ImageSelection';
import Step4Publish from './Step4Publish';
import Step5Complete from './Step5Complete';

import { apiAccountAPI, weixinPublishAPI } from '@/services/api';

const { Title } = Typography;

interface WeixinAccount {
  id: number;
  name: string;
  wx_id: string;
  illust_tag: string[][];
}

interface PicItem {
  pid: number;
  url: string;
  image_path?: string;
  isUnfit: boolean;
}

const WeixinPublish: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accounts, setAccounts] = useState<WeixinAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WeixinAccount | null>(null);
  const [picList, setPicList] = useState<PicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // 获取微信公众号账户列表
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await apiAccountAPI.getAll();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      message.error('获取微信公众号账户失败');
    }
  };

  // 步骤1：选择账户和标签
  const handleStep1Next = async (values: any) => {
    try {
      const account = accounts.find(acc => acc.id === values.accountId);
      setSelectedAccount(account || null);
      setLoading(true);

      // 将选中的标签索引转换为实际的标签数组
      const selectedTags = values.tags?.map((index: number) => account?.illust_tag[index]).flat() || [];

      // 调用后端API查询图片
      const response = await weixinPublishAPI.queryPics({
        wx_name: account?.wx_id || '',
        tags: selectedTags,
        unsupport_tags: [], // 暂时为空，后续可以从账户配置中获取
        limit: values.picCount || 12,
        popularity: values.popularity || 0.15,
      });

      if (response.success && response.data) {
        const pics = response.data.slice(0, values.picCount).map((pic: any) => ({
          pid: pic.pid,
          url: pic.url || '',
          isUnfit: false,
        }));
        setPicList(pics);
        setCurrentStep(1);
      } else {
        message.error(response.error || '查询图片失败');
      }
    } catch (error) {
      console.error('查询图片失败:', error);
      message.error('查询图片失败');
    } finally {
      setLoading(false);
    }
  };

  // 步骤2：下载图片（已废弃，现在自动下载）
  const handleDownload = async () => {
    // 这个方法已不再使用，下载现在是自动的
    console.log('下载现在是自动的，无需手动触发');
  };

  // 步骤3：标记图片
  const handlePicToggle = (pid: number) => {
    setPicList(prev => prev.map(pic => 
      pic.pid === pid ? { ...pic, isUnfit: !pic.isUnfit } : pic
    ));
  };

  // 实时更新图片下载状态
  useEffect(() => {
    if (currentStep === 2 && picList.length > 0) {
      const updateImageStatus = async () => {
        try {
          const pids = picList.map(pic => pic.pid);
          const response = await weixinPublishAPI.checkDownloadStatus(pids);
          
          if (response.success && response.data) {
            setPicList(prev => prev.map(pic => {
              const status = response.data.find((item: any) => item.pid === pic.pid);
              return {
                ...pic,
                image_path: status?.image_path || pic.image_path,
                url: status?.image_path || pic.url,
              };
            }));
          }
        } catch (error) {
          console.error('更新图片状态失败:', error);
        }
      };

      // 每秒更新一次状态
      const interval = setInterval(updateImageStatus, 1000);
      
      // 立即执行一次
      updateImageStatus();

      return () => clearInterval(interval);
    }
  }, [currentStep, picList.length]);

  // 步骤4：发布
  const handlePublish = async () => {
    try {
      setLoading(true);
      
      if (!selectedAccount) {
        message.error('未选择账户');
        setLoading(false);
        return;
      }
      
      const fitPids = picList.filter(pic => !pic.isUnfit).map(pic => pic.pid);
      const unfitPids = picList.filter(pic => pic.isUnfit).map(pic => pic.pid);
      
      // 调用后端API开始发布
      const response = await weixinPublishAPI.publishToWeixin({
        account_id: selectedAccount.id,
        pids: fitPids,
        unfit_pids: unfitPids,
      });
      
      if (response.success && response.data?.task_id) {
        const taskId = response.data.task_id;
        
        // 轮询发布进度
        const progressInterval = setInterval(async () => {
          try {
            const progressResponse = await weixinPublishAPI.getPublishProgress(taskId);
            
            if (progressResponse.success && progressResponse.data) {
              const { progress, status } = progressResponse.data;
              setPublishProgress(progress);
              
              if (status === 'completed') {
                clearInterval(progressInterval);
                message.success('发布完成');
                setCurrentStep(4);
                setLoading(false);
              } else if (status === 'failed') {
                clearInterval(progressInterval);
                message.error('发布失败');
                setLoading(false);
              }
            }
          } catch (error) {
            console.error('获取发布进度失败:', error);
          }
        }, 1000);
      } else {
        message.error(response.error || '开始发布失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('发布失败:', error);
      message.error('发布失败');
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '选择账户和标签',
      icon: <WechatOutlined />,
    },
    {
      title: '下载图片',
      icon: <DownloadOutlined />,
    },
    {
      title: '标记图片',
      icon: <CheckCircleOutlined />,
    },
    {
      title: '发布到公众号',
      icon: <UploadOutlined />,
    },
    {
      title: '发布完成',
      icon: <CheckCircleFilled />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1AccountSelection
            accounts={accounts}
            loading={loading}
            onNext={handleStep1Next}
          />
        );
      case 1:
        return (
          <Step2Download
            picList={picList}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Step3ImageSelection
            picList={picList}
            onPicToggle={handlePicToggle}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <Step4Publish
            fitCount={picList.filter(pic => !pic.isUnfit).length}
            publishProgress={publishProgress}
            loading={loading}
            onPublish={handlePublish}
          />
        );
      case 4:
        return (
          <Step5Complete
            fitCount={picList.filter(pic => !pic.isUnfit).length}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>微信公众号发布</Title>
      
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Steps.Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>
      
      <Spin spinning={loading}>
        {renderStepContent()}
      </Spin>
    </div>
  );
};

export default WeixinPublish; 