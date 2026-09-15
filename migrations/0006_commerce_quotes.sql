CREATE TABLE IF NOT EXISTS commerce_quotes (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  rfq_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  packaging_cost_minor INTEGER NOT NULL DEFAULT 0,
  shipping_cost_minor INTEGER NOT NULL DEFAULT 0,
  insurance_cost_minor INTEGER NOT NULL DEFAULT 0,
  other_fees_minor INTEGER NOT NULL DEFAULT 0,
  total_amount_minor INTEGER NOT NULL,
  lead_time TEXT,
  validity_until TEXT,
  payment_terms TEXT,
  incoterm TEXT,
  destination TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (rfq_id) REFERENCES commerce_rfqs(id),
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id),
  FOREIGN KEY (product_id) REFERENCES commerce_products(id),
  CHECK (status IN ('draft','sent','negotiating','accepted','rejected','expired','withdrawn')),
  CHECK (unit_price_minor >= 0),
  CHECK (packaging_cost_minor >= 0),
  CHECK (shipping_cost_minor >= 0),
  CHECK (insurance_cost_minor >= 0),
  CHECK (other_fees_minor >= 0),
  CHECK (total_amount_minor >= 0)
);

CREATE INDEX IF NOT EXISTS idx_commerce_quotes_rfq ON commerce_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_commerce_quotes_supplier ON commerce_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_commerce_quotes_product ON commerce_quotes(product_id);
CREATE INDEX IF NOT EXISTS idx_commerce_quotes_status ON commerce_quotes(status);
CREATE INDEX IF NOT EXISTS idx_commerce_quotes_created_at ON commerce_quotes(created_at);
