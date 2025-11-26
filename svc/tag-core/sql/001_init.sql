-- Basic dev schema and sample data for tag-core D1 database.

DROP TABLE IF EXISTS tag_records;
DROP TABLE IF EXISTS tag_actions;

CREATE TABLE tag_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tag_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_value TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tag_id) REFERENCES tag_records(tag_id)
);

INSERT INTO tag_records (tag_id, tenant_id, status)
VALUES
  ('TESTPHOTO1', 'tenant-demo', 'active'),
  ('TESTPHOTO2', 'tenant-demo', 'active'),
  ('TESTVIEW1', 'tenant-demo', 'active');

INSERT INTO tag_actions (tag_id, action_type, target_type, target_value, note)
VALUES
  ('TESTPHOTO1', 'PHOTO_CAPTURE', 'service', 'media-core', 'Route uploads to media-core'),
  ('TESTPHOTO2', 'PHOTO_VIEW', 'url', 'https://example.com/demo-photo', 'Preview redirect'),
  ('TESTVIEW1', 'REDIRECT', 'url', 'https://example.com/info', 'Marketing redirect');
