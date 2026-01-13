const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')

let mainWindow
let nextProcess
let serverReady = false

// 檢查環境變數檔案
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    // 建立範例環境變數檔案
    const exampleEnv = `NEXT_PUBLIC_SUPABASE_URL=請填入您的_Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=請填入您的_Supabase_Key`
    fs.writeFileSync(envPath, exampleEnv, 'utf8')
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '環境變數設定',
      message: '請設定 Supabase 連線資訊',
      detail: `請編輯以下檔案並填入您的 Supabase 資訊：\n${envPath}\n\n設定完成後請重新啟動應用程式。`,
      buttons: ['確定']
    })
    
    return false
  }
  
  // 讀取環境變數
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  let hasUrl = false
  let hasKey = false
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=') && !line.includes('請填入')) {
      hasUrl = true
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !line.includes('請填入')) {
      hasKey = true
    }
  }
  
  if (!hasUrl || !hasKey) {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '環境變數未設定',
      message: '請設定 Supabase 連線資訊',
      detail: `請編輯以下檔案並填入您的 Supabase 資訊：\n${envPath}`,
      buttons: ['確定']
    })
    return false
  }
  
  return true
}

// 載入環境變數
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          process.env[key.trim()] = value
        }
      }
    }
  }
}

// 檢查伺服器是否就緒
function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    
    const checkServer = () => {
      attempts++
      
      http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          serverReady = true
          resolve()
        } else {
          if (attempts < maxAttempts) {
            setTimeout(checkServer, 1000)
          } else {
            reject(new Error('伺服器啟動超時'))
          }
        }
      }).on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(checkServer, 1000)
        } else {
          reject(new Error('伺服器啟動超時'))
        }
      })
    }
    
    setTimeout(checkServer, 2000) // 等待 2 秒後開始檢查
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'), // 可選：應用程式圖示
    show: false, // 先隱藏，等伺服器準備好再顯示
  })

  // 載入環境變數
  loadEnvFile()
  
  // 檢查環境變數
  if (!checkEnvFile()) {
    app.quit()
    return
  }

  // 啟動 Next.js 伺服器
  const isDev = process.env.NODE_ENV === 'development'
  let serverPath
  let serverArgs = []
  let serverCwd = path.join(__dirname, '..')
  
  if (isDev) {
    // 開發模式：使用 next dev
    serverPath = 'node'
    serverArgs = [
      path.join(__dirname, '..', 'node_modules', '.bin', 'next'),
      'dev',
      '-p', '3000'
    ]
  } else {
    // 生產模式：使用 standalone 伺服器
    const standalonePath = path.join(__dirname, '..', '.next', 'standalone')
    if (fs.existsSync(path.join(standalonePath, 'server.js'))) {
      serverPath = 'node'
      serverArgs = [path.join(standalonePath, 'server.js')]
      serverCwd = standalonePath
    } else {
      // 如果沒有 standalone，使用 next start
      serverPath = 'node'
      serverArgs = [
        path.join(__dirname, '..', 'node_modules', '.bin', 'next'),
        'start',
        '-p', '3000'
      ]
    }
  }

  nextProcess = spawn(serverPath, serverArgs, {
    cwd: serverCwd,
    env: {
      ...process.env,
      PORT: '3000',
      NODE_ENV: 'production',
    },
    stdio: 'pipe',
  })

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`)
  })

  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`)
  })

  nextProcess.on('close', (code) => {
    console.log(`Next.js 程序退出，代碼: ${code}`)
    if (code !== 0 && code !== null) {
      dialog.showErrorBox('錯誤', 'Next.js 伺服器啟動失敗')
    }
  })

  // 等待伺服器就緒後載入頁面
  waitForServer()
    .then(() => {
      mainWindow.loadURL('http://localhost:3000')
      mainWindow.show()
    })
    .catch((err) => {
      console.error('伺服器啟動失敗:', err)
      dialog.showErrorBox('錯誤', '無法啟動伺服器，請檢查環境變數設定')
      app.quit()
    })

  // 開發模式下開啟開發者工具
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
})

