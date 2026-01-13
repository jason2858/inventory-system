@echo off
chcp 65001 >nul
echo ==========================================
echo 物料管理系統 - 安裝腳本
echo ==========================================
echo.

REM 檢查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：未找到 Node.js
    echo.
    echo 請先安裝 Node.js：
    echo   - 訪問 https://nodejs.org/
    echo   - 下載並安裝 LTS 版本
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js 版本：%NODE_VERSION%
echo ✅ npm 版本：%NPM_VERSION%
echo.

REM 檢查是否已建置
if not exist ".next" (
    echo 📦 安裝依賴套件...
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
    
    echo.
    echo 🔨 建置應用程式...
    call npm run build
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 建置失敗
        pause
        exit /b 1
    )
) else (
    echo ✅ 應用程式已建置
)

echo.
echo ==========================================
echo ✅ 安裝完成！
echo ==========================================
echo.
echo 下一步：
echo.
echo 1. 建立 .env.local 檔案，設定以下環境變數：
echo    NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_URL
echo    NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_Key
echo.
echo 2. 執行應用程式：
echo    npm start
echo.
echo 3. 在瀏覽器開啟：
echo    http://localhost:3000
echo.
pause


