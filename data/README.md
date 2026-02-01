# Data Folder Description

## 📁 File Description

### `animeStore.json` - Your Personal Data 🔒
- This is **your local database**
- Stores your collection, favorites, watch status, etc.
- ✅ **Won't be overwritten during auto-update**
- ✅ **Won't be uploaded to GitHub** (added to .gitignore)
- You can freely modify, add, or delete data

### `animeStore.example.json` - Example Template
- This is **data structure template**
- Will be uploaded to GitHub for new users' reference
- Will be updated during auto-update (but doesn't affect your data)

---

## 🔄 Auto-Update Mechanism

When you start `start.bat`:

1. ✅ Check if there's a new version on GitHub
2. ✅ If yes, download latest code
3. ✅ Update code files (components, app, etc.)
4. ❌ **Skip data folder** - Protect your data
5. ✅ Start server

---

## 💾 Data Safety

### Data that will never be lost:
- ✅ `animeStore.json` - Your collection and favorites
- ✅ `.env.local` - Your API keys
- ✅ `launcher-config.json` - Your configuration

### Files that will be updated:
- Code files (components, app, etc.)
- package.json
- Other config files

---

## 🔧 First Time Use

If you're a new user and don't have a data file:

```bash
# Copy example file as starting point
copy animeStore.example.json animeStore.json
```

Or just run the program, it will automatically create an empty data file.

---

## 📊 Data Backup Recommendations

Although data won't be overwritten by auto-updates, regular backups are recommended:

```bash
# Manual backup
copy animeStore.json animeStore.backup.json
```

Or use Git to manage your personal data branch.
