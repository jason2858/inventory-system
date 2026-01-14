#!/bin/bash

# 停止服務腳本
# 使用方法: ./stop-service.sh

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

# 檢查 PM2
if ! command -v pm2 &> /dev/null; then
    echo_error "PM2 未安裝"
    exit 1
fi

# 檢查服務是否運行
if ! pm2 list | grep -q "inventory-system"; then
    echo_warn "服務未運行"
    exit 0
fi

# 停止服務
echo_info "停止服務..."
pm2 stop inventory-system
pm2 delete inventory-system
pm2 save

echo_info "✅ 服務已停止"
echo_info ""
echo_info "要重新啟動，請執行: ./start-service.sh"

