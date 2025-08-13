const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api/v1';

async function testWeixinAPI() {
  console.log('🧪 开始测试微信公众号API...\n');

  try {
    // 测试查询图片API
    console.log('1. 测试查询图片API...');
    const queryResponse = await fetch(`${API_BASE}/weixin/query-pics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wx_name: 'test_weixin',
        tags: ['风景', '自然'],
        unsupport_tags: ['人物'],
        limit: 5
      })
    });

    const queryResult = await queryResponse.json();
    console.log('查询结果:', JSON.stringify(queryResult, null, 2));

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testWeixinAPI(); 