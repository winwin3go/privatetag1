# pt-saas

PrivateTag SaaS web/API gateway skeleton.

## Contract

- **HTTP Surface**: `/api/*` JSON endpoints plus `/app/*` HTML shells for the PrivateTag management console.
- **Requests/Responses**: JSON envelope `{ status, data, errors[] }` using helpers from `pkg/x402-core`.
- **Dependencies**:
  - Reads/updates Tag metadata via `svc/tag-core`.
  - Initiates file workflows through `svc/media-core`.
  - Authenticated via `svc/st-idp` tokens.
  - Emits audit events to `svc/audit-core` and notifications to `svc/np-core`.
- **State**: Reads/writes configuration models via `pkg/pt-domain` and `pkg/x402-db`.

Skeleton only; implementation will be added later.
