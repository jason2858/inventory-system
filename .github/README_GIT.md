# Git 設定指南

## 📋 .gitignore 已包含的項目

您的 `.gitignore` 已經設定好，會自動忽略以下檔案和資料夾：

### ✅ 已忽略的項目

1. **依賴套件**
   - `node_modules/` - npm 安裝的套件（很大，不需要上傳）

2. **Next.js 建置檔案**
   - `.next/` - Next.js 建置產物
   - `out/` - 靜態匯出檔案

3. **Electron 打包檔案**
   - `dist/` - Electron 打包產物（.exe, .dmg, .AppImage）
   - `*.blockmap` - Electron 更新檔案

4. **環境變數檔案**
   - `.env` - 環境變數（包含敏感資訊）
   - `.env*.local` - 本地環境變數

5. **系統檔案**
   - `.DS_Store` - macOS 系統檔案
   - `Thumbs.db` - Windows 縮圖快取
   - `Desktop.ini` - Windows 資料夾設定

6. **IDE 設定**
   - `.vscode/` - VS Code 設定
   - `.idea/` - IntelliJ IDEA 設定
   - `*.sublime-project` - Sublime Text 設定

7. **日誌檔案**
   - `*.log` - 各種日誌檔案
   - `npm-debug.log*` - npm 除錯日誌

8. **快取和暫存檔案**
   - `.cache/` - 快取資料夾
   - `*.tmp` - 暫存檔案

## 🚀 上傳到 GitHub 的步驟

### 1. 初始化 Git（如果還沒初始化）

```bash
git init
```

### 2. 檢查哪些檔案會被上傳

```bash
git status
```

### 3. 添加檔案到 Git

```bash
# 添加所有檔案（.gitignore 會自動過濾）
git add .

# 或手動添加特定檔案
git add package.json
git add src/
git add README.md
# ... 等等
```

### 4. 提交

```bash
git commit -m "Initial commit: 物料管理系統"
```

### 5. 連接到 GitHub

```bash
# 在 GitHub 建立新 repository 後
git remote add origin https://github.com/您的用戶名/專案名稱.git
git branch -M main
git push -u origin main
```

## ⚠️ 重要提醒

### 不要上傳的檔案

以下檔案**絕對不要**上傳到 GitHub：

1. **環境變數檔案**
   - `.env`
   - `.env.local`
   - `.env.production.local`
   - 這些檔案包含 Supabase 的敏感資訊

2. **建置產物**
   - `.next/` 資料夾
   - `dist/` 資料夾
   - `node_modules/` 資料夾

3. **敏感資訊**
   - Supabase URL 和 Key
   - API 金鑰
   - 資料庫密碼

### 應該上傳的檔案

✅ **應該上傳**：

1. **原始碼**
   - `src/` 資料夾
   - `electron/` 資料夾（原始碼）

2. **設定檔案**
   - `package.json`
   - `next.config.js`
   - `tsconfig.json`
   - `tailwind.config.ts`
   - `postcss.config.js`

3. **SQL 腳本**
   - `supabase-schema.sql`
   - `insert-materials.sql`

4. **文件**
   - `README.md`
   - `BUILD_EXE.md`
   - `README_DEPLOYMENT.md`
   - `electron/README.md`

5. **範例檔案**
   - `env.example` - 環境變數範例（不包含真實值）

6. **其他**
   - `.gitignore`
   - `Dockerfile`
   - `install.sh`
   - `install.bat`

## 🔒 安全檢查清單

在上傳前，請確認：

- [ ] `.env` 檔案不在 Git 中
- [ ] `.env.local` 檔案不在 Git 中
- [ ] `node_modules/` 不在 Git 中
- [ ] `.next/` 不在 Git 中
- [ ] `dist/` 不在 Git 中
- [ ] 沒有硬編碼的 API 金鑰
- [ ] `env.example` 已上傳（作為範例）

## 📝 建議的 README.md 內容

在 GitHub 上，建議在 README.md 中包含：

1. 專案說明
2. 安裝步驟
3. 環境變數設定說明（使用 `env.example`）
4. 使用方式
5. 建置和打包說明

範例：

```markdown
# 物料管理系統

## 環境變數設定

複製 `env.example` 為 `.env.local` 並填入您的 Supabase 資訊：

```bash
cp env.example .env.local
```

然後編輯 `.env.local` 填入：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```
```

## ✅ 確認清單

執行以下命令確認沒有遺漏敏感檔案：

```bash
# 檢查是否有 .env 檔案
git ls-files | grep -E "\.env$|\.env\."

# 檢查是否有 node_modules
git ls-files | grep node_modules

# 檢查是否有 .next
git ls-files | grep "\.next"

# 檢查是否有 dist
git ls-files | grep "^dist"
```

如果以上命令都沒有輸出，表示設定正確！

