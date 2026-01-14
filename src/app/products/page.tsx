'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product, Material, ProductRecipeWithMaterial } from '@/types/domain'
import {
  getAllProducts,
  createProduct,
  getProductRecipes,
  setProductRecipe,
  deleteProduct,
  updateProduct,
} from '@/lib/product-service'
import { getAllMaterials } from '@/lib/inventory-service'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [productRecipes, setProductRecipes] = useState<Record<number, ProductRecipeWithMaterial[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [showRecipeForm, setShowRecipeForm] = useState<number | null>(null)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    material_id: '',
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
      // 載入所有產品的配方資訊
      const recipesMap: Record<number, ProductRecipeWithMaterial[]> = {}
      for (const product of data) {
        try {
          const recipes = await getProductRecipes(product.id)
          recipesMap[product.id] = recipes
        } catch (err) {
          recipesMap[product.id] = []
        }
      }
      setProductRecipes(recipesMap)
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
      if (editingProductId) {
        // 更新產品
        await updateProduct(editingProductId, {
          name: formData.name,
          description: formData.description || null,
          material_id: formData.material_id ? Number(formData.material_id) : null,
        })
        setSuccess('配方更新成功！')
      } else {
        // 新增產品
        await createProduct(
          formData.name,
          formData.description || null,
          formData.material_id ? Number(formData.material_id) : null,
          formData.is_product
        )
        setSuccess('配方新增成功！')
      }
      setFormData({ name: '', description: '', material_id: '', is_product: true })
      setShowForm(false)
      setEditingProductId(null)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗')
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
      await loadProducts() // 重新載入會更新配方資訊
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
            onClick={() => {
              setShowForm(!showForm)
              setEditingProductId(null)
              setFormData({ name: '', description: '', material_id: '', is_product: true })
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? '取消' : '+ 新增配方'}
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
            <h2 className="text-xl font-semibold mb-4">
              {editingProductId ? '編輯配方' : '新增配方'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配方名稱 *
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  產出物料（產品製作時會增加此物料的庫存）*
                </label>
                <select
                  value={formData.material_id}
                  onChange={(e) =>
                    setFormData({ ...formData, material_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選擇產出物料</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.material_code} - {m.name} {m.description ? `(${m.description})` : ''}
                    </option>
                  ))}
                </select>
                {formData.material_id && (
                  <p className="mt-1 text-xs text-gray-500">
                    已選擇：{materials.find((m) => m.id === Number(formData.material_id))?.material_code} - {materials.find((m) => m.id === Number(formData.material_id))?.name}
                  </p>
                )}
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
                    setEditingProductId(null)
                    setFormData({ name: '', description: '', material_id: '', is_product: true })
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
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
              <thead className="bg-gray-50">
                <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '150px' }}>
                  配方名稱
                </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '200px' }}>
                    產出物料
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '250px' }}>
                    描述
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '200px' }}>
                    配方資訊
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '120px' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      尚無產品
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const productMaterial = materials.find((m) => m.id === product.material_id)
                    const recipes = productRecipes[product.id] || []
                    const recipeInfo = recipes.length > 0
                      ? recipes.map((r) => {
                          const mat = materials.find((m) => m.id === r.material_id)
                          if (!mat) return ''
                          const desc = mat.description ? ` (${mat.description})` : ''
                          return `${mat.name}${desc} × ${r.quantity_required}${mat.unit}`
                        }).filter(Boolean).join(' + ')
                      : '未設定配方'
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {editingProductId === product.id ? (
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {editingProductId === product.id ? (
                            <select
                              value={formData.material_id}
                              onChange={(e) =>
                                setFormData({ ...formData, material_id: e.target.value })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              <option value="">選擇產出物料</option>
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.material_code} - {m.name} {m.description ? `(${m.description})` : ''}
                                </option>
                              ))}
                            </select>
                          ) : productMaterial ? (
                            <div>
                              <div className="font-medium">
                                {productMaterial.material_code} - {productMaterial.name}
                              </div>
                              {productMaterial.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {productMaterial.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-500">未設定產出物料</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {editingProductId === product.id ? (
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                              placeholder="描述"
                            />
                          ) : (
                            product.description || '-'
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {recipes.length > 0 ? (
                            <div className="space-y-1">
                              {recipes.map((r, idx) => {
                                const mat = materials.find((m) => m.id === r.material_id)
                                if (!mat) return null
                                return (
                                  <div key={idx} className="text-xs">
                                    {mat.name} {mat.description ? `(${mat.description})` : ''} × {r.quantity_required}{mat.unit}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            '未設定配方'
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm">
                          {editingProductId === product.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await updateProduct(product.id, {
                                      name: formData.name,
                                      description: formData.description || null,
                                      material_id: formData.material_id ? Number(formData.material_id) : null,
                                    })
                                    setSuccess('更新成功！')
                                    setEditingProductId(null)
                                    await loadProducts()
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : '更新失敗')
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                儲存
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProductId(null)
                                  setFormData({ name: '', description: '', material_id: '', is_product: true })
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProductId(product.id)
                                  setFormData({
                                    name: product.name,
                                    description: product.description || '',
                                    material_id: product.material_id?.toString() || '',
                                    is_product: product.is_product,
                                  })
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                編輯
                              </button>
                              <button
                                onClick={() => handleShowRecipe(product.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                設定配方
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('確定要刪除此配方嗎？這將刪除整個配方及其所有設定。')) {
                                    try {
                                      await deleteProduct(product.id)
                                      setSuccess('配方已刪除！')
                                      await loadProducts()
                                    } catch (err) {
                                      setError(err instanceof Error ? err.message : '刪除失敗')
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                刪除配方
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showRecipeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">設定產品配方</h2>
              <p className="text-sm text-gray-600 mb-4">
                設定製作此產品需要的原料物料（會扣除）
              </p>
              <div className="space-y-4">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-gray-700 mb-3">原料物料（會扣除）</h3>
                  {recipeData.map((item, index) => {
                    const selectedMaterial = materials.find((m) => m.id === item.material_id)
                    return (
                      <div key={index} className="flex gap-2 items-end mb-3">
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
                                {m.material_code} - {m.name} {m.description ? `(${m.description})` : ''}
                              </option>
                            ))}
                          </select>
                          {selectedMaterial && selectedMaterial.description && (
                            <p className="mt-1 text-xs text-gray-500">
                              描述規格：{selectedMaterial.description}
                            </p>
                          )}
                        </div>
                        <div className="w-40">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            數量 {selectedMaterial && `(${selectedMaterial.unit})`}
                          </label>
                          <input
                            type="number"
                            value={item.quantity_required || ''}
                            onChange={(e) => {
                              const newData = [...recipeData]
                              newData[index].quantity_required = e.target.value ? Number(e.target.value) : 0
                              setRecipeData(newData)
                            }}
                            min="0"
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="輸入數量"
                          />
                        </div>
                        {recipeData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecipeItem(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mb-0"
                          >
                            刪除
                          </button>
                        )}
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={addRecipeItem}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + 新增原料物料
                  </button>
                </div>
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
