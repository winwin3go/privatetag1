# media-core

Media upload and serve abstraction for R2 skeleton.

## Contract

- **Endpoints**:
  - `POST /media` → accepts file stream + metadata `{ tagId, contentType }`, returns `{ mediaId }`.
  - `GET /media/{mediaId}` → streams binary payload; policy enforced via `svc/st-idp` token introspection.
  - `DELETE /media/{mediaId}` → tombstone operation emitting audit entry.
- **Bindings**: Cloudflare R2 bucket, KV for presigned URLs, optional Durable Object for upload coordination.
- **Dependencies**: Validates TagID with `svc/tag-core`; notifies `svc/np-core` on lifecycle events.
- **Clients**: `apps/pt-photo`, `apps/pt-saas`, `apps/sh-home`, and others needing binary storage.

Skeleton only; implementation will be added later.
