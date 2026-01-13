// 物料
export interface Material {
  id: number
  material_code: string
  name: string
  description: string | null
  quantity: number
  unit: string
  supplier: string | null
  notes: string | null
  updated_at: string
}

// 產品
export interface Product {
  id: number
  name: string
  description: string | null
  is_product: boolean // true: 產品, false: 出庫組合
}

// 產品配方（A+B+C→D）
export interface ProductRecipe {
  product_id: number
  material_id: number
  quantity_required: number
}

// 產品配方（含物料資訊）
export interface ProductRecipeWithMaterial extends ProductRecipe {
  material: Material
}

// 出庫組合
export interface ShipmentCombo {
  id: number
  name: string
  description: string | null
}

// 出庫組合項目
export interface ShipmentComboItem {
  combo_id: number
  product_id: number | null
  material_id: number | null
  quantity_required: number
}

// 出庫組合項目（含詳細資訊）
export interface ShipmentComboItemWithDetails extends ShipmentComboItem {
  product?: Product
  material?: Material
}

// 銷售紀錄
export interface SalesRecord {
  id: number
  sale_date: string
  order_number: string
  material_id: number | null
  name: string
  quantity: number
  customer: string | null
  sales_amount: number
  receiver: string | null
  shipping_fee: number
  handling_fee: number
  income: number
  notes: string | null
  created_at: string
}

// 採購紀錄
export interface PurchaseRecord {
  id: number
  purchase_date: string
  invoice_number: string
  material_id: number | null
  name: string
  specification: string | null
  description: string | null
  quantity: number
  seller: string | null
  payer: string | null
  amount: number
  created_at: string
}

// 錯誤回應
export interface ErrorResponse {
  code: string
  message: string
}

