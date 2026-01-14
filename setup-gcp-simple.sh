#!/bin/bash

# 簡化版 GCP 設置腳本 - 快速設置環境
# 使用方法: sudo ./setup-gcp-simple.sh

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

# 檢查是否為 root
if [ "$EUID" -ne 0 ]; then 
    echo_error "請使用 sudo 執行此腳本"
    exit 1
fi

echo_info "開始設置 GCP 環境..."

# 檢測作業系統
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo_error "無法檢測作業系統"
    exit 1
fi

echo_info "檢測到作業系統: $OS"

# 安裝 Node.js 20.x
echo_info "安裝 Node.js 20.x..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo_info "Node.js 已安裝: $NODE_VERSION"
else
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    else
        echo_error "不支援的作業系統: $OS"
        exit 1
    fi
fi

# 驗證 Node.js 安裝
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo_info "Node.js 版本: $NODE_VERSION"
echo_info "npm 版本: $NPM_VERSION"

# 安裝 PM2（進程管理器）
echo_info "安裝 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo_info "PM2 安裝完成"
else
    echo_info "PM2 已安裝"
fi

# 設置 PM2 開機自動啟動
echo_info "設置 PM2 開機自動啟動..."
if [ -n "$SUDO_USER" ]; then
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
    echo_warn "請執行上面顯示的命令來完成設置"
else
    echo_warn "無法自動設置開機啟動，請手動執行: pm2 startup"
fi

# 安裝必要的系統套件
echo_info "安裝必要的系統套件..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y git build-essential
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum groupinstall -y "Development Tools"
    yum install -y git
fi

echo_info ""
echo_info "✅ 設置完成！"
echo_info ""
echo_info "下一步："
echo_info "1. 在應用目錄中執行: npm install"
echo_info "2. 設置環境變數: nano .env.production"
echo_info "3. 建置應用: npm run build"
echo_info "4. 啟動服務: ./start-service.sh"
echo_info ""
echo_info "查看 GCP VM 外部 IP:"
echo_info "  gcloud compute instances describe INSTANCE_NAME --zone=ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)'"

