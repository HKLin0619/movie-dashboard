const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const unzipper = require('unzipper');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Configuration - Determine correct project directory
// When packaged with pkg, use the directory where the exe is located
// When running as script, use current working directory
const PROJECT_DIR = process.pkg ? path.dirname(process.execPath) : process.cwd();
const CONFIG_FILE = path.join(PROJECT_DIR, 'launcher-config.json');

// Load configuration
async function loadConfig() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Cannot read config file, please set GitHub repo information first');
    process.exit(1);
  }
}

// Save configuration
async function saveConfig(config) {
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Get latest GitHub commit SHA
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
          reject(new Error(`GitHub API returned status ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Download and extract latest code
async function downloadLatestCode(owner, repo, targetDir) {
  return new Promise((resolve, reject) => {
    console.log('📥 Downloading latest code...');
    
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const tempZip = path.join(targetDir, 'temp-update.zip');
    const file = fs.createWriteStream(tempZip);

    https.get(zipUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('✅ Download complete, extracting...');
            
            // Extract files
            fs.createReadStream(tempZip)
              .pipe(unzipper.Extract({ path: targetDir }))
              .on('close', () => {
                // Delete temporary file
                fs.unlinkSync(tempZip);
                
                // Move files (GitHub zip includes an extra folder)
                const extractedFolder = path.join(targetDir, `${repo}-main`);
                if (fs.existsSync(extractedFolder)) {
                  // Copy files to project root
                  const files = fs.readdirSync(extractedFolder);
                  files.forEach(file => {
                    const src = path.join(extractedFolder, file);
                    const dest = path.join(targetDir, file);
                    
                    // Skip some files (avoid overwriting user data and config)
                    const skipFiles = [
                      'node_modules', 
                      '.next', 
                      '.env.local', 
                      'launcher-config.json',
                      'data' // Skip entire data folder to protect user data
                    ];
                    
                    if (skipFiles.includes(file)) {
                      return;
                    }
                    
                    // Delete old files/folders
                    if (fs.existsSync(dest)) {
                      fs.rmSync(dest, { recursive: true, force: true });
                    }
                    
                    // Move new file
                    fs.renameSync(src, dest);
                  });
                  
                  // Delete temporary folder
                  fs.rmSync(extractedFolder, { recursive: true, force: true });
                }
                
                console.log('✅ Update complete!');
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

// Check and update
async function checkAndUpdate() {
  try {
    const config = await loadConfig();
    
    if (!config.githubOwner || !config.githubRepo) {
      console.log('⚠️  GitHub repo not configured, skipping update check');
      return false;
    }

    console.log('🔍 Checking for updates...');
    
    const latestSha = await getLatestCommitSha(config.githubOwner, config.githubRepo);
    
    if (!config.currentCommitSha || config.currentCommitSha !== latestSha) {
      console.log('🎉 New version found!');
      await downloadLatestCode(config.githubOwner, config.githubRepo, PROJECT_DIR);
      
      // Update configuration
      config.currentCommitSha = latestSha;
      config.lastUpdateTime = new Date().toISOString();
      await saveConfig(config);
      
      console.log('✅ Updated to latest version');
      return true;
    } else {
      console.log('✅ Already on latest version');
      return false;
    }
  } catch (error) {
    console.error('⚠️  Update check failed:', error.message);
    console.log('Continuing with current version...');
    return false;
  }
}

// Check and install dependencies
async function checkDependencies() {
  const nodeModulesPath = path.join(PROJECT_DIR, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 First run, installing dependencies (this may take a few minutes)...');
    console.log('⚠️  Please manually run: npm install');
    console.log('Then restart the program.\n');
    
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise(resolve => process.stdin.once('data', resolve));
    process.exit(0);
  }
}

// Start Next.js server (using node command directly)
async function startServer(mode = 'production') {
  console.log(`\n🚀 Starting server (${mode} mode)...\n`);
  
  // Check if .next build directory exists
  const buildDir = path.join(PROJECT_DIR, '.next');
  
  if (mode === 'production' && !fs.existsSync(buildDir)) {
    console.log('📦 First run in production mode, need to build the project first.');
    console.log('⚠️  Please manually run: npm run build');
    console.log('Then restart the program.\n');
    
    console.log('Or modify launcher-config.json mode to "dev" to use development mode.\n');
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise(resolve => process.stdin.once('data', resolve));
    process.exit(0);
  }
  
  // 使用 node 直接启动 Next.js
  const nextBin = path.join(PROJECT_DIR, 'node_modules', '.bin', 'next.cmd');
  const nextJs = path.join(PROJECT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
  
  const args = mode === 'production' ? ['start'] : ['dev'];
  
  // Prefer using node to run next directly
  const server = spawn('node', [nextJs, ...args], {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
    windowsHide: false,
    env: { ...process.env, PORT: '3000' }
  });

  server.on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
    console.log('\nPlease make sure you have run npm install to install dependencies.');
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => process.exit(1));
  });

  // Wait for server to start
  console.log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Auto-open browser
  const url = 'http://localhost:3000';
  console.log(`\n✅ Server started: ${url}`);
  console.log('Opening browser...\n');
  
  try {
    const open = require('open');
    await open(url);
  } catch (error) {
    console.log('⚠️  Cannot auto-open browser, please visit manually:', url);
  }
  
  console.log('\nPress Ctrl+C to stop server\n');
}

// Main function
async function main() {
  console.log('===========================================');
  console.log('🎬 Movie Dashboard Launcher');
  console.log('===========================================\n');

  try {
    // 1. Check for updates
    const wasUpdated = await checkAndUpdate();
    
    // 2. If updated, check dependencies
    if (wasUpdated) {
      await checkDependencies();
    } else {
      // Even if not updated, check if dependencies exist
      await checkDependencies();
    }
    
    // 3. Start server
    const config = await loadConfig();
    await startServer(config.mode || 'production');
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    console.log('\nPress any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }
}

// Run
main();
