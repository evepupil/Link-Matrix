const fetch = require('node-fetch');

async function testEnhancedWeixinFlow() {
  console.log('🧪 开始测试增强的微信发布流程...\n');

  try {
    // 1. 测试查询图片
    console.log('1. 测试查询图片...');
    const queryParams = {
      wx_name: 'test_account',
      tags: ['萌图', '二次元'],
      unsupport_tags: [],
      limit: 6,
      popularity: 0.1
    };

    const queryResponse = await fetch('http://localhost:8000/api/v1/weixin/query-pics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryParams)
    });

    let picList = [];
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      if (queryResult.success && queryResult.data) {
        picList = queryResult.data;
        console.log(`✅ 查询成功，找到 ${picList.length} 张图片`);
        console.log('📊 图片列表:', picList.map(p => `PID: ${p.pid}`).join(', '));
      } else {
        console.log('❌ 查询失败:', queryResult.error);
        return;
      }
    } else {
      console.log('❌ 查询请求失败:', queryResponse.status);
      return;
    }

    // 2. 测试本地下载（选择前3张）
    console.log('\n2. 测试本地下载...');
    const downloadPids = picList.slice(0, 3);
    
    for (const pic of downloadPids) {
      console.log(`📥 下载图片 PID: ${pic.pid}`);
      try {
        const downloadResponse = await fetch('http://localhost:8000/api/v1/weixin/download-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid: pic.pid })
        });

        if (downloadResponse.ok) {
          const downloadResult = await downloadResponse.json();
          if (downloadResult.success) {
            console.log(`✅ PID ${pic.pid} 下载成功`);
            console.log(`📊 文件信息:`, {
              size: downloadResult.data.size,
              fileSize: `${(downloadResult.data.fileSize / 1024 / 1024).toFixed(2)}MB`,
              localPath: downloadResult.data.localPath
            });
          } else {
            console.log(`❌ PID ${pic.pid} 下载失败:`, downloadResult.error);
          }
        } else {
          console.log(`❌ PID ${pic.pid} 请求失败:`, downloadResponse.status);
        }
      } catch (error) {
        console.log(`❌ PID ${pic.pid} 下载异常:`, error.message);
      }
      
      // 延迟1秒避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. 测试检查下载状态
    console.log('\n3. 测试检查下载状态...');
    const checkPids = picList.map(p => p.pid);
    
    const statusResponse = await fetch('http://localhost:8000/api/v1/weixin/check-download-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pids: checkPids })
    });

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      if (statusResult.success) {
        console.log('✅ 状态检查成功');
        statusResult.data.forEach(item => {
          console.log(`📊 PID ${item.pid}: ${item.downloaded ? '已下载' : '未下载'} ${item.image_path ? `(${item.image_path})` : ''}`);
        });
      } else {
        console.log('❌ 状态检查失败:', statusResult.error);
      }
    } else {
      console.log('❌ 状态检查请求失败:', statusResponse.status);
    }

    // 4. 测试代理图片API（随机选择一个PID）
    console.log('\n4. 测试代理图片API...');
    if (picList.length > 0) {
      const testPid = picList[0].pid;
      const sizes = ['thumb_mini', 'small', 'regular', 'original'];
      
      for (const size of sizes) {
        try {
          const proxyUrl = `https://pixiv.chaosyn.com/api?action=proxy-image&pid=${testPid}&size=${size}`;
          console.log(`🔍 测试尺寸 ${size}: ${proxyUrl}`);
          
          const proxyResponse = await fetch(proxyUrl, { timeout: 10000 });
          
          if (proxyResponse.ok) {
            const contentType = proxyResponse.headers.get('content-type');
            const contentLength = proxyResponse.headers.get('content-length');
            console.log(`✅ 尺寸 ${size} 访问成功 - 类型: ${contentType}, 大小: ${contentLength ? `${(parseInt(contentLength) / 1024).toFixed(2)}KB` : '未知'}`);
          } else {
            console.log(`❌ 尺寸 ${size} 访问失败: ${proxyResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ 尺寸 ${size} 访问异常: ${error.message}`);
        }
        
        // 延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 5. 测试换一批功能（再次查询）
    console.log('\n5. 测试换一批功能（重新查询）...');
    const refreshResponse = await fetch('http://localhost:8000/api/v1/weixin/query-pics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryParams)
    });

    if (refreshResponse.ok) {
      const refreshResult = await refreshResponse.json();
      if (refreshResult.success && refreshResult.data) {
        const newPicList = refreshResult.data;
        console.log(`✅ 换一批成功，新找到 ${newPicList.length} 张图片`);
        console.log('📊 新图片列表:', newPicList.map(p => `PID: ${p.pid}`).join(', '));
        
        // 检查是否有新图片
        const oldPids = new Set(picList.map(p => p.pid));
        const newPids = newPicList.filter(p => !oldPids.has(p.pid));
        console.log(`🔄 其中 ${newPids.length} 张是新图片`);
      } else {
        console.log('❌ 换一批失败:', refreshResult.error);
      }
    } else {
      console.log('❌ 换一批请求失败:', refreshResponse.status);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n✅ 增强功能测试完成');
}

// 运行测试
testEnhancedWeixinFlow();