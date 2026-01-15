#!/bin/bash

# 安裝建置所需的依賴（不包括 Electron）
# 使用方法: ./install-build-deps.sh

set -e

# 顏色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_info "安裝建置所需的依賴..."
echo_warn "注意：只安裝 Next.js 建置必需的依賴，不包括 Electron"

# 先安裝 production 依賴
echo_info "1. 安裝生產環境依賴..."
NODE_OPTIONS="--max-old-space-size=512" npm install --production

# 然後只安裝建置必需的 devDependencies
echo_info "2. 安裝建置必需的開發依賴（TypeScript、TailwindCSS 等）..."
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

echo_info ""
echo_info "✅ 依賴安裝完成！"
echo_info ""
echo_info "已安裝："
echo_info "  - 生產依賴：next, react, react-dom, @supabase/supabase-js"
echo_info "  - 建置工具：typescript, tailwindcss, postcss, autoprefixer"
echo_info "  - 類型定義：@types/node, @types/react, @types/react-dom"
echo_info ""
echo_info "未安裝（不需要）："
echo_info "  - electron, electron-builder"
echo_info ""
echo_info "現在可以執行建置："
echo_info "  NODE_OPTIONS=\"--max-old-space-size=512\" npm run build"

