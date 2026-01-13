# 打包成 .exe 執行檔指南

## 🎯 目標

將 Next.js 應用打包成單一執行檔（.exe），用戶**不需要安裝 Node.js**，直接雙擊即可使用。

## 📦 安裝步驟

### 1. 安裝 Electron 相關依賴

```bash
npm install
```

這會自動安裝 `electron` 和 `electron-builder`。

### 2. 建置 Next.js 應用

```bash
npm run build
```

這會產生 `.next/standalone` 資料夾，包含獨立的伺服器檔案。

### 3. 打包成 .exe

**Windows:**
```bash
npm run electron:build:win
```

**所有平台（自動偵測）:**
```bash
npm run electron:build
```

## 📁 輸出位置

打包完成後，執行檔會在 `dist/` 資料夾：

- **Windows**: `dist/物料管理系統 Setup x.x.x.exe` （安裝檔）
- **macOS**: `dist/物料管理系統-x.x.x.dmg` （安裝檔）
- **Linux**: `dist/物料管理系統-x.x.x.AppImage` （可執行檔）

## 🚀 用戶使用方式

### Windows 用戶：

1. 雙擊 `物料管理系統 Setup x.x.x.exe`
2. 按照安裝精靈完成安裝
3. 從桌面或開始選單啟動應用
4. 首次運行時，應用會檢查環境變數設定
5. 如果沒有 `.env.local` 檔案，應用會自動建立範例檔案
6. 編輯 `.env.local` 檔案（在應用程式安裝目錄），填入 Supabase 資訊：
   ```
   NEXT_PUBLIC_SUPABASE_URL=您的_Supabase_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_Supabase_Key
   ```
7. 重新啟動應用程式

## ⚙️ 環境變數設定

### 方式 1：自動建立（推薦）

應用程式首次運行時會自動檢查並建立 `.env.local` 檔案。

### 方式 2：手動建立

在應用程式安裝目錄（通常是 `C:\Users\用戶名\AppData\Local\物料管理系統\`）建立 `.env.local` 檔案。

## 🔧 開發與測試

### 測試 Electron 應用（開發模式）

```bash
# 1. 先建置 Next.js
npm run build

# 2. 啟動 Electron（開發模式）
npm run electron:dev
```

### 測試打包後的應用

```bash
# 打包
npm run electron:build:win

# 測試安裝檔
# 雙擊 dist/物料管理系統 Setup x.x.x.exe
```

## 📝 自訂設定

### 修改應用程式名稱

編輯 `package.json`：

```json
{
  "build": {
    "productName": "您的應用程式名稱"
  }
}
```

### 修改應用程式圖示

1. 準備圖示檔案：
   - Windows: `electron/icon.ico` (256x256)
   - macOS: `electron/icon.icns` (512x512)
   - Linux: `electron/icon.png` (512x512)

2. 將圖示檔案放在 `electron/` 資料夾

### 修改安裝程式選項

編輯 `package.json` 中的 `nsis` 區塊（Windows）：

```json
{
  "build": {
    "nsis": {
      "oneClick": false,  // false = 允許選擇安裝目錄
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## ⚠️ 重要注意事項

### 1. 檔案大小

Electron 應用會比較大（約 100-200MB），因為包含了：
- Chromium 瀏覽器
- Node.js 運行環境
- Next.js 應用程式

### 2. 首次啟動時間

首次啟動可能需要 5-10 秒，因為需要：
- 啟動內建的 Next.js 伺服器
- 載入應用程式

### 3. 環境變數

用戶**必須**設定 `.env.local` 檔案才能連接到 Supabase。

### 4. 資料庫初始化

用戶需要確保 Supabase 資料庫已初始化（執行 `supabase-schema.sql`）。

### 5. 防火牆

如果用戶需要從其他電腦訪問，需要：
- 開放 3000 埠
- 或使用反向代理

## 🐛 疑難排解

### 問題：打包失敗

**解決方案：**
1. 確保已執行 `npm run build`
2. 檢查 `electron/` 資料夾是否存在
3. 檢查是否有足夠的磁碟空間（至少 500MB）
4. 嘗試清理後重新打包：
   ```bash
   rm -rf dist .next
   npm run build
   npm run electron:build:win
   ```

### 問題：應用無法啟動

**解決方案：**
1. 檢查 `.env.local` 檔案是否存在且設定正確
2. 查看 Windows 事件檢視器中的錯誤訊息
3. 確保 Supabase URL 和 Key 正確
4. 檢查防火牆是否阻擋了 3000 埠

### 問題：找不到圖示

**解決方案：**
1. 確保圖示檔案在 `electron/` 資料夾中
2. 檢查檔案名稱是否正確（icon.ico, icon.icns, icon.png）
3. 使用正確的圖示格式和尺寸

### 問題：應用啟動很慢

**這是正常的**，因為：
- Electron 需要啟動 Chromium
- Next.js 需要啟動伺服器
- 首次啟動可能需要 5-10 秒

## 📦 分發給用戶

### 最小分發包

只需要分發一個檔案：
- **Windows**: `物料管理系統 Setup x.x.x.exe`

### 分發步驟

1. 執行 `npm run electron:build:win`
2. 將 `dist/物料管理系統 Setup x.x.x.exe` 分發給用戶
3. 提供使用說明文件（包含 Supabase 設定步驟）

## 🎉 完成！

打包完成後，用戶就可以：
- ✅ 不需要安裝 Node.js
- ✅ 不需要安裝 npm
- ✅ 不需要執行任何命令
- ✅ 直接雙擊 .exe 安裝和使用

