CREATE TABLE IF NOT EXISTS commerce_rfqs (
  id TEXT PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'submitted',
  language TEXT NOT NULL DEFAULT 'en',
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT,
  destination_country TEXT,
  destination_location TEXT,
  packaging TEXT,
  private_label TEXT,
  sample_required INTEGER NOT NULL DEFAULT 0,
  documents_required TEXT,
  target_timing TEXT,
  description TEXT,
  buyer_company TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  attachment_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id),
  CHECK (status IN ('submitted','reviewing','matched','quoted','negotiating','converted','cancelled')),
  CHECK (sample_required IN (0,1)),
  CHECK (attachment_count >= 0 AND attachment_count <= 10)
);

CREATE INDEX IF NOT EXISTS idx_commerce_rfqs_status ON commerce_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_commerce_rfqs_product ON commerce_rfqs(product_id);
CREATE INDEX IF NOT EXISTS idx_commerce_rfqs_created_at ON commerce_rfqs(created_at);
