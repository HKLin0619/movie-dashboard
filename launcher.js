const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const unzipper = require('unzipper');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// 配置
const CONFIG_FILE = path.join(__dirname, 'launcher-config.json');
const PROJECT_DIR = __dirname;

// 加载配置
async function loadConfig() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 无法读取配置文件，请先设置 GitHub repo 信息');
    process.exit(1);
  }
}

// 保存配置
async function saveConfig(config) {
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// 获取 GitHub 最新 commit SHA
async function getLatestCommitSha(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/commits/main`,
      method: 'GET',
      headers: {
        'User-Agent': 'Movie-Dashboard-Launcher'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const commit = JSON.parse(data);
          resolve(commit.sha);
        } else {
          reject(new Error(`GitHub API 返回 ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// 下载并解压最新代码
async function downloadLatestCode(owner, repo, targetDir) {
  return new Promise((resolve, reject) => {
    console.log('📥 正在下载最新代码...');
    
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const tempZip = path.join(targetDir, 'temp-update.zip');
    const file = fs.createWriteStream(tempZip);

    https.get(zipUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('✅ 下载完成，正在解压...');
            
            // 解压文件
            fs.createReadStream(tempZip)
              .pipe(unzipper.Extract({ path: targetDir }))
              .on('close', () => {
                // 删除临时文件
                fs.unlinkSync(tempZip);
                
                // 移动文件（GitHub zip 会包含一个额外的文件夹）
                const extractedFolder = path.join(targetDir, `${repo}-main`);
                if (fs.existsSync(extractedFolder)) {
                  // 复制文件到项目根目录
                  const files = fs.readdirSync(extractedFolder);
                  files.forEach(file => {
                    const src = path.join(extractedFolder, file);
                    const dest = path.join(targetDir, file);
                    
                    // 跳过一些文件
                    if (['node_modules', '.next', '.env.local', 'launcher-config.json'].includes(file)) {
                      return;
                    }
                    
                    // 删除旧文件/文件夹
                    if (fs.existsSync(dest)) {
                      fs.rmSync(dest, { recursive: true, force: true });
                    }
                    
                    // 移动新文件
                    fs.renameSync(src, dest);
                  });
                  
                  // 删除临时文件夹
                  fs.rmSync(extractedFolder, { recursive: true, force: true });
                }
                
                console.log('✅ 更新完成！');
                resolve();
              })
              .on('error', reject);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlinkSync(tempZip);
      reject(err);
    });
  });
}

// 检查并更新
async function checkAndUpdate() {
  try {
    const config = await loadConfig();
    
    if (!config.githubOwner || !config.githubRepo) {
      console.log('⚠️  未配置 GitHub repo，跳过更新检查');
      return false;
    }

    console.log('🔍 检查更新中...');
    
    const latestSha = await getLatestCommitSha(config.githubOwner, config.githubRepo);
    
    if (!config.currentCommitSha || config.currentCommitSha !== latestSha) {
      console.log('🎉 发现新版本！');
      await downloadLatestCode(config.githubOwner, config.githubRepo, PROJECT_DIR);
      
      // 更新配置
      config.currentCommitSha = latestSha;
      config.lastUpdateTime = new Date().toISOString();
      await saveConfig(config);
      
      console.log('✅ 已更新到最新版本');
      return true;
    } else {
      console.log('✅ 已是最新版本');
      return false;
    }
  } catch (error) {
    console.error('⚠️  更新检查失败:', error.message);
    console.log('继续使用当前版本...');
    return false;
  }
}

// 检查并安装依赖
async function checkDependencies() {
  const nodeModulesPath = path.join(PROJECT_DIR, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 首次运行，正在安装依赖（这可能需要几分钟）...');
    
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: PROJECT_DIR,
        shell: true,
        stdio: 'inherit'
      });

      npm.on('close', (code) => {
        if (code === 0) {
          console.log('✅ 依赖安装完成');
          resolve();
        } else {
          reject(new Error('依赖安装失败'));
        }
      });
    });
  }
}

// 启动 Next.js 服务器
async function startServer(mode = 'production') {
  console.log(`\n🚀 启动服务器 (${mode} 模式)...\n`);
  
  const command = mode === 'production' ? 'npm' : 'npm';
  const args = mode === 'production' ? ['run', 'build-and-start'] : ['run', 'dev'];
  
  // 如果是生产模式，先检查是否需要构建
  if (mode === 'production') {
    const buildDir = path.join(PROJECT_DIR, '.next');
    if (!fs.existsSync(buildDir)) {
      console.log('📦 首次运行，正在构建项目...');
      await new Promise((resolve, reject) => {
        const build = spawn('npm', ['run', 'build'], {
          cwd: PROJECT_DIR,
          shell: true,
          stdio: 'inherit'
        });
        build.on('close', (code) => code === 0 ? resolve() : reject());
      });
    }
  }
  
  const server = spawn(command, args, {
    cwd: PROJECT_DIR,
    shell: true,
    stdio: 'inherit'
  });

  server.on('error', (error) => {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  });

  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 自动打开浏览器
  const url = 'http://localhost:3000';
  console.log(`\n✅ 服务器已启动: ${url}`);
  console.log('正在打开浏览器...\n');
  
  const open = require('open');
  await open(url);
}

// 主函数
async function main() {
  console.log('===========================================');
  console.log('🎬 Movie Dashboard Launcher');
  console.log('===========================================\n');

  try {
    // 1. 检查更新
    const wasUpdated = await checkAndUpdate();
    
    // 2. 如果有更新，检查依赖
    if (wasUpdated) {
      await checkDependencies();
    } else {
      // 即使没更新，也检查依赖是否存在
      await checkDependencies();
    }
    
    // 3. 启动服务器
    const config = await loadConfig();
    await startServer(config.mode || 'production');
    
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    console.log('\n按任意键退出...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }
}

// 运行
main();
