# audit-core

Cross-product audit/event logging service skeleton.

## Contract

- **Endpoints**:
  - `POST /event` → accepts `{ source, actor, action, target, metadata }`.
  - `GET /event/{id}` → returns stored audit entry.
  - `GET /events?tenant={id}` → filtered view for admin tooling.
- **Storage**: Writes to D1 (authoritative) and streams to R2/log sinks for cold storage.
- **Dependencies**: None upstream besides optional identity introspection from `svc/st-idp`.
- **Consumers**: All Workers log sensitive operations here; `apps/x402-portal` queries it for dashboards.

Skeleton only; implementation will be added later.
