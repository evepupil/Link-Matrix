const fetch = require('node-fetch');

async function testWeixinPublishReal() {
  console.log('🧪 开始测试真实微信公众号发布功能...\n');

  try {
    // 1. 测试查询图片
    console.log('1. 测试查询图片...');
    const queryParams = {
      wx_name: 'ACG_otaku_',
      tags: ['萌图'],
      unsupport_tags: [],
      limit: 3,
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

    if (picList.length === 0) {
      console.log('❌ 没有找到符合条件的图片');
      return;
    }

    // 2. 本地下载图片
    console.log('\n2. 本地下载图片...');
    const downloadPromises = picList.map(async (pic) => {
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
            return pic.pid;
          } else {
            console.log(`❌ PID ${pic.pid} 下载失败:`, downloadResult.error);
            return null;
          }
        } else {
          console.log(`❌ PID ${pic.pid} 请求失败:`, downloadResponse.status);
          return null;
        }
      } catch (error) {
        console.log(`❌ PID ${pic.pid} 下载异常:`, error.message);
        return null;
      }
    });

    const downloadedPids = (await Promise.all(downloadPromises)).filter(pid => pid !== null);
    console.log(`📊 成功下载 ${downloadedPids.length} 张图片`);

    if (downloadedPids.length === 0) {
      console.log('❌ 没有成功下载的图片');
      return;
    }

    // 3. 测试直接发布到微信（模拟）
    console.log('\n3. 测试发布到微信公众号...');
    
    // 注意：这里使用真实的微信账户ID，请确保数据库中存在该账户
    const publishData = {
      account_id: 1, // 请根据你的数据库调整这个ID
      pids: downloadedPids,
      unfit_pids: [] // 假设没有不合格图片
    };

    console.log('📤 发布参数:', publishData);
    console.log('⚠️  注意：这将使用真实的微信API！请确保配置正确。');
    
    // 如果你想测试真实发布，取消下面的注释
    /*
    const publishResponse = await fetch('http://localhost:8000/api/v1/weixin/publish-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishData)
    });

    if (publishResponse.ok) {
      const publishResult = await publishResponse.json();
      if (publishResult.success) {
        console.log('✅ 发布成功！');
        console.log('📊 结果:', publishResult.data);
      } else {
        console.log('❌ 发布失败:', publishResult.error);
      }
    } else {
      console.log('❌ 发布请求失败:', publishResponse.status);
      const errorText = await publishResponse.text();
      console.log('错误详情:', errorText);
    }
    */

    // 4. 测试任务队列发布
    console.log('\n4. 测试任务队列发布...');
    const taskResponse = await fetch('http://localhost:8000/api/v1/weixin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishData)
    });

    if (taskResponse.ok) {
      const taskResult = await taskResponse.json();
      if (taskResult.success && taskResult.data.task_id) {
        const taskId = taskResult.data.task_id;
        console.log(`✅ 发布任务创建成功，任务ID: ${taskId}`);
        
        // 监控任务进度
        console.log('📊 监控任务进度...');
        let completed = false;
        let attempts = 0;
        const maxAttempts = 30; // 最多检查30次
        
        while (!completed && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
          
          try {
            const progressResponse = await fetch(`http://localhost:8000/api/v1/weixin/publish-progress/${taskId}`);
            
            if (progressResponse.ok) {
              const progressResult = await progressResponse.json();
              if (progressResult.success) {
                const { progress, status, result } = progressResult.data;
                console.log(`📈 进度: ${progress}%, 状态: ${status}`);
                
                if (status === 'completed') {
                  console.log('🎉 发布完成！');
                  console.log('📊 结果:', result);
                  completed = true;
                } else if (status === 'failed') {
                  console.log('❌ 发布失败:', result?.error || '未知错误');
                  completed = true;
                }
              }
            }
          } catch (error) {
            console.error('❌ 获取进度失败:', error.message);
          }
          
          attempts++;
        }
        
        if (!completed) {
          console.log('⚠️ 任务超时或未完成');
        }
      } else {
        console.log('❌ 创建发布任务失败:', taskResult.error);
      }
    } else {
      console.log('❌ 发布任务请求失败:', taskResponse.status);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n✅ 微信发布功能测试完成');
}

// 运行测试
testWeixinPublishReal();