import React, { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Upload, 
  Button, 
  Form, 
  Select, 
  Input, 
  Progress, 
  Steps, 
  message, 
  Space,
  Checkbox,
  ColorPicker,
  Slider,
  Row,
  Col,
  Typography,
  List
} from 'antd';
import { 
  UploadOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined, 
  BulbOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;
const { Text, Title } = Typography;

interface VideoFile {
  uid: string;
  name: string;
  status: string;
  url?: string;
}

interface TranslationTask {
  currentStep: number;
  progress: number;
  logs: string[];
  translatedText: string;
  subtitleSettings: {
    fontSize: number;
    fontColor: string;
    position: string;
    backgroundColor: string;
  };
}

interface ArticleTitle {
  id: string;
  title: string;
  selected: boolean;
}

/**
 * 自媒体工具页面组件
 * 包含视频翻译、视频转文档、AI标题生成等功能
 */
const MediaTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('translation');
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [translationTask, setTranslationTask] = useState<TranslationTask>({
    currentStep: 0,
    progress: 0,
    logs: [],
    translatedText: '',
    subtitleSettings: {
      fontSize: 16,
      fontColor: '#ffffff',
      position: 'bottom',
      backgroundColor: '#000000',
    },
  });
  const [generatedTitles, setGeneratedTitles] = useState<ArticleTitle[]>([]);
  const [titleGenerating, setTitleGenerating] = useState(false);
  const [form] = Form.useForm();

  /**
   * 视频上传配置
   */
  const uploadProps: UploadProps = {
    name: 'video',
    multiple: false,
    accept: '.mp4,.avi,.mov,.mkv',
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith('video/');
      if (!isVideo) {
        message.error('只能上传视频文件！');
        return false;
      }
      const isLt500M = file.size / 1024 / 1024 < 500;
      if (!isLt500M) {
        message.error('视频文件大小不能超过500MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      if (info.fileList.length > 0) {
        const file = info.fileList[0];
        setVideoFile({
          uid: file.uid,
          name: file.name,
          status: file.status || 'done',
        });
      } else {
        setVideoFile(null);
      }
    },
  };

  /**
   * 开始视频翻译
   */
  const startTranslation = async () => {
    if (!videoFile) {
      message.error('请先上传视频文件');
      return;
    }

    try {
      const values = await form.validateFields();
      
      // 模拟翻译过程
      setTranslationTask(prev => ({ ...prev, currentStep: 1, progress: 0, logs: ['开始语音识别...'] }));
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTranslationTask(prev => {
          const newProgress = Math.min(prev.progress + 10, 100);
          const newLogs = [...prev.logs];
          
          if (newProgress === 30) {
            newLogs.push('语音识别完成，开始翻译...');
          } else if (newProgress === 60) {
            newLogs.push('翻译完成，生成字幕文件...');
          } else if (newProgress === 100) {
            newLogs.push('字幕生成完成！');
            clearInterval(progressInterval);
            return {
              ...prev,
              currentStep: 2,
              progress: newProgress,
              logs: newLogs,
              translatedText: '这是翻译后的文本内容示例...',
            };
          }
          
          return { ...prev, progress: newProgress, logs: newLogs };
        });
      }, 500);
      
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 生成字幕
   */
  const generateSubtitles = () => {
    setTranslationTask(prev => ({
      ...prev,
      currentStep: 3,
      logs: [...prev.logs, '正在生成字幕文件...', '字幕文件生成完成！'],
    }));
    message.success('字幕生成成功！');
  };

  /**
   * 嵌入字幕到视频
   */
  const embedSubtitles = () => {
    setTranslationTask(prev => ({
      ...prev,
      logs: [...prev.logs, '正在将字幕嵌入视频...', '视频处理完成！'],
    }));
    message.success('字幕嵌入成功！');
  };

  /**
   * 生成AI标题
   */
  const generateTitles = async () => {
    try {
      const values = await form.validateFields(['content', 'keywords']);
      setTitleGenerating(true);
      
      // 模拟AI生成标题
      setTimeout(() => {
        const titles = [
          '如何在30天内掌握新技能：实用指南',
          '新技能学习的5个关键步骤',
          '从零开始：快速学习新技能的秘诀',
          '高效学习法：让你的技能提升事半功倍',
          '专家分享：新技能学习的最佳实践',
        ];
        
        setGeneratedTitles(titles.map((title, index) => ({
          id: `title-${index}`,
          title,
          selected: false,
        })));
        setTitleGenerating(false);
        message.success('标题生成成功！');
      }, 2000);
    } catch (error) {
      setTitleGenerating(false);
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 选择标题
   */
  const toggleTitleSelection = (titleId: string) => {
    setGeneratedTitles(prev => 
      prev.map(title => 
        title.id === titleId 
          ? { ...title, selected: !title.selected }
          : title
      )
    );
  };

  /**
   * 重新生成标题
   */
  const regenerateTitles = () => {
    generateTitles();
  };

  return (
    <div>
      <h1>自媒体工具</h1>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 视频翻译与加字幕 */}
        <TabPane tab="视频翻译与加字幕" key="translation">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="视频上传" style={{ marginBottom: 16 }}>
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽视频文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持 MP4、AVI、MOV、MKV 格式，文件大小不超过500MB
                  </p>
                </Upload.Dragger>
                {videoFile && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>已选择文件：</Text> {videoFile.name}
                  </div>
                )}
              </Card>

              <Card title="翻译设置">
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="sourceLanguage"
                    label="源语言"
                    rules={[{ required: true, message: '请选择源语言' }]}
                  >
                    <Select placeholder="请选择源语言">
                      <Select.Option value="zh">中文</Select.Option>
                      <Select.Option value="en">英语</Select.Option>
                      <Select.Option value="ja">日语</Select.Option>
                      <Select.Option value="ko">韩语</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="targetLanguages"
                    label="目标语言"
                    rules={[{ required: true, message: '请选择目标语言' }]}
                  >
                    <Select mode="multiple" placeholder="请选择目标语言">
                      <Select.Option value="zh">中文</Select.Option>
                      <Select.Option value="en">英语</Select.Option>
                      <Select.Option value="ja">日语</Select.Option>
                      <Select.Option value="ko">韩语</Select.Option>
                    </Select>
                  </Form.Item>

                  <Title level={5}>字幕样式设置</Title>
                  
                  <Form.Item label="字体大小">
                    <Slider
                      min={12}
                      max={32}
                      value={translationTask.subtitleSettings.fontSize}
                      onChange={(value) => 
                        setTranslationTask(prev => ({
                          ...prev,
                          subtitleSettings: { ...prev.subtitleSettings, fontSize: value }
                        }))
                      }
                    />
                  </Form.Item>

                  <Form.Item label="字体颜色">
                    <ColorPicker
                      value={translationTask.subtitleSettings.fontColor}
                      onChange={(color) =>
                        setTranslationTask(prev => ({
                          ...prev,
                          subtitleSettings: { ...prev.subtitleSettings, fontColor: color.toHexString() }
                        }))
                      }
                    />
                  </Form.Item>

                  <Form.Item label="字幕位置">
                    <Select
                      value={translationTask.subtitleSettings.position}
                      onChange={(value) =>
                        setTranslationTask(prev => ({
                          ...prev,
                          subtitleSettings: { ...prev.subtitleSettings, position: value }
                        }))
                      }
                    >
                      <Select.Option value="top">顶部</Select.Option>
                      <Select.Option value="center">中间</Select.Option>
                      <Select.Option value="bottom">底部</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="处理进度">
                <Steps current={translationTask.currentStep} direction="vertical" size="small">
                  <Step title="语音识别" description="提取视频中的语音内容" />
                  <Step title="文本翻译" description="将识别的文本翻译为目标语言" />
                  <Step title="生成字幕" description="生成字幕文件" />
                  <Step title="嵌入视频" description="将字幕嵌入到视频中" />
                </Steps>

                {translationTask.progress > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Progress percent={translationTask.progress} />
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />}
                      onClick={startTranslation}
                      disabled={translationTask.currentStep > 0}
                    >
                      开始翻译
                    </Button>
                    <Button 
                      onClick={generateSubtitles}
                      disabled={translationTask.currentStep < 2}
                    >
                      生成字幕
                    </Button>
                    <Button 
                      onClick={embedSubtitles}
                      disabled={translationTask.currentStep < 3}
                    >
                      嵌入字幕
                    </Button>
                  </Space>
                </div>
              </Card>

              {translationTask.translatedText && (
                <Card title="翻译结果" style={{ marginTop: 16 }}>
                  <TextArea
                    value={translationTask.translatedText}
                    onChange={(e) => 
                      setTranslationTask(prev => ({ ...prev, translatedText: e.target.value }))
                    }
                    rows={6}
                    placeholder="翻译结果将显示在这里，您可以进行编辑"
                  />
                </Card>
              )}

              {translationTask.logs.length > 0 && (
                <Card title="操作日志" style={{ marginTop: 16 }}>
                  <List
                    size="small"
                    dataSource={translationTask.logs}
                    renderItem={(log, index) => (
                      <List.Item>
                        <Text type="secondary">[{new Date().toLocaleTimeString()}]</Text> {log}
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        {/* 视频转文档 */}
        <TabPane tab="视频转文档" key="video-to-doc">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="视频上传">
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽视频文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    系统将提取视频中的语音内容并转换为文档
                  </p>
                </Upload.Dragger>
              </Card>

              <Card title="转换设置" style={{ marginTop: 16 }}>
                <Form layout="vertical">
                  <Form.Item name="language" label="语音语言">
                    <Select placeholder="请选择语音语言">
                      <Select.Option value="zh">中文</Select.Option>
                      <Select.Option value="en">英语</Select.Option>
                      <Select.Option value="ja">日语</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="format" label="输出格式">
                    <Select placeholder="请选择输出格式">
                      <Select.Option value="txt">纯文本 (.txt)</Select.Option>
                      <Select.Option value="docx">Word文档 (.docx)</Select.Option>
                      <Select.Option value="pdf">PDF文档 (.pdf)</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>

                <Button type="primary" icon={<FileTextOutlined />} block>
                  开始转换
                </Button>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="转换结果">
                <TextArea
                  rows={15}
                  placeholder="转换后的文本内容将显示在这里..."
                  value="这里是从视频中提取的语音转文字内容示例。您可以在这里编辑文本内容，然后导出为不同格式的文档。"
                />
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    导出文档
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* AI文章标题生成 */}
        <TabPane tab="AI文章标题生成" key="title-generation">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="内容输入">
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="content"
                    label="内容概述"
                    rules={[{ required: true, message: '请输入内容概述' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="请描述您的文章内容概述..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="keywords"
                    label="关键词"
                    rules={[{ required: true, message: '请输入关键词' }]}
                  >
                    <Input placeholder="请输入关键词，用逗号分隔" />
                  </Form.Item>

                  <Form.Item name="style" label="标题风格">
                    <Select placeholder="请选择标题风格">
                      <Select.Option value="professional">专业严谨</Select.Option>
                      <Select.Option value="catchy">吸引眼球</Select.Option>
                      <Select.Option value="question">疑问式</Select.Option>
                      <Select.Option value="howto">教程式</Select.Option>
                    </Select>
                  </Form.Item>

                  <Space>
                    <Button 
                      type="primary" 
                      icon={<BulbOutlined />}
                      onClick={generateTitles}
                      loading={titleGenerating}
                    >
                      生成标题
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={regenerateTitles}
                      disabled={generatedTitles.length === 0}
                    >
                      重新生成
                    </Button>
                  </Space>
                </Form>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="生成的标题建议">
                {generatedTitles.length > 0 ? (
                  <List
                    dataSource={generatedTitles}
                    renderItem={(title) => (
                      <List.Item
                        actions={[
                          <Checkbox
                            checked={title.selected}
                            onChange={() => toggleTitleSelection(title.id)}
                          >
                            选择
                          </Checkbox>
                        ]}
                      >
                        <List.Item.Meta
                          title={title.title}
                          description={
                            <Input
                              size="small"
                              defaultValue={title.title}
                              placeholder="可以编辑标题..."
                            />
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    点击"生成标题"按钮来获取AI生成的标题建议
                  </div>
                )}

                {generatedTitles.some(t => t.selected) && (
                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" block>
                      使用选中的标题
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MediaTools;