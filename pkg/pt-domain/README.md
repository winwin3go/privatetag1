# @privatetag/pt-domain

PrivateTag-specific domain models and validation logic.

## Contract

- Defines `Tag`, `Space`, `CaptureSession`, and related types specific to PrivateTag.
- Provides validation helpers used by `apps/pt-photo`, `apps/pt-saas`, and dependent services.
- Normalizes interactions with shared services by adapting `@privatetag/x402-core` primitives.

Treat this package as the single source of truth for all PrivateTag domain shapes.
