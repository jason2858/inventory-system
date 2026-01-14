'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SalesRecord, SalesRecordItem, Material } from '@/types/domain'
import {
  getAllSalesRecords,
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
} from '@/lib/sales-service'
import { getAllMaterials } from '@/lib/inventory-service'

export default function SalesPage() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    order_number: '',
    items: [{ material_id: 0, name: '', quantity: 0 }] as SalesRecordItem[],
    customer: '',
    sales_amount: 0,
    receiver: '',
    shipping_fee: 0,
    handling_fee: 0,
    income: 0,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadRecords()
    loadMaterials()
  }, [])

  const loadRecords = async () => {
    try {
      const data = await getAllSalesRecords()
      setRecords(data)
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

  // 只顯示可銷售的物料
  const sellableMaterials = materials.filter((m) => m.can_sell)

  const handleMaterialChange = (index: number, materialId: number) => {
    const material = sellableMaterials.find((m) => m.id === materialId)
    const newItems = [...formData.items]
    if (material) {
      newItems[index] = {
        material_id: materialId,
        name: material.name,
        quantity: newItems[index].quantity || 0,
      }
    } else {
      newItems[index] = {
        material_id: 0,
        name: '',
        quantity: 0,
      }
    }
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { material_id: 0, name: '', quantity: 0 }],
    })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems.length > 0 ? newItems : [{ material_id: 0, name: '', quantity: 0 }] })
  }

  const calculateIncome = () => {
    const income =
      formData.sales_amount -
      formData.shipping_fee -
      formData.handling_fee
    setFormData({ ...formData, income })
  }

  useEffect(() => {
    calculateIncome()
  }, [formData.sales_amount, formData.shipping_fee, formData.handling_fee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // 驗證物料項目
    const validItems = formData.items.filter(
      (item) => item.material_id > 0 && item.quantity > 0
    )

    if (validItems.length === 0) {
      setError('請至少選擇一個物料並設定數量')
      setLoading(false)
      return
    }

    try {
      const recordData = {
        sale_date: formData.sale_date,
        order_number: formData.order_number,
        items: validItems,
        customer: formData.customer || null,
        sales_amount: formData.sales_amount,
        receiver: formData.receiver || null,
        shipping_fee: formData.shipping_fee,
        handling_fee: formData.handling_fee,
        income: formData.income,
        notes: formData.notes || null,
      }

      if (editingId) {
        await updateSalesRecord(editingId, recordData)
        setSuccess('銷售紀錄更新成功！')
      } else {
        await createSalesRecord(recordData)
        setSuccess('銷售紀錄新增成功！')
      }

      resetForm()
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      sale_date: new Date().toISOString().split('T')[0],
      order_number: '',
      items: [{ material_id: 0, name: '', quantity: 0 }],
      customer: '',
      sales_amount: 0,
      receiver: '',
      shipping_fee: 0,
      handling_fee: 0,
      income: 0,
      notes: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (record: SalesRecord) => {
    setFormData({
      sale_date: record.sale_date,
      order_number: record.order_number,
      items: record.items && record.items.length > 0 ? record.items : [{ material_id: 0, name: '', quantity: 0 }],
      customer: record.customer || '',
      sales_amount: record.sales_amount,
      receiver: record.receiver || '',
      shipping_fee: record.shipping_fee,
      handling_fee: record.handling_fee,
      income: record.income,
      notes: record.notes || '',
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此銷售紀錄嗎？')) {
      return
    }

    try {
      await deleteSalesRecord(id)
      setSuccess('銷售紀錄刪除成功！')
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 返回首頁
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">銷售紀錄</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增銷售紀錄
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
              {editingId ? '編輯銷售紀錄' : '新增銷售紀錄'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期 *
                  </label>
                  <input
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_date: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    訂單編號 *
                  </label>
                  <input
                    type="text"
                    value={formData.order_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order_number: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物料項目 *
                </label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={item.material_id}
                          onChange={(e) =>
                            handleMaterialChange(index, Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>選擇物料</option>
                          {sellableMaterials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.material_code} - {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.items]
                            newItems[index].quantity = Number(e.target.value)
                            setFormData({ ...formData, items: newItems })
                          }}
                          min="0"
                          step="0.01"
                          placeholder="數量"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          刪除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + 新增物料
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    銷售對象
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    銷售額 *
                  </label>
                  <input
                    type="number"
                    value={formData.sales_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sales_amount: Number(e.target.value),
                      })
                    }
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    收款人
                  </label>
                  <input
                    type="text"
                    value={formData.receiver}
                    onChange={(e) =>
                      setFormData({ ...formData, receiver: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    運費
                  </label>
                  <input
                    type="number"
                    value={formData.shipping_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_fee: Number(e.target.value),
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手續費
                  </label>
                  <input
                    type="number"
                    value={formData.handling_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        handling_fee: Number(e.target.value),
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    進帳（自動計算）
                  </label>
                  <input
                    type="number"
                    value={formData.income}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備註
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '處理中...' : editingId ? '更新' : '新增'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    訂單編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    物料項目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    銷售對象
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    銷售額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    進帳
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      尚無銷售紀錄
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.sale_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.items && record.items.length > 0 ? (
                          <div className="space-y-1">
                            {record.items.map((item, idx) => {
                              const material = materials.find((m) => m.id === item.material_id)
                              return (
                                <div key={idx}>
                                  <div className="font-medium">
                                    {material?.material_code || '-'} - {item.name}
                                  </div>
                                  {material?.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {material.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    數量: {item.quantity}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.customer || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.sales_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${record.income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
