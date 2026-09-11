CREATE TABLE IF NOT EXISTS commerce_supplier_quote_messages (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  supplier_account_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commerce_quotes(id),
  FOREIGN KEY (supplier_account_id) REFERENCES supplier_accounts(id),
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_quote_messages_quote
  ON commerce_supplier_quote_messages(quote_id, created_at);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_messages_supplier
  ON commerce_supplier_quote_messages(supplier_id, created_at);
