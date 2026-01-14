'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/domain'
import { getAllProducts, produceProduct } from '@/lib/product-service'

export default function ProductionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getAllProducts()
      // 只顯示產品（is_product = true）
      setProducts(data.filter((p) => p.is_product))
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    }
  }

  const handleProduce = async () => {
    if (!selectedProductId) {
      setError('請選擇產品')
      return
    }

    if (quantity <= 0) {
      setError('數量必須大於0')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await produceProduct(selectedProductId, quantity)
      if (result.success) {
        setSuccess(`成功製作 ${quantity} 個產品！`)
        setQuantity(1)
        setSelectedProductId(null)
      } else {
        setError(result.message || '製作失敗')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '製作失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 返回首頁
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">製作產品</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇產品 *
              </label>
              <select
                value={selectedProductId || ''}
                onChange={(e) =>
                  setSelectedProductId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇產品</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                製作數量 *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                step="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleProduce}
                disabled={loading || !selectedProductId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '製作中...' : '開始製作'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">說明</h3>
          <p className="text-blue-800 text-sm">
            製作產品時，系統會自動檢查所需物料的庫存是否足夠。
            如果庫存不足，會顯示錯誤訊息。製作成功後，會自動扣除相應的物料庫存。
          </p>
        </div>
      </div>
    </div>
  )
}
