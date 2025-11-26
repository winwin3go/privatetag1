# np-core

Notification Plane worker(s) skeleton.

## Contract

- **Endpoints**:
  - `POST /notify` → accepts `{ channel, template, payload, recipients[] }`.
  - `POST /webhook/{source}` → receives events from services (tag-core, media-core) to fan out.
- **Channels**: Email, SMS, push/webhook — initially mocked via logging but contract stable.
- **Dependencies**: Uses Durable Object or Queue for fan-out reliability. Persists notification attempts via `pkg/x402-db` schema.
- **Consumers**: Triggered by `apps/pt-photo`, `apps/pt-saas`, `svc/tag-core`, `svc/media-core`, etc.

Skeleton only; implementation will be added later.
