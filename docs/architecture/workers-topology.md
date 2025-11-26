# Workers Topology

Current planned Workers include:

- `apps/pt-photo` — Data-plane photo capture MVP. Resolves TagIDs via `svc/tag-core` and sends uploads to `svc/media-core`.
- `apps/pt-saas` — Future PrivateTag SaaS web/API gateway.
- `apps/sh-home` — StrongHold home memory cloud portal.
- `apps/x402-portal` — Cross-product portal or SSO console.

- `svc/tag-core` — Control-plane TagID registry + action resolver (source of truth for Tag metadata).
- `svc/media-core` — Shared data-plane media abstraction layered on R2/D1 (upload + retrieve assets).
- `svc/st-idp` — SentinelTrust IdP gateway for authentication and SSO.
- `svc/np-core` — Notification Plane worker(s).
- `svc/audit-core` — Cross-product audit and event logging.

Each Worker has its own `wrangler.toml` and `src/index.ts`, and can be
deployed independently but share code via packages in `pkg/`.
