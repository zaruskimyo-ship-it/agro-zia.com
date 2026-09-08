CREATE TABLE IF NOT EXISTS commerce_quote_messages (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commerce_quotes(id),
  FOREIGN KEY (customer_account_id) REFERENCES customer_accounts(id)
);
CREATE INDEX IF NOT EXISTS idx_quote_messages_quote ON commerce_quote_messages(quote_id, created_at);

CREATE TABLE IF NOT EXISTS commerce_proformas (
  id TEXT PRIMARY KEY,
  proforma_number TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  currency TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  destination TEXT,
  incoterm TEXT,
  payment_terms TEXT,
  status TEXT NOT NULL DEFAULT 'issued',
  issued_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(order_id, version),
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  CHECK (version > 0),
  CHECK (amount_minor >= 0),
  CHECK (status IN ('draft','issued','superseded','cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_proformas_order ON commerce_proformas(order_id, version DESC);

CREATE TABLE IF NOT EXISTS commerce_payment_intents (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  proforma_id TEXT,
  provider TEXT NOT NULL DEFAULT 'unconfigured',
  provider_reference TEXT,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  FOREIGN KEY (proforma_id) REFERENCES commerce_proformas(id),
  CHECK (amount_minor >= 0),
  CHECK (status IN ('created','pending','authorized','paid','failed','cancelled','expired','refunded'))
);
CREATE INDEX IF NOT EXISTS idx_payment_order ON commerce_payment_intents(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS commerce_trade_protection (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'not_requested',
  outcome TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  CHECK (status IN ('not_requested','requested','eligible','active','claim_review','resolved')),
  CHECK (outcome IS NULL OR outcome IN ('released','refunded','partially_resolved','rejected','cancelled'))
);

CREATE TABLE IF NOT EXISTS commerce_shipments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'order_confirmed',
  carrier TEXT,
  tracking_number TEXT,
  origin TEXT,
  destination TEXT,
  eta TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  CHECK (status IN ('order_confirmed','sourcing','qc','ready_to_ship','booked','in_transit','customs','delivered','completed','hold','cancelled','lost','delayed'))
);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON commerce_shipments(order_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS commerce_qc_inspections (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT 'pending',
  scope TEXT,
  inspector TEXT,
  evidence_key TEXT,
  inspected_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  CHECK (result IN ('pending','pass','conditional','fail'))
);
CREATE INDEX IF NOT EXISTS idx_qc_order ON commerce_qc_inspections(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS commerce_transaction_documents (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  storage_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id),
  CHECK (status IN ('pending','available','revoked'))
);
CREATE INDEX IF NOT EXISTS idx_transaction_docs_order ON commerce_transaction_documents(order_id, created_at DESC);
