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
