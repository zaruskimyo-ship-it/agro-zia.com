CREATE TABLE IF NOT EXISTS inquiry_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_number TEXT NOT NULL,
  created_at TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_data BLOB NOT NULL,
  FOREIGN KEY (request_number) REFERENCES inquiries(request_number)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_attachments_request_number ON inquiry_attachments(request_number);
