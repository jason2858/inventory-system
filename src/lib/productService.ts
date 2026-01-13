import { supabase } from './supabaseClient'
import type { Product, ProductRecipe, ProductRecipeWithMaterial } from '@/types/domain'

/**
 * 取得所有產品
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`取得產品失敗: ${error.message}`)
  }

  return data || []
}

/**
 * 新增產品
 */
export async function createProduct(
  name: string,
  description: string | null,
  is_product: boolean = true
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      description,
      is_product,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`新增產品失敗: ${error.message}`)
  }

  return data
}

/**
 * 取得產品配方
 */
export async function getProductRecipes(productId: number): Promise<ProductRecipeWithMaterial[]> {
  const { data, error } = await supabase
    .from('product_recipes')
    .select(`
      *,
      materials(*)
    `)
    .eq('product_id', productId)

  if (error) {
    throw new Error(`取得產品配方失敗: ${error.message}`)
  }

  return (data || []).map((item: any) => ({
    product_id: item.product_id,
    material_id: item.material_id,
    quantity_required: item.quantity_required,
    material: item.materials,
  }))
}

/**
 * 設定產品配方
 */
export async function setProductRecipe(
  productId: number,
  recipes: { material_id: number; quantity_required: number }[]
): Promise<void> {
  // 先刪除舊配方
  const { error: deleteError } = await supabase
    .from('product_recipes')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    throw new Error(`刪除舊配方失敗: ${deleteError.message}`)
  }

  // 插入新配方
  if (recipes.length > 0) {
    const { error: insertError } = await supabase
      .from('product_recipes')
      .insert(
        recipes.map((r) => ({
          product_id: productId,
          material_id: r.material_id,
          quantity_required: r.quantity_required,
        }))
      )

    if (insertError) {
      throw new Error(`設定配方失敗: ${insertError.message}`)
    }
  }
}

/**
 * 製作產品
 */
export async function produceProduct(
  productId: number,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('produce_product', {
    p_product_id: productId,
    p_quantity: quantity,
  })

  if (error) {
    throw new Error(`製作產品失敗: ${error.message}`)
  }

  return data
}

/**
 * 刪除產品（會檢查是否有相關紀錄）
 */
export async function deleteProduct(id: number): Promise<void> {
  // 檢查是否有產品配方使用此產品
  const { data: recipes, error: recipesError } = await supabase
    .from('product_recipes')
    .select('material_id')
    .eq('product_id', id)
    .limit(1)

  if (recipesError) {
    throw new Error(`檢查產品配方失敗: ${recipesError.message}`)
  }

  if (recipes && recipes.length > 0) {
    throw new Error('無法刪除：此產品有設定的配方，請先刪除配方')
  }

  // 檢查是否有出庫組合使用此產品
  const { data: comboItems, error: comboError } = await supabase
    .from('shipment_combo_items')
    .select('combo_id')
    .eq('product_id', id)
    .limit(1)

  if (comboError) {
    throw new Error(`檢查出庫組合失敗: ${comboError.message}`)
  }

  if (comboItems && comboItems.length > 0) {
    throw new Error('無法刪除：此產品正在出庫組合中使用')
  }

  // 所有檢查通過，執行刪除
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`刪除產品失敗: ${error.message}`)
  }
}

