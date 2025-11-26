-- Seed demo TagIDs for local development.
INSERT OR IGNORE INTO tag_records (tag_id, tenant_id, status)
VALUES
  ('TESTPHOTO1', 'tenant-demo', 'active'),
  ('TESTPHOTO2', 'tenant-demo', 'active');

INSERT OR IGNORE INTO tag_actions (tag_id, action_type, target_type, target_value, note)
VALUES
  ('TESTPHOTO1', 'PHOTO_CAPTURE', 'service', 'media-core', 'Route uploads to media-core'),
  ('TESTPHOTO2', 'PHOTO_VIEW', 'url', 'https://example.com/demo-photo', 'Preview redirect');
