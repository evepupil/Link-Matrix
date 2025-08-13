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

    if (queryResult.success && queryResult.data && queryResult.data.length > 0) {
      const pids = queryResult.data.map(pic => pic.pid);
      
      // 测试下载图片API
      console.log('\n2. 测试下载图片API...');
      const downloadResponse = await fetch(`${API_BASE}/weixin/download-pics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pids: pids.slice(0, 3) // 只下载前3张
        })
      });

      const downloadResult = await downloadResponse.json();
      console.log('下载任务创建结果:', JSON.stringify(downloadResult, null, 2));

      if (downloadResult.success && downloadResult.data?.task_id) {
        const taskId = downloadResult.data.task_id;
        
        // 测试获取下载进度
        console.log('\n3. 测试获取下载进度...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
        
        const progressResponse = await fetch(`${API_BASE}/weixin/download-progress/${taskId}`);
        const progressResult = await progressResponse.json();
        console.log('下载进度:', JSON.stringify(progressResult, null, 2));
      }
    }

    // 测试发布API
    console.log('\n4. 测试发布API...');
    const publishResponse = await fetch(`${API_BASE}/weixin/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: 1,
        pids: [1, 2, 3],
        unfit_pids: [3]
      })
    });

    const publishResult = await publishResponse.json();
    console.log('发布任务创建结果:', JSON.stringify(publishResult, null, 2));

    if (publishResult.success && publishResult.data?.task_id) {
      const taskId = publishResult.data.task_id;
      
      // 测试获取发布进度
      console.log('\n5. 测试获取发布进度...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      
      const progressResponse = await fetch(`${API_BASE}/weixin/publish-progress/${taskId}`);
      const progressResult = await progressResponse.json();
      console.log('发布进度:', JSON.stringify(progressResult, null, 2));
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testWeixinAPI(); 