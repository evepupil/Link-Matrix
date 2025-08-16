const fetch = require('node-fetch');

async function testLocalDownload() {
  console.log('🧪 开始测试本地下载功能...\n');

  try {
    // 测试本地下载单个图片
    console.log('1. 测试本地下载单个图片...');
    const pid = '123456'; // 替换为真实的PID
    
    const response = await fetch('http://localhost:8000/api/v1/weixin/download-local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pid })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('✅ 本地下载成功');
        console.log(`📊 结果:`, result.data);
      } else {
        console.log('❌ 本地下载失败:', result.error);
      }
    } else {
      console.log('❌ HTTP请求失败:', response.status);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }

    // 测试检查下载状态
    console.log('\n2. 测试检查下载状态...');
    const pids = [123456, 789012, 345678]; // 示例PID列表
    
    const statusResponse = await fetch('http://localhost:8000/api/v1/weixin/check-download-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pids })
    });

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      if (statusResult.success) {
        console.log('✅ 状态检查成功');
        console.log(`📊 状态结果:`, statusResult.data);
      } else {
        console.log('❌ 状态检查失败:', statusResult.error);
      }
    } else {
      console.log('❌ 状态检查HTTP请求失败:', statusResponse.status);
    }

    // 测试代理图片API
    console.log('\n3. 测试代理图片API...');
    const proxyResponse = await fetch(`https://pixiv.chaosyn.com/api?action=proxy-image&pid=${pid}&size=regular`);
    
    if (proxyResponse.ok) {
      console.log('✅ 代理图片API访问成功');
      console.log(`📊 响应头:`, Object.fromEntries(proxyResponse.headers.entries()));
      
      // 获取图片数据
      const imageBuffer = await proxyResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      console.log(`📏 图片大小: ${(buffer.length / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ 代理图片API访问失败:', proxyResponse.status);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n✅ 测试完成');
}

// 运行测试
testLocalDownload(); 