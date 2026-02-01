# Movie Dashboard - 桌面应用版

## 📦 已创建的文件

- ✅ `launcher.js` - 启动器脚本（自动更新 + 启动服务器）
- ✅ `launcher-config.json` - 配置文件
- ✅ `.gitignore` - 已更新（排除 exe 和配置文件）
- ✅ `package.json` - 已添加打包依赖

---

## 🚀 使用流程

### 第一步：上传到 GitHub

1. **创建 GitHub Public Repo**
   - 去 https://github.com/new
   - 命名为 `movie-dashboard`
   - 选择 **Public**
   - 不要勾选 "Add README" 或 ".gitignore"（我们已经有了）

2. **推送代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/movie-dashboard.git
   git push -u origin main
   ```

3. **更新配置文件**
   编辑 `launcher-config.json`，把 `YOUR_GITHUB_USERNAME` 改成你的 GitHub 用户名：
   ```json
   {
     "githubOwner": "你的GitHub用户名",
     "githubRepo": "movie-dashboard",
     ...
   }
   ```

---

### 第二步：安装依赖并打包

```bash
# 安装新的依赖
npm install

# 测试启动器（确保能正常运行）
node launcher.js

# 打包成 exe
npm run package-exe
```

打包完成后会生成 `movie-dashboard.exe` 文件。

---

### 第三步：分发使用

**给用户的文件结构：**
```
movie-dashboard/
  ├── movie-dashboard.exe    (启动器)
  ├── launcher-config.json   (配置文件，需要更新你的GitHub用户名)
  ├── .env.local            (如果有API keys)
  └── 其他项目文件...
```

**用户使用：**
1. 双击 `movie-dashboard.exe`
2. 首次运行会自动下载最新代码并安装依赖
3. 自动打开浏览器显示网站

---

## 🔄 更新流程

**你（开发者）：**
1. 修改代码
2. `git push` 到 GitHub
3. 完成！✅

**用户：**
1. 双击 exe
2. 自动检测并下载更新
3. 完成！✅

---

## ⚙️ 配置说明

### launcher-config.json

```json
{
  "githubOwner": "你的GitHub用户名",  // 必须修改
  "githubRepo": "movie-dashboard",    // repo 名称
  "mode": "production",               // production 或 dev
  "autoUpdate": true                  // 是否自动更新
}
```

---

## 🔒 安全提示

### ✅ 已保护（不会上传到 GitHub）：
- `.env.local` - API keys
- `launcher-config.json` - 配置文件（每个用户可能不同）
- `*.exe` - 打包的可执行文件
- `node_modules/` - 依赖包
- `.next/` - 构建文件

### ⚠️ API Keys 管理：
创建 `.env.local` 文件存储敏感信息：
```
API_KEY=你的密钥
ANOTHER_KEY=另一个密钥
```

分发给用户时，需要单独提供 `.env.local` 文件（或让他们自己配置）。

---

## 🐛 常见问题

### 更新失败怎么办？
启动器会自动回退到当前版本，不影响使用。

### 如何禁用自动更新？
修改 `launcher-config.json`：
```json
{
  "autoUpdate": false
}
```

### 如何手动更新？
删除配置文件里的 `currentCommitSha`，下次启动会重新下载。

---

## 📝 开发模式

如果想在开发模式运行（支持热重载）：
```json
{
  "mode": "dev"
}
```

---

需要帮助？检查 GitHub Issues 或联系开发者。
