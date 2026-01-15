# GCP 快速啟動指南

本指南說明如何在 GCP VM 上快速啟動服務，並通過 IP:3000 訪問。

## 🚀 快速步驟

### 1. SSH 連接到 GCP VM

```bash
gcloud compute ssh INSTANCE_NAME --zone=ZONE
```

### 2. Clone 代碼

```bash
cd ~
git clone https://github.com/your-username/inventory-system.git
cd inventory-system
```

### 3. 設置環境（只需執行一次）

```bash
sudo chmod +x setup-gcp-simple.sh
sudo ./setup-gcp-simple.sh
```

這會安裝：
- Node.js 20.x
- PM2（進程管理器）
- 必要的系統套件

**重要**：執行完後，請執行腳本最後顯示的 `pm2 startup` 命令，這樣服務才能在 SSH 關閉後繼續運行。

### 4. 設置環境變數

```bash
nano .env.production
```

填入您的 Supabase 設定：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

### 5. 安裝依賴並建置

**重要**：Next.js 建置需要 TypeScript 和 TailwindCSS，但不需要 Electron。我們只安裝必要的建置工具。

```bash
# 方法 1: 使用安裝腳本（推薦）
chmod +x install-build-deps.sh
./install-build-deps.sh

# 方法 2: 手動安裝
# 先安裝生產環境依賴
NODE_OPTIONS="--max-old-space-size=512" npm install --production

# 然後只安裝建置必需的開發依賴（不包括 Electron）
NODE_OPTIONS="--max-old-space-size=512" npm install --save-dev \
  typescript@^5.3.0 \
  @types/node@^20.11.0 \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  tailwindcss@^3.4.0 \
  postcss@^8.4.0 \
  autoprefixer@^10.4.0 \
  eslint@^8.56.0 \
  eslint-config-next@^14.2.0

# 建置應用（也限制記憶體）
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

**說明**：
- **生產依賴**：next, react, react-dom, @supabase/supabase-js（運行時需要）
- **建置工具**：typescript, tailwindcss, postcss, autoprefixer（建置時需要）
- **類型定義**：@types/node, @types/react, @types/react-dom（TypeScript 需要）
- **不安裝**：electron, electron-builder（桌面應用，GCP 不需要）
- `NODE_OPTIONS="--max-old-space-size=512"` 限制記憶體使用為 512MB

### 6. 設置防火牆規則（允許 3000 端口）

```bash
# 在 GCP Console 中設置，或使用 gcloud 命令：
gcloud compute firewall-rules create allow-inventory-system \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow inventory system on port 3000"
```

### 7. 啟動服務

```bash
chmod +x start-service.sh stop-service.sh
./start-service.sh
```

服務現在會在後台運行，即使關閉 SSH 也會繼續運行！

**記憶體限制**：服務已配置為最多使用 512MB 記憶體。如果超過此限制，PM2 會自動重啟服務。

### 8. 取得 GCP VM 的外部 IP

```bash
# 方法 1: 使用 gcloud 命令
gcloud compute instances describe INSTANCE_NAME \
  --zone=ZONE \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 方法 2: 在 GCP Console 中查看
# Compute Engine > VM instances > 查看外部 IP
```

### 9. 測試訪問

在瀏覽器中訪問：
```
http://YOUR_GCP_EXTERNAL_IP:3000
```

## 📝 常用命令

### 查看服務狀態

```bash
pm2 status
```

### 查看日誌

```bash
# 查看所有日誌
pm2 logs inventory-system

# 查看最近 100 行
pm2 logs inventory-system --lines 100

# 即時查看日誌
pm2 logs inventory-system --lines 0
```

### 重啟服務

```bash
pm2 restart inventory-system
```

### 停止服務

```bash
./stop-service.sh
```

### 重新啟動服務

```bash
./stop-service.sh
./start-service.sh
```

## 🔒 確保服務在 SSH 關閉後繼續運行

### 方法 1：使用 PM2（推薦，已自動設置）

PM2 會自動管理進程，即使 SSH 關閉也會繼續運行。

**確保開機自動啟動：**

```bash
# 執行 PM2 的 startup 命令（setup-gcp-simple.sh 會顯示）
pm2 startup systemd -u YOUR_USERNAME --hp /home/YOUR_USERNAME

