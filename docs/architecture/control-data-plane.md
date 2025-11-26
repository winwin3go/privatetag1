# Control Plane vs Data Plane

- The **control plane** is responsible for configuration and orchestration:
  tag definitions, action configuration, tenant settings, and security policies.

- The **data plane** is responsible for handling runtime traffic:
  resolving TagIDs, serving application UIs, handling uploads/downloads,
  and processing user interactions.

In this monorepo, control-plane logic is concentrated in shared services
(for example, tag-core and st-idp) and their data models, while data-plane
traffic is handled by product-specific apps in `apps/` and focused services
in `svc/`.
