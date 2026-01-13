# Easy Inventory - 庫存管理系統

基於 Next.js + Supabase 的庫存管理系統。

## 技術棧

- **Framework**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **後端**: Supabase (Database + RPC)
- **套件管理**: pnpm / npm

## 環境設定

1. 複製 `env.example` 為 `.env.local`
2. 填入 Supabase 專案的 URL 和 Anon Key

```bash
cp env.example .env.local
```

3. 安裝依賴

```bash
pnpm install
# 或
npm install
```

4. 啟動開發伺服器

```bash
pnpm dev
# 或
npm run dev
```

## 專案結構

```
src/
├── app/              # Next.js App Router 頁面
├── components/       # React 元件
├── lib/             # 業務邏輯與 Supabase 客戶端
└── types/           # TypeScript 型別定義
```

## 重要提醒

- 僅使用 Supabase Anon Key，不使用 Service Role Key
- 所有 API 呼叫集中在 `lib/` 目錄
- 庫存扣減必須透過 Supabase RPC 函數，不在前端直接操作
