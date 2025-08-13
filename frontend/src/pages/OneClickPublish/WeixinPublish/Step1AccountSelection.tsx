import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, Space, Typography } from 'antd';
import { WechatOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface WeixinAccount {
  id: number;
  name: string;
  wx_id: string;
  illust_tag: string[][];
}

interface Step1Props {
  accounts: WeixinAccount[];
  loading: boolean;
  onNext: (values: any) => void;
}

const Step1AccountSelection: React.FC<Step1Props> = ({ accounts, loading, onNext }) => {
  const [form] = Form.useForm();
  const [selectedAccount, setSelectedAccount] = useState<WeixinAccount | null>(null);

  const handleAccountChange = (accountId: number) => {
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account || null);
  };

  const handleSubmit = (values: any) => {
    onNext(values);
  };

  return (
    <Card>
      <Text strong>选择账户和标签</Text>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        选择微信公众号API账号，设置插图标签和图片数量
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="accountId"
          label="微信公众号账户"
          rules={[{ required: true, message: '请选择微信公众号账户' }]}
        >
          <Select
            placeholder="请选择微信公众号账户"
            onChange={handleAccountChange}
            loading={loading}
          >
            {accounts.map(account => (
              <Option key={account.id} value={account.id}>
                <Space>
                  <WechatOutlined />
                  {account.name} ({account.wx_id})
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="插图标签"
          rules={[{ required: true, message: '请选择插图标签' }]}
        >
          <Select
            placeholder="请选择插图标签"
            disabled={!selectedAccount}
            mode="multiple"
            optionLabelProp="label"
          >
            {selectedAccount?.illust_tag.map((tagGroup, groupIndex) => (
              <Option key={groupIndex} value={groupIndex} label={tagGroup.join(', ')}>
                {tagGroup.join(', ')}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="picCount"
          label="图片数量"
          rules={[{ required: true, message: '请设置图片数量' }]}
        >
          <InputNumber
            min={1}
            max={50}
            placeholder="请输入图片数量"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            下一步
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Step1AccountSelection; 