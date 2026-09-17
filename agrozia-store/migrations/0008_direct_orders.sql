-- Stage 10: independent direct-sale orders for agrozia.ir.
-- Orders are created only from valid, unexpired Store checkouts.
CREATE TABLE IF NOT EXISTS commerce_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  checkout_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  currency TEXT NOT NULL,
  subtotal TEXT NOT NULL,
  total TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_postal_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (checkout_id) REFERENCES commerce_checkouts(id) ON DELETE RESTRICT,
  CHECK (status IN ('pending_confirmation','confirmed','proforma_pending','payment_pending','sourcing','shipping','delivered','completed','cancelled','rejected')),
  CHECK (length(currency) BETWEEN 3 AND 10),
  CHECK (length(subtotal) BETWEEN 1 AND 80),
  CHECK (length(total) BETWEEN 1 AND 80)
);

CREATE TABLE IF NOT EXISTS commerce_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT,
  unit_price TEXT NOT NULL,
  currency TEXT NOT NULL,
  line_total TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_store_orders_customer ON commerce_orders(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON commerce_orders(status);
CREATE INDEX IF NOT EXISTS idx_store_orders_checkout ON commerce_orders(checkout_id);
CREATE INDEX IF NOT EXISTS idx_store_order_items_order ON commerce_order_items(order_id);
