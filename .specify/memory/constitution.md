# PrivateTag1 / StrongHold / x402 Constitution

These guardrails apply to every spec, plan, checklist, task, and implementation.

## Architecture & Boundaries

- **Apps define product edges.** Code under `apps/` exposes user-facing Workers (PrivateTag, StrongHold, portal). Business logic lives in `svc/`/`pkg/`, not in apps.
- **Services own state.** Workers under `svc/` each have a clear responsibility (tag-core, media-core, st-idp, np-core, audit-core). Never mix responsibilities or bypass their APIs.
- **Packages share types only.** `pkg/` modules contain type-safe contracts, utilities, and domain models. No direct Cloudflare bindings or IO in packages.
- **Docs stay in sync.** Every spec/plan/update must reference and update `docs/product/*`, `docs/architecture/*`, and `docs/ops/*` when behavior changes.

## Security & PII

- Never log raw secrets, auth tokens, or uploaded payloads. Use opaque IDs (`mediaId`, `tagId`) and redact user data.
- Always validate TagIDs through tag-core before acting on them. Media uploads must verify size/type and pass through media-core.
- Authentication must flow through SentinelTrust (st-idp). Until real auth exists, use the stub but keep code ready for bearer/JWT enforcement.

## Cloudflare & Tooling

- All Workers target the modern runtime (Wrangler v4+). Bindings: D1 for relational data, R2 for assets, KV/DO only when justified. Service bindings connect apps ⇄ svc.
- Maintain pnpm workspace integrity. Scripts must run cross-platform (PowerShell helpers preferred; add POSIX only if needed).
- Tests run with Vitest + Miniflare. Add coverage for every new contract, service, or shared helper.

## Spec-Driven Development

- Specs reference the docs above plus this constitution. They include motivation, scope, acceptance criteria, non-goals, and open questions.
- Plans map specs to concrete code changes (which apps/svc/pkg/docs/tests). Include Cloudflare bindings, migrations, and rollout steps.
- Tasks are incremental, testable steps executable via pnpm + Wrangler. Each task states expected artifacts (files, tests, docs).
- Implementations must keep specs, plans, tasks, and checklists in sync. No coding without an accepted spec/plan unless performing maintenance/bugfixes with documented reasoning.

## Testing & Quality

- Every feature requires unit tests (pkg level) and Worker integration tests (Miniflare) covering happy path and failure modes.
- Changes touching D1/R2 must have migration/seed updates plus rollback notes.
- Docs and READMEs include reproducible instructions (`pnpm dev:*`, `pnpm migrate:*`, `pnpm speckit:*`).

## Collaboration

- Use Spec Kit commands (`/speckit.*`) for feature lifecycle. Keep specs under `specs/<id>-<slug>/`.
- Constitution changes require checklist completion and team review (see `constitution_update_checklist.md`).
- Agents must mention assumptions, TODOs, and follow-up tasks explicitly in specs/plans/tasks.
