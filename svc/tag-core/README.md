# tag-core

Tag registry and action resolver service skeleton.

## Contract

- **Endpoints**:
  - `GET /tag/{tagId}` → returns `{ tagId, tenantId, status, actions[] }`.
  - `POST /tag/{tagId}/actions` → configure action routes, expects `{ actions: [...] }`.
  - `POST /resolve` → given `{ tagId, context }`, returns action resolution payload used by apps.
- **Storage/Bindings**: Will attach to a D1 database for registry data and KV cache for hot tags.
- **Dependencies**: Emits audit events (`svc/audit-core`) and optional notifications (`svc/np-core`).
- **Consumers**: All apps in `apps/` use this service before performing Tag-specific work.

Skeleton only; implementation will be added later.
