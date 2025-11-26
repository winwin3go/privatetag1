# Architecture Overview

This repository uses a monorepo layout:

- `apps/` — product-facing Cloudflare Worker applications (PrivateTag, StrongHold, portals).
- `svc/` — shared backend services (tag registry, media, IdP, notifications, audit).
- `pkg/` — shared TypeScript packages for types, domain models, and utilities.
- `infra/` — infrastructure configuration and templates.
- `docs/` — product, architecture, and operations documentation.

PrivateTag and StrongHold are distinct products that share a common x402
platform. The x402 components provide tagging, identity, notifications,
and storage primitives that all applications can reuse.
