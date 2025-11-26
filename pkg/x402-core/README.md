# @privatetag/x402-core

Shared TypeScript types and helpers for the x402 platform.

## Contract

- Provides common response envelopes, auth token structs, tenant identifiers, and error codes.
- Consumed by every Worker via `import { ... } from "@privatetag/x402-core"`.
- Acts as the canonical definition for JSON payloads exchanged between `apps/` and `svc/`.

Changes to these contracts must be coordinated with both PrivateTag and StrongHold teams.
