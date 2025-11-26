# x402-portal

Cross-product portal / SSO console skeleton.

## Contract

- **Purpose**: Unified entry point for ops, support, and admin flows across PrivateTag and StrongHold.
- **Endpoints**:
  - `/login` → bootstrap SSO via `svc/st-idp`.
  - `/tenants/*` → limited admin UIs backed by `svc/tag-core` and `pkg/x402-db`.
  - `/status` → status JSON referencing state from services.
- **Dependencies**:
  - Reads aggregated metrics from `svc/audit-core` and `svc/np-core`.
  - Uses shared UI config from `pkg/x402-core`.
- **Output**: HTML for dashboards with fetch calls to service APIs, JSON responses shaped `{ ok, summary }`.

Skeleton only; implementation will be added later.
