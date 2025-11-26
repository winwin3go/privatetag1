# x402 Platform Overview

The x402 platform is the shared foundation for PrivateTag and StrongHold.

It includes:

- A shared Tag and Action platform (TagID registry and action resolution).
- The SentinelTrust IdP (st-idp) for authentication and SSO.
- The Notification Plane (np-core) for multi-channel notifications.
- Shared media/storage abstractions for photos, documents, and binary assets.

Applications in `apps/` and services in `svc/` are expected to depend on
these shared capabilities via packages in `pkg/`.
