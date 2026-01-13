-- 物料管理系統資料庫結構
-- 請在 Supabase SQL Editor 中執行此腳本

-- ============================================
-- 刪除現有表格和函數（按依賴順序）
-- ============================================

-- 刪除 RPC 函數
DROP FUNCTION IF EXISTS ship_combo(BIGINT, INTEGER);
DROP FUNCTION IF EXISTS produce_product(BIGINT, INTEGER);

-- 刪除表格（先刪除有外鍵依賴的表）
DROP TABLE IF EXISTS shipment_combo_items CASCADE;
DROP TABLE IF EXISTS product_recipes CASCADE;
DROP TABLE IF EXISTS sales_records CASCADE;
DROP TABLE IF EXISTS purchase_records CASCADE;
DROP TABLE IF EXISTS shipment_combos CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS materials CASCADE;

-- 刪除舊的庫存管理表格（如果存在）
DROP TABLE IF EXISTS inventory_items CASCADE;

-- ============================================
-- 建立新表格
-- ============================================

-- 1. 建立 materials 表（物料管理）
CREATE TABLE IF NOT EXISTS materials (
  id BIGSERIAL PRIMARY KEY,
  material_code TEXT NOT NULL UNIQUE, -- 物料編號
  name TEXT NOT NULL, -- 名稱
  description TEXT, -- 描述規格
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 庫存
  unit TEXT NOT NULL, -- 單位
  supplier TEXT, -- 供應商
  notes TEXT, -- 備註
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 建立 products 表
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  material_id BIGINT, -- 產品對應的物料ID（產品本身也是物料）
  is_product BOOLEAN NOT NULL DEFAULT true -- true: 產品, false: 出庫組合
);

-- 3. 建立 product_recipes 表（產品配方：A+B+C→D）
CREATE TABLE IF NOT EXISTS product_recipes (
  product_id BIGINT NOT NULL, -- 產品ID（由應用層控制關聯）
  material_id BIGINT NOT NULL, -- 物料ID（由應用層控制關聯）
  quantity_required NUMERIC(10, 2) NOT NULL,
  PRIMARY KEY (product_id, material_id)
);

-- 4. 建立 shipment_combos 表（出庫組合：D+E+F一起出庫）
CREATE TABLE IF NOT EXISTS shipment_combos (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- 組合名稱
  description TEXT
);

-- 5. 建立 shipment_combo_items 表（出庫組合項目）
CREATE TABLE IF NOT EXISTS shipment_combo_items (
  id BIGSERIAL PRIMARY KEY,
  combo_id BIGINT NOT NULL, -- 出庫組合ID（由應用層控制關聯）
  product_id BIGINT, -- 可能是產品（由應用層控制關聯）
  material_id BIGINT, -- 可能是物料（由應用層控制關聯）
  quantity_required NUMERIC(10, 2) NOT NULL,
  -- 確保 product_id 和 material_id 至少有一個不為 NULL
  CONSTRAINT check_product_or_material CHECK (
    (product_id IS NOT NULL AND material_id IS NULL) OR
    (product_id IS NULL AND material_id IS NOT NULL)
  ),
  -- 唯一約束：同一個組合中，同一個產品或物料只能出現一次
  CONSTRAINT unique_combo_item UNIQUE (combo_id, product_id, material_id)
);

