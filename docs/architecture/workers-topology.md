# Workers Topology

Current planned Workers include:

- `apps/pt-photo` — Data-plane photo capture MVP. Accepts multipart form uploads (10 MB cap, JPEG/PNG/HEIC/WEBP), resolves TagIDs via `svc/tag-core`, and streams images to `svc/media-core`, then surfaces preview links + history.
- `apps/pt-saas` — Future PrivateTag SaaS web/API gateway.
- `apps/sh-home` — StrongHold home memory cloud portal.
- `apps/x402-portal` — Cross-product portal or SSO console.

- `svc/tag-core` — Control-plane TagID registry + action resolver (source of truth for Tag metadata).
- `svc/media-core` — Shared data-plane media abstraction layered on R2/D1 (upload + retrieve assets).
- `svc/st-idp` — SentinelTrust IdP gateway for authentication and SSO (stubbed `GET /whoami` for local dev).
- `svc/np-core` — Notification Plane worker(s).
- `svc/audit-core` — Cross-product audit and event logging (currently logs `POST /events` payloads to console).

Each Worker has its own `wrangler.toml` and `src/index.ts`, and can be
deployed independently but share code via packages in `pkg/`.
