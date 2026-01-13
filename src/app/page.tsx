import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          物料管理系統
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/inventories"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              📦 物料管理
            </h2>
            <p className="text-gray-600">
              查看、新增、更新物料資訊
            </p>
          </Link>

          <Link
            href="/products"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              🏷️ 產品管理
            </h2>
            <p className="text-gray-600">
              管理產品與配方設定（A+B+C→D）
            </p>
          </Link>

          <Link
            href="/production"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              🏭 製作產品
            </h2>
            <p className="text-gray-600">
              選擇產品並進行製作
            </p>
          </Link>

          <Link
            href="/sales"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              💰 銷售紀錄
            </h2>
            <p className="text-gray-600">
              記錄銷售資訊與進帳
            </p>
          </Link>

          <Link
            href="/purchases"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              🛒 採購紀錄
            </h2>
            <p className="text-gray-600">
              記錄採購資訊與支出
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

