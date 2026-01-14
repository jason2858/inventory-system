'use client'

import { useState, useEffect } from 'react'
import type { Material } from '@/types/domain'
import {
  getAllMaterials,
  updateMaterial,
  deleteMaterial,
} from '@/lib/inventory-service'

export default function MaterialTable() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Material>>({})
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    material_code: 110,
    name: 130,
    description: 180,
    quantity: 90,
    unit: 70,
    supplier: 130,
    notes: 130,
    low_stock_alert: 90,
    can_sell: 70,
    updated_at: 130,
    actions: 110,
  })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)

  useEffect(() => {
    loadMaterials()
  }, [])

  // 處理欄位寬度調整
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startWidth = columnWidths[column] || 100

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX
      const newWidth = Math.max(50, startWidth + diff)
      
      setColumnWidths((prev) => ({
        ...prev,
        [column]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setResizingColumn(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    setResizingColumn(column)
  }

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
      low_stock_alert: material.low_stock_alert,
      can_sell: material.can_sell,
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
          <table className="divide-y divide-gray-200" style={{ width: '100%', minWidth: '1200px', tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.material_code}px` }}>
                  物料編號
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 bg-transparent z-10"
                    onMouseDown={(e) => handleResizeStart('material_code', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.name}px` }}>
                  名稱
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('name', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.description}px` }}>
                  描述規格
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('description', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.quantity}px` }}>
                  庫存
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('quantity', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.unit}px` }}>
                  單位
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('unit', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.supplier}px` }}>
                  供應商
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('supplier', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.notes}px` }}>
                  備註
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('notes', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.low_stock_alert}px` }}>
                  過低警示
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('low_stock_alert', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.can_sell}px` }}>
                  可銷售
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('can_sell', e)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative" style={{ width: `${columnWidths.updated_at}px` }}>
                  最後更新
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 z-10"
                    onMouseDown={(e) => handleResizeStart('updated_at', e)}
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: `${columnWidths.actions}px` }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    尚無物料
                  </td>
                </tr>
              ) : (
                materials.map((material) => {
                  const isLowStock = material.low_stock_alert !== null && material.quantity < material.low_stock_alert
                  return (
                    <tr 
                      key={material.id} 
                      className={`hover:bg-gray-50 ${editingId === material.id ? 'bg-blue-50' : ''} ${isLowStock ? 'bg-yellow-50' : ''}`}
                    >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.material_code || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, material_code: e.target.value })
                          }
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                        />
                      ) : (
                        material.material_code
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                        />
                      ) : (
                        material.name
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {editingId === material.id ? (
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                        />
                      ) : (
                        <span className="truncate block">{material.description || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="text"
                          value={editData.supplier || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, supplier: e.target.value })
                          }
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                        />
                      ) : (
                        material.supplier || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {editingId === material.id ? (
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                        />
                      ) : (
                        <span className="truncate block">{material.notes || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="number"
                          value={editData.low_stock_alert ?? ''}
                          onChange={(e) =>
                            setEditData({ ...editData, low_stock_alert: e.target.value ? Number(e.target.value) : null })
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          min="0"
                          step="0.01"
                          placeholder="未設定"
                        />
                      ) : (
                        material.low_stock_alert !== null ? material.low_stock_alert : '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === material.id ? (
                        <input
                          type="checkbox"
                          checked={editData.can_sell ?? false}
                          onChange={(e) =>
                            setEditData({ ...editData, can_sell: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                      ) : (
                        material.can_sell ? '✓' : '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.updated_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

