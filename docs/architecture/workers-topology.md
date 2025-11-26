# Workers Topology

Current planned Workers include:

- `apps/pt-photo` — First-stage PrivateTag Photo Capture application.
- `apps/pt-saas` — Future PrivateTag SaaS web/API gateway.
- `apps/sh-home` — StrongHold home memory cloud portal.
- `apps/x402-portal` — Cross-product portal or SSO console.

- `svc/tag-core` — Tag registry and action resolver.
- `svc/media-core` — Media upload/serving abstraction over R2.
- `svc/st-idp` — SentinelTrust IdP gateway for authentication and SSO.
- `svc/np-core` — Notification Plane worker(s).
- `svc/audit-core` — Cross-product audit and event logging.

Each Worker has its own `wrangler.toml` and `src/index.ts`, and can be
deployed independently but share code via packages in `pkg/`.
