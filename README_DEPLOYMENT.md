# 部署與分發指南

## 📦 `npm run build` 產生的檔案

執行 `npm run build` 後會產生：

```
.next/
├── static/          # 靜態資源（CSS、JS、圖片等）
├── server/          # 伺服器端程式碼
├── cache/           # 快取檔案
└── BUILD_ID         # 建置 ID
```

**重要**：建置後的應用仍需要：
- Node.js 運行環境
- `node_modules/` 資料夾（或使用 standalone 模式）
- 環境變數設定

## 🚀 分發方案

### 方案 1：Docker（最推薦）

**優點**：跨平台、包含所有依賴、易於部署

**步驟**：

1. 建置 Docker 映像：
```bash
docker build -t inventory-system .
```

2. 運行容器：
```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  --name inventory-system \
  inventory-system
```

3. 分發：將 Docker 映像匯出為 tar 檔案
```bash
docker save inventory-system -o inventory-system.tar
```

### 方案 2：安裝腳本（最實用）

**優點**：簡單、用戶只需安裝 Node.js

**使用方式**：

1. **Linux/Mac 用戶**：
```bash
chmod +x install.sh
./install.sh
```

2. **Windows 用戶**：
```cmd
install.bat
```

3. 設定環境變數（建立 `.env.local`）：
```
NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_Key
```

4. 啟動：
```bash
npm start
```

### 方案 3：壓縮包分發

1. 建置應用：
```bash
npm run build
```

2. 建立分發包（排除不需要的檔案）：
```bash
# 建立 .distignore 或手動選擇檔案
tar -czf inventory-system.tar.gz \
  --exclude='node_modules' \
  --exclude='.next/cache' \
  --exclude='.git' \
  package.json \
  package-lock.json \
  .next \
  public \
  src \
  next.config.js \
  tsconfig.json \
  tailwind.config.ts \
  postcss.config.js \
  install.sh \
  install.bat \
  README.md
```

3. 用戶收到後：
   - 解壓縮
   - 執行 `npm install --production`
   - 執行 `npm start`

## 📋 分發檢查清單

- [ ] 執行 `npm run build` 確保建置成功
- [ ] 測試 `npm start` 確保應用正常運行
- [ ] 準備環境變數說明文件
- [ ] 準備 Supabase 設定說明
- [ ] 準備安裝說明文件
- [ ] 測試安裝腳本（install.sh / install.bat）
- [ ] 準備使用者手冊

## 🔧 環境變數設定

用戶需要設定以下環境變數：

**方式 1：建立 `.env.local` 檔案**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**方式 2：系統環境變數**
```bash
# Linux/Mac
export NEXT_PUBLIC_SUPABASE_URL=your_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Windows
set NEXT_PUBLIC_SUPABASE_URL=your_url
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## ⚠️ 注意事項

1. **Supabase 連線**：確保用戶有 Supabase 專案的 URL 和 Key
2. **資料庫初始化**：用戶需要執行 `supabase-schema.sql` 初始化資料庫
3. **Node.js 版本**：建議使用 Node.js 18 或以上
4. **防火牆**：如果用戶需要從其他電腦訪問，需要開放 3000 埠


