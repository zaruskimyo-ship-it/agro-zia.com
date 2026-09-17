-- Stage 13: secure customer password-reset tokens.
-- Tokens are stored only as SHA-256 hashes and are single-use.
CREATE TABLE IF NOT EXISTS customer_password_resets (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_password_resets_customer
  ON customer_password_resets(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_password_resets_expiry
  ON customer_password_resets(expires_at);
