/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 啟用 standalone 輸出模式（用於 Docker 或單一執行檔打包）
  output: 'standalone',
}

module.exports = nextConfig

