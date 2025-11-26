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

## Local Development Flow

1. Install dependencies once with `pnpm install`.
2. Run each Worker in its own terminal (Wrangler + Miniflare automatically boot D1+R2 previews):
   - `pnpm dev:tag-core` → control-plane Tag registry at http://127.0.0.1:8788
   - `pnpm dev:media-core` → media data-plane abstraction at http://127.0.0.1:8789
   - `pnpm dev:pt-photo` → photo capture MVP at http://127.0.0.1:8787
3. Wrangler creates isolated preview D1 databases (`DB` binding) and R2 buckets (`MEDIA_BUCKET`) per Worker; production IDs are configured later via Cloudflare dashboards/Terraform.
4. Seed the shared D1 database with demo TagIDs when running locally:
   ```
   wrangler d1 execute privatetag-db --local --file=svc/tag-core/sql/001_init.sql
   ```
5. (Optional) Initialize the media metadata table:
   ```
   wrangler d1 execute privatetag-db --local --file=svc/media-core/sql/001_init.sql
   ```
6. The pt-photo Worker calls tag-core and media-core via service bindings (or the documented local fallbacks) so you can exercise the entire flow using the stub UI at `/`.
