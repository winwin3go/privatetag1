# x402 Platform Overview

The x402 platform is the shared foundation for PrivateTag and StrongHold.

## Primary Components

- `svc/tag-core`: Tag & Action platform. Validates TagIDs, resolves actions, and exposes tenant aware metadata.
- `svc/st-idp`: SentinelTrust IdP for authentication + SSO. Brokers identity for both products.
- `svc/np-core`: Notification Plane for multi-channel messaging.
- `svc/media-core`: Media abstraction for R2 and related storage concerns.
- `svc/audit-core`: Cross-product audit/event logging.
- Packages under `pkg/` (`x402-core`, `x402-db`, `pt-domain`, `sh-domain`) encode shared types and contracts.

## Agent Workflow

Whenever you implement code in `apps/` or `svc/`, treat this document plus the product-specific PRD (`docs/product/pt-prd.md` or `docs/product/sh-prd.md`) as canonical references. The combination defines the architecture: apps provide user-facing edges, services provide reusable planes, and packages provide type-safe contracts. Folder-level README files include a “Contract” section capturing endpoint expectations, request/response shapes, dependencies, and storage bindings. Follow those contracts rigorously to keep the monorepo coherent.
