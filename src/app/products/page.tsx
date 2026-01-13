'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product, Material } from '@/types/domain'
import {
  getAllProducts,
  createProduct,
  getProductRecipes,
  setProductRecipe,
} from '@/lib/productService'
import { getAllMaterials } from '@/lib/inventoryService'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showRecipeForm, setShowRecipeForm] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_product: true,
  })
  const [recipeData, setRecipeData] = useState<
    { material_id: number; quantity_required: number }[]
  >([{ material_id: 0, quantity_required: 0 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
    loadMaterials()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getAllProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    }
  }

  const loadMaterials = async () => {
    try {
      const data = await getAllMaterials()
      setMaterials(data)
    } catch (err) {
      console.error('載入物料失敗:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await createProduct(
        formData.name,
        formData.description || null,
        formData.is_product
      )
      setSuccess('產品新增成功！')
      setFormData({ name: '', description: '', is_product: true })
      setShowForm(false)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleShowRecipe = async (productId: number) => {
    try {
      const recipes = await getProductRecipes(productId)
      setRecipeData(
        recipes.length > 0
          ? recipes.map((r) => ({
              material_id: r.material_id,
              quantity_required: r.quantity_required,
            }))
          : [{ material_id: 0, quantity_required: 0 }]
      )
      setShowRecipeForm(productId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入配方失敗')
    }
  }

  const handleSaveRecipe = async (productId: number) => {
    try {
      setError(null)
      const validRecipes = recipeData.filter(
        (r) => r.material_id > 0 && r.quantity_required > 0
      )
      await setProductRecipe(productId, validRecipes)
      setSuccess('配方設定成功！')
      setShowRecipeForm(null)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定配方失敗')
    }
  }

  const addRecipeItem = () => {
    setRecipeData([...recipeData, { material_id: 0, quantity_required: 0 }])
  }

  const removeRecipeItem = (index: number) => {
    setRecipeData(recipeData.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 返回首頁
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">產品管理</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? '取消' : '+ 新增產品'}
          </button>
        </div>

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

        {showForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">新增產品</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  產品名稱 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '新增中...' : '新增'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: '', description: '', is_product: true })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  產品名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  描述
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    尚無產品
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleShowRecipe(product.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        設定配方
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showRecipeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">設定產品配方</h2>
              <div className="space-y-4">
                {recipeData.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        物料
                      </label>
                      <select
                        value={item.material_id}
                        onChange={(e) => {
                          const newData = [...recipeData]
                          newData[index].material_id = Number(e.target.value)
                          setRecipeData(newData)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value={0}>選擇物料</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.material_code} - {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        數量
                      </label>
                      <input
                        type="number"
                        value={item.quantity_required}
                        onChange={(e) => {
                          const newData = [...recipeData]
                          newData[index].quantity_required = Number(
                            e.target.value
                          )
                          setRecipeData(newData)
                        }}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {recipeData.length > 1 && (
                      <button
                        onClick={() => removeRecipeItem(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addRecipeItem}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  + 新增物料
                </button>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveRecipe(showRecipeForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  儲存配方
                </button>
                <button
                  onClick={() => {
                    setShowRecipeForm(null)
                    setRecipeData([{ material_id: 0, quantity_required: 0 }])
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
