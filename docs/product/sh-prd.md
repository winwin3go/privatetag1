# StrongHold Product Requirements (Root)

This document is the root index for StrongHold product requirements.

## Core Modules

- `apps/sh-home`: cloud-side portal for the StrongHold Home Memory System. Talks to `svc/st-idp` for auth and `svc/tag-core`/`svc/media-core` for shared data planes.
- `pkg/sh-domain`: models Home, Vault, Memory entities and serves as the shared schema across StrongHold code.
- Shared services (`svc/st-idp`, `svc/audit-core`, `svc/np-core`) provide authentication, auditing, and notifications for StrongHold as well as PrivateTag.

## Context For Agents

Pair this document with `docs/product/x402-platform.md` before modifying StrongHold code so the relationship between local nodes, cloud vault, and shared x402 services stays consistent. Each folder under `apps/` and `svc/` contains contract sections summarizing endpoints and dependencies—follow them when extending StrongHold functionality.
