# @privatetag/sh-domain

StrongHold-specific domain models and helpers.

## Contract

- Covers `Home`, `Vault`, `Memory`, `HouseholdMember`, and synchronization primitives.
- Used by `apps/sh-home` plus any StrongHold-specific services.
- Bridges shared x402 data (tag metadata, media handles) into StrongHold concepts.

Changes here must remain backward compatible with existing StrongHold deployments.
