import React from 'react';
import { Card, Row, Col, Image, Checkbox, Space, Typography, Divider, Tag, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PicItem {
  pid: number;
  url: string;
  isUnfit: boolean;
}

interface Step3Props {
  picList: PicItem[];
  onPicToggle: (pid: number) => void;
  onNext: () => void;
}

const Step3ImageSelection: React.FC<Step3Props> = ({ picList, onPicToggle, onNext }) => {
  const fitCount = picList.filter(pic => !pic.isUnfit).length;
  const unfitCount = picList.filter(pic => pic.isUnfit).length;

  return (
    <Card>
      <Text strong>标记图片</Text>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        请标记不合格的图片（点击图片卡片进行标记）
      </Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {picList.map(pic => (
          <Col key={pic.pid} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              hoverable
              onClick={() => onPicToggle(pic.pid)}
              style={{
                border: pic.isUnfit ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                cursor: 'pointer',
              }}
            >
              {pic.url ? (
                <Image
                  src={pic.url}
                  alt={`图片 ${pic.pid}`}
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: 120, 
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text>图片 {pic.pid}</Text>
                </div>
              )}
              
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                {pic.isUnfit ? (
                  <Tag color="red" icon={<CloseCircleOutlined />}>
                    不合格
                  </Tag>
                ) : (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    合格
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Divider />
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Text>合格图片: {fitCount} 张</Text>
          <Text type="danger">不合格图片: {unfitCount} 张</Text>
        </Space>
        
        <Button 
          type="primary" 
          onClick={onNext}
          disabled={fitCount === 0}
        >
          下一步
        </Button>
      </Space>
    </Card>
  );
};

export default Step3ImageSelection; 