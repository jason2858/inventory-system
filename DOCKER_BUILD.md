# 打包成執行檔的幾種方案

## 方案 1：Docker 容器（最推薦）

### 優點：
- 跨平台（Windows、Mac、Linux）
- 包含所有依賴
- 易於分發和部署

### 步驟：

1. 建立 Dockerfile：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. 修改 next.config.js 啟用 standalone 輸出：

```js
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // 添加這行
}
```

3. 建置 Docker 映像：

```bash
docker build -t inventory-system .
```

4. 運行：

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  inventory-system
```

---

## 方案 2：使用 pkg（單一執行檔）

### 安裝 pkg：

```bash
npm install -g pkg
```

### 修改 package.json：

```json
{
  "pkg": {
    "scripts": "pkg-build.js",
    "assets": [
      ".next/**/*"
    ],
    "targets": [
      "node18-win-x64",
      "node18-macos-x64",
      "node18-linux-x64"
    ]
  }
}
```

### 建置：

```bash
npm run build
pkg pkg-build.js
```

**注意**：pkg 對 Next.js 支援有限，可能會有問題。

---

## 方案 3：提供安裝包（最實用）

建立一個安裝腳本，讓用戶：
1. 安裝 Node.js
2. 解壓縮檔案
3. 執行安裝腳本

### 建立 install.sh（Linux/Mac）：

```bash
#!/bin/bash
echo "安裝物料管理系統..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "錯誤：請先安裝 Node.js (https://nodejs.org/)"
    exit 1
fi

# 安裝依賴
npm install --production

# 建置
npm run build

echo "安裝完成！"
echo "請設定環境變數："
echo "  NEXT_PUBLIC_SUPABASE_URL=your_url"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
echo ""
echo "然後執行：npm start"
```

### 建立 install.bat（Windows）：

```batch
@echo off
echo 安裝物料管理系統...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤：請先安裝 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

call npm install --production
call npm run build

echo 安裝完成！
echo 請設定環境變數或建立 .env.local 檔案
echo 然後執行：npm start
pause
```

---

## 方案 4：使用 Electron（桌面應用）

如果要打包成桌面應用，可以使用 Electron。

### 安裝：

```bash
npm install --save-dev electron electron-builder
```

### 建立 electron/main.js：

```javascript
const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let mainWindow
let nextProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  // 啟動 Next.js 伺服器
  nextProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
  })

  // 等待伺服器啟動後載入
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000')
  }, 3000)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})
```

---

## 推薦方案

**對於您的使用場景，我推薦：**

1. **如果用戶有技術背景**：使用方案 3（安裝包）+ 提供詳細說明文件
2. **如果要最簡單的分發**：使用方案 1（Docker）
3. **如果要桌面應用**：使用方案 4（Electron）


