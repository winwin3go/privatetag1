# PrivateTag Product Requirements (Root)

This document is the root index for PrivateTag product requirements.

## Current Verticals

- `apps/pt-photo`: photo capture and upload Worker. Calls `svc/tag-core` for TagID validation and `svc/media-core` for media storage.
- `apps/pt-saas`: multi-tenant SaaS API surface and management UI. Orchestrates all PrivateTag experiences.
- `svc/tag-core`: shared registry for TagIDs plus action resolution.
- `svc/media-core`: shared media upload/serve plane.
- Shared packages in `pkg/pt-domain` capture PrivateTag-specific domain models.

## Guidance For Agents

When working on any PrivateTag code, read this file together with `docs/product/x402-platform.md` to understand the tag + action platform and common dependencies. Each folder in `apps/` and `svc/` contains a contract section describing the expected HTTP surface and downstream calls. Always reference those contracts when implementing new endpoints.

## Upcoming

- Inventory + event flows in `apps/pt-saas`.
- Additional capture channels (mobile / kiosk) reusing `pkg/pt-domain`.
