-- Stage 8: independent direct-sale cart for agrozia.ir.
-- Cart ownership is always tied to the Store customer identity.
CREATE TABLE IF NOT EXISTS commerce_carts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  currency TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CHECK (status IN ('active','converted','abandoned'))
);

CREATE TABLE IF NOT EXISTS commerce_cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES commerce_carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT,
  UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_store_carts_customer ON commerce_carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_store_carts_status ON commerce_carts(status);
CREATE INDEX IF NOT EXISTS idx_store_cart_items_cart ON commerce_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_store_cart_items_product ON commerce_cart_items(product_id);
