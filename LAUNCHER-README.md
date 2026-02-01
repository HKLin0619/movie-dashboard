# Movie Dashboard - Desktop Application

## 📦 Created Files

- ✅ `launcher.js` - Launcher script (auto-update + server start)
- ✅ `launcher-config.json` - Configuration file
- ✅ `.gitignore` - Updated (excludes exe and config files)
- ✅ `package.json` - Added packaging dependencies

---

## 🚀 Usage Flow

### Step 1: Upload to GitHub

1. **Create GitHub Public Repo**
   - Go to https://github.com/new
   - Name it `movie-dashboard`
   - Select **Public**
   - Do not check "Add README" or ".gitignore" (we already have them)

2. **Push Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/movie-dashboard.git
   git push -u origin main
   ```

3. **Update Config File**
   Edit `launcher-config.json`, change `YOUR_GITHUB_USERNAME` to your GitHub username:
   ```json
   {
     "githubOwner": "YourGitHubUsername",
     "githubRepo": "movie-dashboard",
     ...
   }
   ```

---

### Step 2: Install Dependencies and Package

```bash
# Install new dependencies
npm install

# Test launcher (ensure it runs properly)
node launcher.js

# Package as exe
npm run package-exe
```

After packaging, `movie-dashboard.exe` will be generated.

---

### Step 3: Distribution and Usage

**File structure for users:**
```
movie-dashboard/
  ├── movie-dashboard.exe    (Launcher)
  ├── launcher-config.json   (Config file, needs your GitHub username)
  ├── .env.local            (If you have API keys)
  └── Other project files...
```

**User usage:**
1. Double-click `movie-dashboard.exe`
2. First run will automatically download latest code and install dependencies
3. Browser opens automatically with the website

---

## 🔄 Update Flow

**You (developer):**
1. Modify code
2. `git push` to GitHub
3. Done! ✅

**User:**
1. Double-click start.bat (or exe)
2. Automatically detects and downloads updates
3. Done! ✅

**⚠️ Important: User Data Protection**
- ✅ `data/animeStore.json` - User collection data **will never be overwritten**
- ✅ `.env.local` - API keys **will never be overwritten**
- ✅ `launcher-config.json` - Configuration **will never be overwritten**
- ✅ `node_modules/` - Dependencies **will never be overwritten**

Only code files (components, app, etc.) will be updated.

---

## ⚙️ Configuration

### launcher-config.json

```json
{
  "githubOwner": "YourGitHubUsername",  // Must be modified
  "githubRepo": "movie-dashboard",      // Repo name
  "mode": "production",                 // production or dev
  "autoUpdate": true                    // Whether to auto-update
}
```

---

## 🔒 Security Tips

### ✅ Protected (won't be uploaded to GitHub):
- `.env.local` - API keys
- `launcher-config.json` - Config file (may differ per user)
- `*.exe` - Packaged executable
- `node_modules/` - Dependencies
- `.next/` - Build files

### ⚠️ API Keys Management:
Create `.env.local` file to store sensitive information:
```
API_KEY=your_secret_key
ANOTHER_KEY=another_secret
```

When distributing to users, provide `.env.local` separately (or let them configure it).

---

## 🐛 Common Issues

### Update Failed?
The launcher will automatically fallback to current version without affecting usage.

### How to Disable Auto-Update?
Modify `launcher-config.json`:
```json
{
  "autoUpdate": false
}
```

### How to Manually Update?
Delete `currentCommitSha` from config file, next startup will re-download.

---

## 📝 Development Mode

If you want to run in development mode (supports hot reload):
```json
{
  "mode": "dev"
}
```

---

Need help? Check GitHub Issues or contact the developer.
