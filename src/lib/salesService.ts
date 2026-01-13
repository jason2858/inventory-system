import { supabase } from './supabaseClient'
import type { SalesRecord } from '@/types/domain'

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

  return data || []
}

/**
 * 新增銷售紀錄
 */
export async function createSalesRecord(
  record: Omit<SalesRecord, 'id' | 'created_at'>
): Promise<SalesRecord> {
  const { data, error } = await supabase
    .from('sales_records')
    .insert(record)
    .select()
    .single()

  if (error) {
    throw new Error(`新增銷售紀錄失敗: ${error.message}`)
  }

  return data
}

/**
 * 更新銷售紀錄
 */
export async function updateSalesRecord(
  id: number,
  updates: Partial<SalesRecord>
): Promise<SalesRecord> {
  const { data, error } = await supabase
    .from('sales_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`更新銷售紀錄失敗: ${error.message}`)
  }

  return data
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

