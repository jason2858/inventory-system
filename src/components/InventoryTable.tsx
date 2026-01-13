'use client'

import { useState, useEffect } from 'react'
import type { Material } from '@/types/domain'
import {
  getAllMaterials,
  updateMaterial,
  deleteMaterial,
} from '@/lib/inventoryService'

export default function MaterialTable() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Material>>({})

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllMaterials()
      setMaterials(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (material: Material) => {
    setEditingId(material.id)
    setEditData({
      material_code: material.material_code,
      name: material.name,
      description: material.description || '',
      quantity: material.quantity,
      unit: material.unit,
      supplier: material.supplier || '',
      notes: material.notes || '',
    })
  }

  const handleSave = async (id: number) => {
    try {
      setError(null)
      await updateMaterial(id, editData)
      await loadMaterials()
      setEditingId(null)
      setEditData({})
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此物料嗎？')) {
      return
    }

    try {
      setError(null)
      await deleteMaterial(id)
      await loadMaterials()
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">載入中...</div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  物料編號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述規格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  庫存
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  單位
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  供應商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  備註
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後更新
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    尚無物料
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.material_code || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, material_code: e.target.value })
                          }
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        material.material_code
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        material.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {editingId === material.id ? (
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="truncate block">{material.description || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="number"
                          value={editData.quantity || 0}
                          onChange={(e) =>
                            setEditData({ ...editData, quantity: Number(e.target.value) })
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        material.quantity
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.unit || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, unit: e.target.value })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        material.unit
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.supplier || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, supplier: e.target.value })
                          }
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        material.supplier || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {editingId === material.id ? (
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="truncate block">{material.notes || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.updated_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === material.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(material.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            儲存
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => handleEdit(material)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            刪除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

