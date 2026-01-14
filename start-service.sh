#!/bin/bash

# 啟動服務腳本
# 使用方法: ./start-service.sh

set -e

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 獲取腳本所在目錄
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 檢查環境變數檔案
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    echo_warn "環境變數檔案不存在，創建範本..."
    cat > $ENV_FILE << EOF
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
EOF
    echo_error "請先編輯 $ENV_FILE 並設定您的 Supabase 環境變數"
    exit 1
fi

# 載入環境變數
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# 檢查必要的環境變數
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your-supabase-url" ]; then
    echo_error "請在 $ENV_FILE 中設定 NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your-supabase-anon-key" ]; then
    echo_error "請在 $ENV_FILE 中設定 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo_error "Node.js 未安裝，請先執行: sudo ./setup-gcp-simple.sh"
    exit 1
fi

# 檢查 PM2
if ! command -v pm2 &> /dev/null; then
    echo_error "PM2 未安裝，請先執行: sudo ./setup-gcp-simple.sh"
    exit 1
fi

# 檢查依賴
if [ ! -d "node_modules" ]; then
    echo_info "安裝依賴（僅生產環境，記憶體限制 512MB）..."
    NODE_OPTIONS="--max-old-space-size=512" npm install --production
fi

# 檢查是否需要建置
if [ ! -d ".next" ]; then
    echo_info "建置應用（記憶體限制 512MB）..."
    NODE_OPTIONS="--max-old-space-size=512" npm run build
fi

# 檢查是否已經運行
if pm2 list | grep -q "inventory-system"; then
    echo_warn "服務已經在運行中"
    echo_info "如果要重啟，請執行: ./stop-service.sh 然後再次執行此腳本"
    pm2 status
    exit 0
fi

# 創建日誌目錄
mkdir -p logs

# 啟動服務
echo_info "啟動服務..."

# 檢查是否有 standalone 模式
if [ -f ".next/standalone/server.js" ]; then
    echo_info "使用 standalone 模式啟動..."
    pm2 start .next/standalone/server.js \
        --name "inventory-system" \
        --env production \
        --update-env \
        --max-memory-restart 512M \
        --log logs/pm2-out.log \
        --error logs/pm2-error.log \
        --merge-logs \
        --time
else
    echo_info "使用 next start 模式啟動..."
    pm2 start npm --name "inventory-system" -- start \
        --max-memory-restart 512M \
        --log logs/pm2-out.log \
        --error logs/pm2-error.log \
        --merge-logs \
        --time
fi

# 保存 PM2 配置
pm2 save

# 顯示狀態
echo_info ""
echo_info "✅ 服務已啟動！"
echo_info ""
pm2 status
echo_info ""
echo_info "服務資訊："
echo_info "  - 本地訪問: http://localhost:3000"
echo_info "  - 外部訪問: http://YOUR_GCP_IP:3000"
echo_info ""
echo_info "常用命令："
echo_info "  查看狀態: pm2 status"
echo_info "  查看日誌: pm2 logs inventory-system"
echo_info "  停止服務: ./stop-service.sh"
echo_info "  重啟服務: pm2 restart inventory-system"
echo_info ""
echo_warn "⚠️  請確保 GCP 防火牆規則允許 3000 端口訪問！"
echo_info "   執行: gcloud compute firewall-rules create allow-inventory-system --allow tcp:3000 --source-ranges 0.0.0.0/0"

