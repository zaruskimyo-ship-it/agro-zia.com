CREATE TABLE IF NOT EXISTS commerce_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  quote_id TEXT NOT NULL,
  rfq_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  currency TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  quoted_amount_minor INTEGER NOT NULL,
  destination TEXT,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  buyer_company TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commerce_quotes(id),
  FOREIGN KEY (rfq_id) REFERENCES commerce_rfqs(id),
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id),
  FOREIGN KEY (product_id) REFERENCES commerce_products(id),
  CHECK (status IN ('pending_confirmation','confirmed','proforma_pending','payment_pending','sourcing','shipping','delivered','completed','cancelled','rejected')),
  CHECK (unit_price_minor >= 0),
  CHECK (quoted_amount_minor >= 0)
);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_quote ON commerce_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_rfq ON commerce_orders(rfq_id);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_supplier ON commerce_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_status ON commerce_orders(status);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_created_at ON commerce_orders(created_at);
