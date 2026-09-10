-- Stage 11: B2B orders are created only from an accepted Store quote.
CREATE TABLE IF NOT EXISTS commerce_b2b_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  rfq_id TEXT NOT NULL,
  quote_id TEXT NOT NULL UNIQUE,
  supplier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  currency TEXT NOT NULL,
  subtotal_minor INTEGER NOT NULL,
  total_minor INTEGER NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  lead_time TEXT,
  incoterm TEXT,
  destination TEXT,
  payment_terms TEXT,
  notes TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (rfq_id) REFERENCES commerce_rfqs(id) ON DELETE RESTRICT,
  FOREIGN KEY (quote_id) REFERENCES commerce_quotes(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id) ON DELETE RESTRICT,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT,
  CHECK (status IN ('pending_confirmation','confirmed','proforma_pending','payment_pending','sourcing','shipping','delivered','completed','cancelled','rejected')),
  CHECK (subtotal_minor >= 0),
  CHECK (total_minor >= 0),
  CHECK (unit_price_minor >= 0)
);

CREATE TABLE IF NOT EXISTS commerce_b2b_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  line_total_minor INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_b2b_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT,
  CHECK (unit_price_minor >= 0),
  CHECK (line_total_minor >= 0)
);

CREATE INDEX IF NOT EXISTS idx_store_b2b_orders_customer ON commerce_b2b_orders(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_store_b2b_orders_rfq ON commerce_b2b_orders(rfq_id);
CREATE INDEX IF NOT EXISTS idx_store_b2b_orders_supplier ON commerce_b2b_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_store_b2b_orders_status ON commerce_b2b_orders(status);
CREATE INDEX IF NOT EXISTS idx_store_b2b_items_order ON commerce_b2b_order_items(order_id);
