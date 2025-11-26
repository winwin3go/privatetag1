-- Optional demo photo record for local testing.
INSERT OR IGNORE INTO photo_records (tag_id, media_id, object_key, original_name, content_type, size, created_at)
VALUES (
  'TESTPHOTO1',
  'media-demo',
  'dev/TESTPHOTO1/demo.jpg',
  'demo.jpg',
  'image/jpeg',
  1024,
  datetime('now')
);
