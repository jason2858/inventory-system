import { supabase } from './supabaseClient'
import type { SalesRecord, SalesRecordItem } from '@/types/domain'

/**
 * 取得所有銷售紀錄
 */
export async function getAllSalesRecords(): Promise<SalesRecord[]> {
  const { data, error } = await supabase
    .from('sales_records')
    .select('*')
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`取得銷售紀錄失敗: ${error.message}`)
  }

  // 轉換 JSONB items 為陣列
  return (data || []).map((record: any) => ({
    ...record,
    items: Array.isArray(record.items) ? record.items : [],
  }))
}

/**
 * 新增銷售紀錄
 */
export async function createSalesRecord(
  record: Omit<SalesRecord, 'id' | 'created_at'>
): Promise<SalesRecord> {
  const { data, error } = await supabase
    .from('sales_records')
    .insert({
      ...record,
      items: JSON.stringify(record.items || []),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`新增銷售紀錄失敗: ${error.message}`)
  }

  return {
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
  }
}

/**
 * 更新銷售紀錄
 */
export async function updateSalesRecord(
  id: number,
  updates: Partial<SalesRecord>
): Promise<SalesRecord> {
  const updateData: any = { ...updates }
  if (updates.items) {
    updateData.items = JSON.stringify(updates.items)
  }

  const { data, error } = await supabase
    .from('sales_records')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`更新銷售紀錄失敗: ${error.message}`)
  }

  return {
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
  }
}

/**
 * 刪除銷售紀錄
 */
export async function deleteSalesRecord(id: number): Promise<void> {
  const { error } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`刪除銷售紀錄失敗: ${error.message}`)
  }
}

