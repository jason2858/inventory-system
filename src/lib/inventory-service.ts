import { supabase } from './supabase-client'
import type { Material } from '@/types/domain'

/**
 * 取得所有物料
 */
export async function getAllMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`取得物料失敗: ${error.message}`)
  }

  return data || []
}

/**
 * 新增物料
 */
export async function createMaterial(
  material_code: string,
  name: string,
  description: string | null,
  unit: string,
  quantity: number,
  supplier: string | null,
  notes: string | null,
  low_stock_alert: number | null = null,
  can_sell: boolean = false
): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .insert({
      material_code,
      name,
      description,
      unit,
      quantity,
      supplier,
      notes,
      low_stock_alert,
      can_sell,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`新增物料失敗: ${error.message}`)
  }

  return data
}

/**
 * 更新物料
 */
export async function updateMaterial(
  id: number,
  updates: Partial<Material>
): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`更新物料失敗: ${error.message}`)
  }

  return data
}

/**
 * 更新物料庫存數量
 */
export async function updateMaterialQuantity(
  id: number,
  quantity: number
): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`更新物料庫存失敗: ${error.message}`)
  }

  return data
}

/**
 * 刪除物料（會檢查是否有相關紀錄）
 */
export async function deleteMaterial(id: number): Promise<void> {
  // 檢查是否有產品配方使用此物料
  const { data: recipes, error: recipesError } = await supabase
    .from('product_recipes')
    .select('product_id')
    .eq('material_id', id)
    .limit(1)

  if (recipesError) {
    throw new Error(`檢查產品配方失敗: ${recipesError.message}`)
  }

  if (recipes && recipes.length > 0) {
    throw new Error('無法刪除：此物料正在產品配方中使用')
  }

  // 檢查是否有出庫組合使用此物料
  const { data: comboItems, error: comboError } = await supabase
    .from('shipment_combo_items')
    .select('combo_id')
    .eq('material_id', id)
    .limit(1)

  if (comboError) {
    throw new Error(`檢查出庫組合失敗: ${comboError.message}`)
  }

  if (comboItems && comboItems.length > 0) {
    throw new Error('無法刪除：此物料正在出庫組合中使用')
  }

  // 檢查是否有銷售紀錄使用此物料
  const { data: sales, error: salesError } = await supabase
    .from('sales_records')
    .select('id')
    .eq('material_id', id)
    .limit(1)

  if (salesError) {
    throw new Error(`檢查銷售紀錄失敗: ${salesError.message}`)
  }

  if (sales && sales.length > 0) {
    throw new Error('無法刪除：此物料有相關的銷售紀錄')
  }

  // 檢查是否有採購紀錄使用此物料
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchase_records')
    .select('id')
    .eq('material_id', id)
    .limit(1)

  if (purchasesError) {
    throw new Error(`檢查採購紀錄失敗: ${purchasesError.message}`)
  }

  if (purchases && purchases.length > 0) {
    throw new Error('無法刪除：此物料有相關的採購紀錄')
  }

  // 所有檢查通過，執行刪除
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`刪除物料失敗: ${error.message}`)
  }
}

