# st-idp

SentinelTrust IdP gateway skeleton for auth and SSO.

## Contract

- **Endpoints**:
  - `POST /login` → exchanges credentials/OIDC tokens for session cookies or JWTs.
  - `POST /token/introspect` → verifies tokens for other Workers.
  - `GET /userinfo` → returns `{ tenantId, profile, roles[] }`.
- **Bindings**: D1 for tenant + identity records, KV for session caching.
- **Dependencies**: Emits events to `svc/audit-core`; optionally uses `svc/np-core` for MFA notifications.
- **Consumers**: All apps/services rely on its JWTs/bearer tokens; contract defined via `pkg/x402-core` auth types.

Skeleton only; implementation will be added later.
