import React from 'react';
import { 
  Card, 
  Typography, 
  Divider, 
  Space, 
  Tag, 
  Button,
  Row,
  Col,
  Timeline,
  Alert
} from 'antd';
import { 
  BookOutlined, 
  VideoCameraOutlined, 
  SettingOutlined, 
  ApiOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text, Link } = Typography;

/**
 * 使用文档页面组件
 * 提供系统使用说明和帮助文档
 */
const Documentation: React.FC = () => {
  /**
   * 跳转到外部链接
   */
  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>使用文档</h1>
        <Text type="secondary">LinkMatrix 自媒体矩阵运营工具使用指南</Text>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          {/* 快速开始 */}
          <Card title="快速开始" style={{ marginBottom: 24 }}>
            <Timeline>
              <Timeline.Item color="green">
                <Title level={5}>1. 配置系统设置</Title>
                <Paragraph>
                  前往 <Link href="#/system-settings">系统设置</Link> 页面，配置FFmpeg路径、AI API Key等基础参数。
                </Paragraph>
              </Timeline.Item>
              
              <Timeline.Item color="green">
                <Title level={5}>2. 添加自媒体账号</Title>
                <Paragraph>
                  在 <Link href="#/account-management">账号管理</Link> 中添加您的各平台账号信息，
                  包括抖音、快手、小红书等。
                </Paragraph>
              </Timeline.Item>
              
              <Timeline.Item color="green">
                <Title level={5}>3. 配置浏览器和代理</Title>
                <Paragraph>
                  在 <Link href="#/resource-management">资源管理</Link> 中配置浏览器环境和代理IP，
                  确保发布任务的稳定性。
                </Paragraph>
              </Timeline.Item>
              
              <Timeline.Item color="blue">
                <Title level={5}>4. 开始发布内容</Title>
                <Paragraph>
                  使用 <Link href="#/one-click-publish">一键发布</Link> 功能，
                  将您的视频或文章同时发布到多个平台。
                </Paragraph>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* 功能介绍 */}
          <Card title="功能介绍" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space>
                    <BookOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>账号管理</Title>
                      <Text type="secondary">管理多平台自媒体账号</Text>
                    </div>
                  </Space>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    支持添加、编辑、删除各大自媒体平台账号，
                    实时监控账号状态，确保发布任务正常执行。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space>
                    <VideoCameraOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>一键发布</Title>
                      <Text type="secondary">多平台内容同步发布</Text>
                    </div>
                  </Space>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    支持视频和文章的批量发布，
                    自动适配各平台的格式要求，提高发布效率。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space>
                    <SettingOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>资源管理</Title>
                      <Text type="secondary">浏览器和代理配置</Text>
                    </div>
                  </Space>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    管理浏览器配置文件和代理IP池，
                    提供稳定的网络环境和账号隔离。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space>
                    <ApiOutlined style={{ fontSize: 20, color: '#eb2f96' }} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>自媒体工具</Title>
                      <Text type="secondary">AI辅助内容创作</Text>
                    </div>
                  </Space>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    提供视频翻译、文档转换、AI标题生成等工具，
                    提升内容创作效率。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 常见问题 */}
          <Card title="常见问题" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <QuestionCircleOutlined /> 如何配置FFmpeg？
              </Title>
              <Paragraph>
                1. 从 <Link href="https://ffmpeg.org/download.html" target="_blank">FFmpeg官网</Link> 下载对应系统版本<br/>
                2. 解压到本地目录（如：C:\ffmpeg）<br/>
                3. 在系统设置中配置FFmpeg可执行文件路径<br/>
                4. 点击"测试"按钮验证配置是否正确
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <QuestionCircleOutlined /> 为什么发布任务失败？
              </Title>
              <Paragraph>
                常见原因包括：<br/>
                • 账号登录状态异常，请检查账号管理页面<br/>
                • 网络连接问题，请检查代理配置<br/>
                • 内容格式不符合平台要求<br/>
                • 平台限制或风控机制触发
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <QuestionCircleOutlined /> 如何提高发布成功率？
              </Title>
              <Paragraph>
                建议措施：<br/>
                • 配置多个高质量代理IP<br/>
                • 定期检查账号状态<br/>
                • 避免频繁发布，遵循平台规则<br/>
                • 使用不同的浏览器配置文件
              </Paragraph>
            </div>
          </Card>

          {/* API文档 */}
          <Card title="API文档">
            <Paragraph>
              如果您需要集成LinkMatrix到自己的系统中，可以参考我们的API文档：
            </Paragraph>
            
            <Space wrap>
              <Tag color="blue">RESTful API</Tag>
              <Tag color="green">WebSocket</Tag>
              <Tag color="orange">Webhook</Tag>
            </Space>

            <Divider />

            <Title level={5}>主要接口</Title>
            <ul>
              <li><code>POST /api/accounts</code> - 添加账号</li>
              <li><code>GET /api/accounts</code> - 获取账号列表</li>
              <li><code>POST /api/publish</code> - 发布内容</li>
              <li><code>GET /api/tasks</code> - 获取任务状态</li>
              <li><code>POST /api/tools/translate</code> - 视频翻译</li>
            </ul>

            <Button type="primary" style={{ marginTop: 16 }}>
              查看完整API文档
            </Button>
          </Card>
        </Col>

        <Col span={8}>
          {/* 版本信息 */}
          <Card title="版本信息" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>当前版本：</Text>
                <Tag color="blue">v1.0.0</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>发布日期：</Text>
                <Text>2024-01-15</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>更新内容：</Text>
                <Text type="secondary">初始版本</Text>
              </div>
            </Space>

            <Divider />

            <Title level={5}>更新日志</Title>
            <Timeline>
              <Timeline.Item>
                <Text strong>v1.0.0</Text> (2024-01-15)<br/>
                <Text type="secondary">• 初始版本发布</Text><br/>
                <Text type="secondary">• 支持多平台发布</Text><br/>
                <Text type="secondary">• 集成AI工具</Text>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* 技术支持 */}
          <Card title="技术支持" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                icon={<GithubOutlined />} 
                block 
                onClick={() => openExternalLink('https://github.com/linkmatrix')}
              >
                GitHub 仓库
              </Button>
              
              <Button 
                icon={<MailOutlined />} 
                block
                onClick={() => openExternalLink('mailto:support@linkmatrix.com')}
              >
                邮件支持
              </Button>
              
              <Button 
                icon={<QuestionCircleOutlined />} 
                block
                onClick={() => openExternalLink('https://docs.linkmatrix.com')}
              >
                在线文档
              </Button>
            </Space>
          </Card>

          {/* 系统要求 */}
          <Card title="系统要求">
            <Title level={5}>最低配置</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li>操作系统：Windows 10 / macOS 10.14 / Ubuntu 18.04</li>
              <li>内存：4GB RAM</li>
              <li>存储：2GB 可用空间</li>
              <li>网络：稳定的互联网连接</li>
            </ul>

            <Title level={5}>推荐配置</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li>内存：8GB RAM 或更高</li>
              <li>存储：10GB 可用空间</li>
              <li>网络：高速稳定连接</li>
              <li>代理：多个高质量代理IP</li>
            </ul>
          </Card>

          <Alert
            message="使用提醒"
            description="请遵守各平台的使用规则，合理使用自动化工具，避免违规操作。"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Documentation;