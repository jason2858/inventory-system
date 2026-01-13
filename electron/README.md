# Electron 打包說明

## 📦 打包成單一執行檔

這個方案使用 Electron 將 Next.js 應用打包成桌面應用程式，用戶**不需要安裝 Node.js**。

### 支援的平台

- **Windows**: `.exe` 安裝檔
- **macOS**: `.dmg` 安裝檔
- **Linux**: `.AppImage` 執行檔

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 建置 Next.js 應用

```bash
npm run build
```

### 3. 打包成執行檔

**Windows:**
```bash
npm run electron:build:win
```

**macOS:**
```bash
npm run electron:build:mac
```

**Linux:**
```bash
npm run electron:build:linux
```

**所有平台:**
```bash
npm run electron:build
```

### 4. 輸出位置

打包完成後，執行檔會在 `dist/` 資料夾中：

- Windows: `dist/物料管理系統 Setup x.x.x.exe`
- macOS: `dist/物料管理系統-x.x.x.dmg`
- Linux: `dist/物料管理系統-x.x.x.AppImage`

## 📝 開發模式

### 測試 Electron 應用（開發模式）

```bash
# 先建置 Next.js
npm run build

# 啟動 Electron（開發模式）
npm run electron:dev
```

## ⚙️ 環境變數設定

打包後的應用會自動檢查 `.env.local` 檔案。首次運行時，如果檔案不存在，會自動建立範例檔案。

用戶需要編輯 `.env.local` 檔案（與執行檔同目錄）：

```
NEXT_PUBLIC_SUPABASE_URL=您的_Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_Supabase_Key
```

## 🎨 自訂圖示

將圖示檔案放在 `electron/` 資料夾：

- Windows: `icon.ico` (256x256)
- macOS: `icon.icns` (512x512)
- Linux: `icon.png` (512x512)

## 📦 分發給用戶

1. 將打包好的執行檔（.exe / .dmg / .AppImage）分發給用戶
2. 用戶雙擊執行檔安裝/運行
3. 首次運行時，應用會檢查環境變數設定
4. 用戶需要設定 `.env.local` 檔案（與執行檔同目錄）

## ⚠️ 注意事項

1. **檔案大小**：Electron 應用會比較大（約 100-200MB），因為包含了 Chromium 瀏覽器
2. **首次啟動**：首次啟動可能需要幾秒鐘來啟動內建的 Next.js 伺服器
3. **環境變數**：用戶需要手動設定 `.env.local` 檔案
4. **資料庫**：用戶需要確保 Supabase 資料庫已初始化（執行 supabase-schema.sql）

## 🔧 進階設定

### 修改應用程式資訊

編輯 `package.json` 中的 `build` 區塊：

```json
{
  "build": {
    "appId": "com.easyinventory.app",
    "productName": "物料管理系統",
    // ... 其他設定
  }
}
```

### 自訂安裝程式

編輯 `package.json` 中的 `nsis` 區塊（Windows）或 `dmg` 區塊（macOS）。

## 🐛 疑難排解

### 問題：打包失敗

- 確保已執行 `npm run build`
- 檢查 `electron/` 資料夾是否存在
- 檢查是否有足夠的磁碟空間

### 問題：應用無法啟動

- 檢查 `.env.local` 檔案是否存在且設定正確
- 查看控制台錯誤訊息
- 確保 Supabase URL 和 Key 正確

### 問題：找不到圖示

- 確保圖示檔案在 `electron/` 資料夾中
- 檢查檔案名稱是否正確（icon.ico, icon.icns, icon.png）