# 保存當前運行列表
pm2 save
```

### 方法 2：使用 nohup（不推薦，但簡單）

如果您不想使用 PM2，可以使用 nohup：

```bash
nohup npm start > logs/app.log 2>&1 &
```

但建議使用 PM2，因為它提供更好的進程管理。

## 🔍 診斷服務

如果遇到問題，可以使用診斷腳本：

```bash
chmod +x check-service.sh
./check-service.sh
```

這會檢查：
- 服務狀態
- 環境變數設定
- 端口監聽
- 本地訪問
- 日誌資訊

## 🐛 故障排除

### 問題：無法訪問 IP:3000

**檢查清單：**

1. **確認服務正在運行**
   ```bash
   pm2 status
   ```

2. **確認端口監聽**
   ```bash
   sudo netstat -tlnp | grep 3000
   # 或
   sudo ss -tlnp | grep 3000
   ```

3. **檢查 GCP 防火牆規則**
   ```bash
   gcloud compute firewall-rules list
   ```
   
   確保有規則允許 tcp:3000

4. **檢查 VM 的防火牆（如果有的話）**
   ```bash
   # Ubuntu/Debian
   sudo ufw status
   sudo ufw allow 3000/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --list-ports
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --reload
   ```

5. **測試本地訪問**
   ```bash
   curl http://localhost:3000
   ```

### 問題：SSH 關閉後服務停止

**解決方案：**

1. **確保 PM2 startup 已設置**
   ```bash
   pm2 startup
   # 執行顯示的命令
   pm2 save
   ```

2. **檢查服務狀態**
   ```bash
   pm2 status
   pm2 logs inventory-system
   ```

### 問題：端口被占用

**解決方案：**

```bash
# 查看占用端口的進程
sudo lsof -i :3000
# 或
sudo netstat -tlnp | grep 3000

# 停止占用端口的進程
sudo kill -9 PID
```

### 問題：環境變數未載入

**解決方案：**

確保 `.env.production` 檔案存在且格式正確：
```bash
cat .env.production
```

如果使用 standalone 模式，環境變數需要在啟動時傳遞：
```bash
# PM2 會自動從 .env.production 載入
# 或手動指定：
pm2 start .next/standalone/server.js --name inventory-system --update-env
```

### 問題：畫面顯示異常或沒有資料

**解決方案：**

1. **檢查環境變數**
   ```bash
   cat .env.production
   # 確認 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 已正確設定
   ```

2. **使用診斷腳本**
   ```bash
   ./check-service.sh
   ```

3. **檢查瀏覽器控制台（F12）**
   - 查看 Console 是否有錯誤
   - 查看 Network 標籤，確認資源和 API 請求是否正常

4. **檢查 Supabase 連接**
   - 確認 Supabase URL 和 Key 正確
   - 確認 Supabase 資料庫中有資料
   - 檢查 Supabase Dashboard 中的 API 設定

5. **重新建置（如果 CSS 樣式異常）**
   ```bash
   rm -rf .next
   NODE_OPTIONS="--max-old-space-size=512" npm run build
   pm2 restart inventory-system
   ```

詳細故障排除請參考 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 問題：記憶體使用過高

**解決方案：**

服務已配置為在超過 512MB 時自動重啟。如果頻繁重啟，可以：

1. **檢查記憶體使用**
   ```bash
   pm2 monit
   pm2 show inventory-system
   ```

2. **增加記憶體限制（如果 VM 有足夠記憶體）**
   ```bash
   pm2 restart inventory-system --update-env --max-memory-restart 1G
   pm2 save
   ```

3. **升級 VM 規格**
   - 在 GCP Console 中停止 VM
   - 更改機器類型為更大的規格
   - 重新啟動 VM

## 📊 監控服務

### 查看資源使用

```bash
pm2 monit
```

### 查看詳細資訊

```bash
pm2 show inventory-system
```

### 查看進程資訊

```bash
ps aux | grep node
```

## 💾 資源限制

### 記憶體限制

服務已配置為最多使用 **512MB 記憶體**。如果超過此限制，PM2 會自動重啟服務以防止記憶體溢出。

**查看記憶體使用：**
```bash
pm2 monit
# 或
pm2 show inventory-system
```

### VM 規格建議

建議使用至少 **1GB RAM** 的 VM 實例，以確保有足夠的記憶體運行服務和系統。

**GCP VM 規格建議：**
- **最小配置**：1 vCPU, 1GB RAM（e2-micro）
- **推薦配置**：1 vCPU, 2GB RAM（e2-small）

## ✅ 檢查清單

部署前：
- [ ] 已 SSH 連接到 GCP VM
- [ ] 已 clone 代碼
- [ ] 已執行 `setup-gcp-simple.sh`
- [ ] 已設置環境變數 `.env.production`
- [ ] 已執行 `npm install --production` 和 `npm run build`

啟動服務：
- [ ] 已設置 GCP 防火牆規則（允許 3000 端口）
- [ ] 已執行 `./start-service.sh`
- [ ] `pm2 status` 顯示服務運行中
- [ ] 已取得 GCP VM 外部 IP

測試：
- [ ] 可以通過 `http://IP:3000` 訪問
- [ ] SSH 關閉後服務繼續運行
- [ ] 可以通過 `./stop-service.sh` 停止服務

## 🎉 完成！

現在您的服務已經：
- ✅ 在 GCP VM 上運行
- ✅ 可以通過 IP:3000 訪問
- ✅ SSH 關閉後繼續運行
- ✅ 可以使用 PM2 管理
- ✅ 記憶體限制為 512MB（自動重啟保護）
- ✅ 僅安裝生產環境依賴（節省空間）

