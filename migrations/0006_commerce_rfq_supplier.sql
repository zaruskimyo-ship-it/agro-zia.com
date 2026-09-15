ALTER TABLE commerce_rfqs ADD COLUMN supplier_id TEXT REFERENCES commerce_suppliers(id);
CREATE INDEX IF NOT EXISTS idx_commerce_rfqs_supplier ON commerce_rfqs(supplier_id);
