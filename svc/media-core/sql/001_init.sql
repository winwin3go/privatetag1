DROP TABLE IF EXISTS photo_records;

CREATE TABLE photo_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  original_name TEXT,
  content_type TEXT,
  size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
