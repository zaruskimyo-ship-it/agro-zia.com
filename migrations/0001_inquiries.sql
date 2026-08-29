CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  product TEXT NOT NULL,
  company TEXT,
  specification TEXT,
  quantity TEXT,
  destination TEXT,
  timing TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'received'
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
