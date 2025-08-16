const fetch = require('node-fetch');

async function testAuthorNameDownload() {
  console.log('🧪 开始测试作者名称和新的文件命名格式...\n');

  try {
    // 1. 测试查询图片（包含author_name字段）
    console.log('1. 测试查询图片（包含author_name字段）...');
    const queryParams = {
      wx_name: 'test_account',
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
        
        // 显示每张图片的详细信息
        picList.forEach((pic, index) => {
          console.log(`📊 图片 ${index + 1}:`);
          console.log(`   PID: ${pic.pid}`);
          console.log(`   作者: ${pic.author_name || '未知'}`);
          console.log(`   标签: ${pic.tag || '无'}`);
          console.log(`   热度: ${pic.popularity || '无'}`);
          console.log(`   图片路径: ${pic.image_path || '无'}`);
          console.log('   ---');
        });
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

    // 2. 测试本地下载（验证新的文件命名格式）
    console.log('\n2. 测试本地下载（验证新的文件命名格式）...');
    
    for (const pic of picList) {
      try {
        console.log(`📥 开始下载图片 PID: ${pic.pid} (作者: ${pic.author_name || '未知'})`);
        
        const downloadResponse = await fetch('http://localhost:8000/api/v1/weixin/download-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid: pic.pid })
        });

        if (downloadResponse.ok) {
          const downloadResult = await downloadResult.json();
          if (downloadResult.success) {
            console.log(`✅ PID ${pic.pid} 下载成功`);
            console.log(`📊 文件信息:`, {
              localPath: downloadResult.data.localPath,
              size: downloadResult.data.size,
              fileSize: `${(downloadResult.data.fileSize / 1024 / 1024).toFixed(2)}MB`
            });
            
            // 检查文件名是否包含作者名称
            const fileName = downloadResult.data.localPath.split('/').pop();
            if (fileName.includes('@') && fileName.includes('pid_')) {
              console.log(`✅ 文件名格式正确: ${fileName}`);
            } else {
              console.log(`⚠️ 文件名格式可能不正确: ${fileName}`);
            }
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

    // 3. 检查本地文件
    console.log('\n3. 检查本地文件...');
    try {
      const fs = require('fs');
      const path = require('path');
      
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        console.log(`📁 临时目录 ${tmpDir} 中的文件:`);
        
        files.forEach(file => {
          if (file.includes('pid_')) {
            console.log(`   📄 ${file}`);
            
            // 分析文件名格式
            if (file.includes('@')) {
              const match = file.match(/@(.+?) pid_(\d+)\.jpg/);
              if (match) {
                const authorName = match[1];
                const pid = match[2];
                console.log(`      ✅ 格式正确 - 作者: ${authorName}, PID: ${pid}`);
              } else {
                console.log(`      ⚠️ 格式可能不正确`);
              }
            } else {
              console.log(`      ℹ️ 旧格式文件名`);
            }
          }
        });
      } else {
        console.log('❌ 临时目录不存在');
      }
    } catch (error) {
      console.log('❌ 检查本地文件失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }

  console.log('\n✅ 作者名称和文件命名格式测试完成');
}

// 运行测试
testAuthorNameDownload(); 