# privatetag1

Combined PrivateTag / StrongHold / x402 monorepo.

## Key folders

- `apps/` – product-facing Workers for PrivateTag, StrongHold, and shared portals.
- `svc/` – shared backend services powering tags, media, identity, notifications, and audit.
- `pkg/` – shared TypeScript packages with domain models, core utilities, and schemas.
- `infra/` – infrastructure configuration snippets for Cloudflare, Wrangler, Docker, etc.
- `docs/` – product requirements, architecture overviews, and ops runbooks.

```
privatetag1/
├── apps/
├── svc/
├── pkg/
├── infra/
└── docs/
```

## Cloudflare Platform Entry Point

Cloudflare Worker conventions, templates, and integration prompts live in `docs/cloudflare.md` and `docs/cloudflare_prompt.md`. Review them before modifying bindings or adding new Workers so everything aligns with the org-level cf-foundation and template repos.

## Spec-Driven Development (Spec Kit)

This repo adopts Spec Kit for feature work:

- Constitution: `.specify/memory/constitution.md`
- Prompts for `/speckit.*`: `.github/prompts/`
- Specs repository: `specs/<id>-<slug>/` (create via `pnpm speckit:new-feature`)
- Helper scripts: `.specify/scripts/powershell/` (`pnpm speckit:check`, `pnpm speckit:new-feature`)
- Workflow details: `docs/spec-kit.md`

Run `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.checklist`, `/speckit.implement`, `/speckit.analyze`, `/speckit.constitution`, and `/speckit.clarify` inside your IDE/agent to drive new development. Keep specs, plans, tasks, checklists, docs, and tests in sync at all times.
