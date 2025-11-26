# audit-core

Cross-product audit/event logging service skeleton.

## Contract

- **Endpoints**:
  - `POST /events` → accepts an array of audit events (during local dev they are logged to console).
  - Future additions: `GET /event/{id}`, `GET /events?tenant={id}` for filtered views.
- **Storage**: Writes to D1 (authoritative) and streams to R2/log sinks for cold storage.
- **Dependencies**: None upstream besides optional identity introspection from `svc/st-idp`.
- **Consumers**: All Workers log sensitive operations here; `apps/x402-portal` queries it for dashboards.

Skeleton only; implementation will be added later.

## Local stub behavior

- `POST /events` logs events to the Wrangler console and returns `{ status: "ok", received: <n> }`.
- `GET /health` reports readiness.
