#!/bin/bash

echo "=========================================="
echo "物料管理系統 - 安裝腳本"
echo "=========================================="
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未找到 Node.js"
    echo ""
    echo "請先安裝 Node.js："
    echo "  - 訪問 https://nodejs.org/"
    echo "  - 下載並安裝 LTS 版本"
    exit 1
fi

echo "✅ Node.js 版本：$(node --version)"
echo "✅ npm 版本：$(npm --version)"
echo ""

# 檢查是否已建置
if [ ! -d ".next" ]; then
    echo "📦 安裝依賴套件..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        exit 1
    fi
    
    echo ""
    echo "🔨 建置應用程式..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ 建置失敗"
        exit 1
    fi
else
    echo "✅ 應用程式已建置"
fi

echo ""
echo "=========================================="
echo "✅ 安裝完成！"
echo "=========================================="
echo ""
echo "下一步："
echo ""
echo "1. 建立 .env.local 檔案，設定以下環境變數："
echo "   NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_Key"
echo ""
echo "2. 執行應用程式："
echo "   npm start"
echo ""
echo "3. 在瀏覽器開啟："
echo "   http://localhost:3000"
echo ""