-- 6. 建立 sales_records 表（銷售紀錄）
CREATE TABLE IF NOT EXISTS sales_records (
  id BIGSERIAL PRIMARY KEY,
  sale_date DATE NOT NULL, -- 日期
  order_number TEXT NOT NULL, -- 訂單編號
  material_id BIGINT, -- 物料編號（由應用層控制關聯）
  name TEXT NOT NULL, -- 名稱
  quantity NUMERIC(10, 2) NOT NULL, -- 數量
  customer TEXT, -- 銷售對象
  sales_amount NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 銷售額
  receiver TEXT, -- 收款人
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 運費
  handling_fee NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 手續費
  income NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 進帳
  notes TEXT, -- 備註
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. 建立 purchase_records 表（採購紀錄）
CREATE TABLE IF NOT EXISTS purchase_records (
  id BIGSERIAL PRIMARY KEY,
  purchase_date DATE NOT NULL, -- 採購日期
  invoice_number TEXT NOT NULL, -- 發票編號
  material_id BIGINT, -- 物料編號（由應用層控制關聯）
  name TEXT NOT NULL, -- 名稱
  specification TEXT, -- 規格
  description TEXT, -- 說明
  quantity NUMERIC(10, 2) NOT NULL, -- 數量
  seller TEXT, -- 賣方
  payer TEXT, -- 支付人
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 金額
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. 建立 RPC 函數：produce_product
-- 此函數會檢查物料庫存是否足夠，並一次性扣除所有需要的物料
CREATE OR REPLACE FUNCTION produce_product(
  p_product_id BIGINT,
  p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_recipe RECORD;
  v_total_needed NUMERIC(10, 2);
  v_current_quantity NUMERIC(10, 2);
  v_insufficient_items TEXT[];
BEGIN
  -- 檢查產品是否存在
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RETURN json_build_object(
      'success', false,
      'code', 'PRODUCT_NOT_FOUND',
      'message', '產品不存在'
    );
  END IF;

  -- 檢查配方是否存在
  IF NOT EXISTS (SELECT 1 FROM product_recipes WHERE product_id = p_product_id) THEN
    RETURN json_build_object(
      'success', false,
      'code', 'NO_RECIPE',
      'message', '此產品尚未設定配方'
    );
  END IF;

  -- 檢查所有需要的物料庫存是否足夠
  FOR v_recipe IN 
    SELECT material_id, quantity_required
    FROM product_recipes
    WHERE product_id = p_product_id
  LOOP
    v_total_needed := v_recipe.quantity_required * p_quantity;
    
    SELECT quantity INTO v_current_quantity
    FROM materials
    WHERE id = v_recipe.material_id;
    
    IF v_current_quantity < v_total_needed THEN
      v_insufficient_items := array_append(
        v_insufficient_items,
        (SELECT name FROM materials WHERE id = v_recipe.material_id)
      );
    END IF;
  END LOOP;

  -- 如果有庫存不足，回傳錯誤
  IF array_length(v_insufficient_items, 1) > 0 THEN
    RETURN json_build_object(
      'success', false,
      'code', 'INSUFFICIENT_INVENTORY',
      'message', array_to_string(v_insufficient_items, ', ') || ' 庫存不足'
    );
  END IF;

  -- 所有庫存都足夠，開始扣除
  FOR v_recipe IN 
    SELECT material_id, quantity_required
    FROM product_recipes
    WHERE product_id = p_product_id
  LOOP
    v_total_needed := v_recipe.quantity_required * p_quantity;
    
    UPDATE materials
    SET 
      quantity = quantity - v_total_needed,
      updated_at = NOW()
    WHERE id = v_recipe.material_id;
  END LOOP;

  -- 成功
  RETURN json_build_object(
    'success', true,
    'message', '產品製作成功'
  );
END;
$$;

-- 9. 建立 RPC 函數：ship_combo
-- 出庫組合函數：D+E+F一起出庫
CREATE OR REPLACE FUNCTION ship_combo(
  p_combo_id BIGINT,
  p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_total_needed NUMERIC(10, 2);
  v_current_quantity NUMERIC(10, 2);
  v_insufficient_items TEXT[];
BEGIN
  -- 檢查組合是否存在
  IF NOT EXISTS (SELECT 1 FROM shipment_combos WHERE id = p_combo_id) THEN
    RETURN json_build_object(
      'success', false,
      'code', 'COMBO_NOT_FOUND',
      'message', '出庫組合不存在'
    );
  END IF;

  -- 檢查所有需要的項目庫存是否足夠
  FOR v_item IN 
    SELECT product_id, material_id, quantity_required
    FROM shipment_combo_items
    WHERE combo_id = p_combo_id
  LOOP
    v_total_needed := v_item.quantity_required * p_quantity;
    
    -- 如果是產品，檢查產品庫存（假設產品也有庫存，或需要從物料計算）
    -- 如果是物料，直接檢查物料庫存
    IF v_item.material_id IS NOT NULL THEN
      SELECT quantity INTO v_current_quantity
      FROM materials
      WHERE id = v_item.material_id;
      
      IF v_current_quantity < v_total_needed THEN
        v_insufficient_items := array_append(
          v_insufficient_items,
          (SELECT name FROM materials WHERE id = v_item.material_id)
        );
      END IF;
    ELSIF v_item.product_id IS NOT NULL THEN
      -- 產品出庫邏輯（可以擴展）
      -- 這裡假設產品本身也有庫存，或需要從物料計算
      NULL; -- 暫時跳過產品庫存檢查
    END IF;
  END LOOP;

  -- 如果有庫存不足，回傳錯誤
  IF array_length(v_insufficient_items, 1) > 0 THEN
    RETURN json_build_object(
      'success', false,
      'code', 'INSUFFICIENT_INVENTORY',
      'message', array_to_string(v_insufficient_items, ', ') || ' 庫存不足'
    );
  END IF;

  -- 所有庫存都足夠，開始扣除
  FOR v_item IN 
    SELECT product_id, material_id, quantity_required
    FROM shipment_combo_items
    WHERE combo_id = p_combo_id
  LOOP
    v_total_needed := v_item.quantity_required * p_quantity;
    
    IF v_item.material_id IS NOT NULL THEN
      UPDATE materials
      SET 
        quantity = quantity - v_total_needed,
        updated_at = NOW()
      WHERE id = v_item.material_id;
    END IF;
  END LOOP;

  -- 成功
  RETURN json_build_object(
    'success', true,
    'message', '出庫成功'
  );
END;
$$;

-- 10. 啟用 Row Level Security (RLS) - 可選
-- 如果只需要內部使用，可以暫時不啟用 RLS
-- ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shipment_combos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shipment_combo_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;

-- 11. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_materials_updated_at ON materials(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(material_code);
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_material_id ON product_recipes(material_id);
CREATE INDEX IF NOT EXISTS idx_shipment_combo_items_combo_id ON shipment_combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_sale_date ON sales_records(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_records_material_id ON sales_records(material_id);
CREATE INDEX IF NOT EXISTS idx_purchase_records_purchase_date ON purchase_records(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_records_material_id ON purchase_records(material_id);

