# @privatetag/x402-db

Shared schema helpers and data-access utilities for D1/SQLite style stores.

## Contract

- Owns table definitions for Tag registry, audit logs, notification state, and tenant metadata.
- Exposes migration helpers consumed by services (`svc/tag-core`, `svc/audit-core`, `svc/np-core`).
- Provides query abstractions returning types from `@privatetag/x402-core`.

Any schema change must be versioned and referenced by the dependent Worker modules.
