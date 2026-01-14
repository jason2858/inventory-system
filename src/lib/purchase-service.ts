import { supabase } from './supabase-client'
import type { PurchaseRecord } from '@/types/domain'

/**
 * 取得所有採購紀錄
 */
export async function getAllPurchaseRecords(): Promise<PurchaseRecord[]> {
  const { data, error } = await supabase
    .from('purchase_records')
    .select('*')
    .order('purchase_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`取得採購紀錄失敗: ${error.message}`)
  }

  return data || []
}

/**
 * 新增採購紀錄
 */
export async function createPurchaseRecord(
  record: Omit<PurchaseRecord, 'id' | 'created_at'>
): Promise<PurchaseRecord> {
  const { data, error } = await supabase
    .from('purchase_records')
    .insert(record)
    .select()
    .single()

  if (error) {
    throw new Error(`新增採購紀錄失敗: ${error.message}`)
  }

  return data
}

/**
 * 更新採購紀錄
 */
export async function updatePurchaseRecord(
  id: number,
  updates: Partial<PurchaseRecord>
): Promise<PurchaseRecord> {
  const { data, error } = await supabase
    .from('purchase_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`更新採購紀錄失敗: ${error.message}`)
  }

  return data
}

/**
 * 刪除採購紀錄
 */
export async function deletePurchaseRecord(id: number): Promise<void> {
  const { error } = await supabase
    .from('purchase_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`刪除採購紀錄失敗: ${error.message}`)
  }
}

