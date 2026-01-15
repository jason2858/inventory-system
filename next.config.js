/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 啟用 standalone 輸出模式（用於 Docker 或單一執行檔打包）
  // 注意：在 GCP VM 上，如果遇到靜態資源 404，可以改用 next start
  output: 'standalone',
  // 確保靜態資源路徑正確
  trailingSlash: false,
}

module.exports = nextConfig

