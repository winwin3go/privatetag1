# media-core

Media upload and serve abstraction for R2 skeleton.

## Contract

- **Endpoints**:
  - `POST /media` → accepts file stream + metadata `{ tagId, contentType }`, returns `{ mediaId }`.
  - `GET /media/{mediaId}` → streams binary payload from R2; policy enforcement TBD once `svc/st-idp` integrates.
  - `DELETE /media/{mediaId}` → tombstone operation emitting audit entry.
- **Bindings**: Cloudflare R2 bucket, KV for presigned URLs, optional Durable Object for upload coordination.
- **Dependencies**: Validates TagID with `svc/tag-core`; notifies `svc/np-core` on lifecycle events.
- **Clients**: `apps/pt-photo`, `apps/pt-saas`, `apps/sh-home`, and others needing binary storage.

Skeleton only; implementation will be added later.

### Local Dev Setup

Seed the D1 table used for media metadata before exercising uploads:

```
wrangler d1 execute privatetag-db --local --file=svc/media-core/sql/001_init.sql
```

R2 buckets are auto-created by Wrangler/Miniflare during `wrangler dev`.
### Downloading stored media

While running locally you can fetch the raw object from media-core by hitting:

```
curl http://127.0.0.1:8789/media/<PHOTO_ID>
```

This routes through the Worker, which looks up the metadata in D1 (`photo_records`) and streams the object from the preview R2 bucket. Authentication/authorization will be layered on once the SentinelTrust IdP is wired in.

### Tag validation

Uploads are rejected if the TagID does not exist in `tag_records`. Seed data (via `svc/tag-core/sql/001_init.sql`) must be applied before exercising media-core locally; otherwise you will receive a 404 error with `{"error":"Unknown TagID"}`.

### Deleting objects

During local development you can delete a stored object to re-run flows:

```
curl -X DELETE http://127.0.0.1:8789/media/<PHOTO_ID>
```

This removes the row from `photo_records` and deletes the blob from the preview R2 bucket. In production, deletion will also trigger audit-core + notification events.

### Listing recent captures

For debugging or admin tooling, media-core exposes a lightweight listing endpoint:

```
curl "http://127.0.0.1:8789/media?limit=5"
```

Response example:

```json
[
  {
    "media_id": "media-123",
    "tag_id": "TESTPHOTO1",
    "filename": "sample.jpg",
    "created_at": "2025-11-25T20:10:11.000Z"
  }
]
```

Use this endpoint sparingly; full-text search + pagination will come via dedicated admin Workers later.
