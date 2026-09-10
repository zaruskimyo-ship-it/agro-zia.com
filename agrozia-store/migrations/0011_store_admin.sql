-- Stage 12: independent Store Admin sessions for agrozia.ir.
-- Admin identity is intentionally separate from customer identity and legacy agro-zia.com admin auth.
CREATE TABLE IF NOT EXISTS store_admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_store_admin_sessions_expiry ON store_admin_sessions(expires_at);
