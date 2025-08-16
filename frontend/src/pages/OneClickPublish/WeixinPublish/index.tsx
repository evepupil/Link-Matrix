import React, { useState, useEffect } from 'react';
import { Steps, Spin, message, Typography } from 'antd';
import { WechatOutlined, DownloadOutlined, CheckCircleOutlined, UploadOutlined, CheckCircleFilled } from '@ant-design/icons';
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
  appid: string;
  app_secret: string;
  wx_id: string;
  title: string;
  author: string;
  thumb_media_id?: string;
  illust_tag: string[][];
  status: string;
}

interface PicItem {
  pid: number;
  url?: string;
  image_path?: string;
  isUnfit: boolean;
  localPath?: string;
  downloadStatus?: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress?: number;
}

const WeixinPublish: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accounts, setAccounts] = useState<WeixinAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WeixinAccount | null>(null);
  const [picList, setPicList] = useState<PicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null); // 保存最后的搜索参数

  // 获取微信公众号账户列表
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await apiAccountAPI.getAll();
      if (response.success && response.data) {
        setAccounts(response.data);
      } else {
        message.error('获取微信公众号账户失败');
      }
    } catch (error) {
      console.error('获取微信公众号账户失败:', error);
      message.error('获取微信公众号账户失败');
    }
  };

  // 查询图片的通用函数
  const queryPictures = async (searchParams: any) => {
    try {
      setLoading(true);
      const response = await weixinPublishAPI.queryPics(searchParams);

      if (response.success && response.data) {
        const pics = response.data.slice(0, searchParams.limit).map((pic: any) => ({
          pid: pic.pid,
          url: pic.image_url || '',
          image_path: pic.image_path || '',
          isUnfit: false,
          downloadStatus: 'pending' as const,
          downloadProgress: 0,
        }));
        setPicList(pics);
        return true;
      } else {
        message.error(response.error || '查询图片失败');
        return false;
      }
    } catch (error) {
      console.error('查询图片失败:', error);
      message.error('查询图片失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 第一步：账户选择和参数设置
  const handleStep1Next = async (values: any) => {
    const account = accounts.find(acc => acc.id === values.accountId);
    setSelectedAccount(account || null);

    const selectedTags = values.tags?.map((index: number) => account?.illust_tag[index]).flat() || [];
    const searchParams = {
      wx_name: account?.wx_id || '',
      tags: selectedTags,
      unsupport_tags: [],
      limit: values.picCount || 12,
      popularity: values.popularity || 0.15,
    };

    // 保存搜索参数用于换一批
    setLastSearchParams(searchParams);

    const success = await queryPictures(searchParams);
    if (success) {
      setCurrentStep(1); // 进入下载选择界面
    }
  };

  // 处理本地下载（直接跳转到图片选择界面）
  const handleLocalDownload = () => {
    setCurrentStep(2); // 直接跳转到图片选择界面
  };

  // 处理云端下载完成
  const handleCloudDownloadComplete = () => {
    setCurrentStep(2); // 进入图片选择界面
  };

  // 处理图片选择完成
  const handleImageSelectionComplete = (selectedPics: PicItem[]) => {
    // 更新图片列表，只保留选中的图片
    setPicList(selectedPics);
    setCurrentStep(3); // 进入发布界面
  };

  // 处理发布完成
  const handlePublishComplete = () => {
    setCurrentStep(4); // 进入完成界面
  };

  // 换一批图片
  const handleRefreshPics = async () => {
    if (lastSearchParams) {
      const success = await queryPictures(lastSearchParams);
      if (success) {
        message.success('已为您换了一批新图片');
      }
    }
  };

  // 返回上一步
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 步骤定义
  const steps = [
    {
      title: '账户选择',
      icon: <WechatOutlined />,
      description: '选择微信公众号和设置参数',
    },
    {
      title: '下载方式',
      icon: <DownloadOutlined />,
      description: '选择本地下载或云端下载',
    },
    {
      title: '图片选择',
      icon: <CheckCircleOutlined />,
      description: '标记不合格图片并选择',
    },
    {
      title: '发布',
      icon: <UploadOutlined />,
      description: '发布到微信公众号',
    },
    {
      title: '完成',
      icon: <CheckCircleFilled />,
      description: '发布完成',
    },
  ];

  // 渲染步骤内容
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
            onNext={handleCloudDownloadComplete}
            onLocalDownload={handleLocalDownload}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3ImageSelection
            picList={picList}
            onNext={handleImageSelectionComplete}
            onBack={handleBack}
            onRefresh={handleRefreshPics}
          />
        );
      case 3:
        return (
          <Step4Publish
            selectedPics={picList}
            onComplete={handlePublishComplete}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5Complete
            onBack={() => setCurrentStep(0)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>微信公众号发布</Title>
      
      <Steps
        current={currentStep}
        items={steps}
        style={{ marginBottom: '32px' }}
      />

      <div style={{ minHeight: '400px' }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default WeixinPublish; 