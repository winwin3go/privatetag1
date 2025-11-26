# pt-photo

First-stage PrivateTag Photo Capture application skeleton.

## Contract

- **HTTP Surface**: `/capture` HTML/JS UI plus `/api/upload` Worker endpoint receiving multipart uploads.
- **Call Flow**:
  - Validate TagID + tenant context through `svc/tag-core`.
  - Stream binary payloads to `svc/media-core` to obtain `mediaId`.
  - Persist capture metadata using types from `pkg/pt-domain`.
  - Trigger notifications via `svc/np-core` after a successful upload.
- **Responses**: Return JSON `{ mediaId, tagId, status }` for API calls and success/error pages for UI.
- **Auth**: Requires session tokens issued by `svc/st-idp` (bearer or cookie).

Skeleton only; implementation will be added later.

## Local Dev Instructions

1. Install deps once: `pnpm install`.
2. Seed the shared D1 tables:
   ```
   wrangler d1 execute privatetag-db --local --file=svc/tag-core/sql/001_init.sql
   wrangler d1 execute privatetag-db --local --file=svc/media-core/sql/001_init.sql
   ```
3. Run Workers in separate terminals:
   - `pnpm dev:tag-core`
   - `pnpm dev:media-core`
   - `pnpm dev:pt-photo`
4. Navigate to http://127.0.0.1:8787, enter TagID `TESTPHOTO1`, pick an image (JPEG/PNG/HEIC/HEIF/WEBP, ≤10 MB), and upload. Wrangler logs will show the tag-core lookup, media-core R2 write, and D1 insert. The confirmation panel displays the metadata returned by media-core.
5. Use the “Preview stored object” link in the success panel (or curl the media-core endpoint) to download the file streamed back from the R2 preview bucket via `svc/media-core`.
6. Scroll down to view the “Recent captures” table. It calls `svc/media-core`’s listing endpoint to show the latest entries from the shared D1 table, ensuring the UI stays in sync even when other apps create captures.

## Form Fields

- `tag_id` (text, required): TagID validated via `svc/tag-core`.
- `photo` (file, required): Accepts image MIME types defined in `pkg/pt-domain` (`SUPPORTED_IMAGE_TYPES`). Uploads larger than `MAX_CAPTURE_FILE_SIZE_BYTES` (10 MB) are rejected before sending to media-core.

## Auth & Audit Stubs

- `svc/st-idp` binding exposes `GET /whoami`, returning a stub `AuthContext`. pt-photo best-effort fetches it to annotate audit events.
- `svc/audit-core` binding accepts `POST /events`. pt-photo emits `PHOTO_UPLOAD_REQUESTED` + `PHOTO_UPLOAD_COMPLETED`, while `svc/media-core` emits `PHOTO_STORED`/`PHOTO_DELETED`. If either stub is offline, the user upload flow still succeeds (warnings are logged).

## Auth & Audit stubs

- The Worker fetches a temporary `AuthContext` from `svc/st-idp` (`GET /whoami`) to simulate a logged-in device.
- Every upload emits `AuditEvent`s (`PHOTO_UPLOAD_REQUESTED`, `PHOTO_UPLOAD_COMPLETED`) to `svc/audit-core`. Media-core emits `PHOTO_STORED`/`PHOTO_DELETED` as well. All calls are best-effort; failures are logged but do not break the user flow.
