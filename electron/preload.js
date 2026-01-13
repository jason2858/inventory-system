// Preload 腳本（在渲染進程中執行，但可以訪問 Node.js API）
// 這裡可以安全地暴露一些 API 給渲染進程

const { contextBridge } = require('electron')

// 暴露受保護的方法給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在這裡添加需要暴露給前端的 API
  platform: process.platform,
})

