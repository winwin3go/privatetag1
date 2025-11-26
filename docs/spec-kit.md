# Spec Kit Usage Guide

This repo uses Spec Kit (Specify CLI concepts) to run Spec-Driven Development without reinitializing the project.

## Lifecycle Commands

Use these slash commands inside the IDE/agent (Codex, Copilot, etc.). Each command loads the constitution plus the docs listed below:

- `/speckit.constitution` – Recap guardrails from `.specify/memory/constitution.md`.
- `/speckit.specify` – Create/update `specs/<id>-<slug>/spec.md`.
- `/speckit.clarify` – Ask targeted questions on the spec.
- `/speckit.plan` – Write `specs/<id>-<slug>/plan.md` mapping the spec to apps/svc/pkg/docs/tests.
- `/speckit.tasks` – Break the plan into `specs/<id>-<slug>/tasks.md`.
- `/speckit.checklist` – Maintain `specs/<id>-<slug>/checklists/requirements.md`.
- `/speckit.analyze` – Detect inconsistencies across spec/plan/tasks/code.
- `/speckit.implement` – Execute tasks, update code/tests/docs, and keep artifacts synced.

All prompts reference:

- `docs/product/pt-prd.md`
- `docs/product/sh-prd.md`
- `docs/product/x402-platform.md`
- `docs/architecture/overview.md`
- `docs/architecture/control-data-plane.md`
- `docs/architecture/workers-topology.md`
- `docs/ops/runbooks.md`

## Specs Folder

Use numbered folders under `specs/` (e.g., `specs/003-pt-photo-streaming/`). Each folder typically contains:

- `spec.md`
- `plan.md`
- `tasks.md`
- `checklists/requirements.md`

Create new folders via:

```
pnpm speckit:new-feature
```

## Helper Scripts

PowerShell helpers live under `.specify/scripts/powershell/`:

- `common.ps1` – Shared utilities.
- `check-task-prerequisites.ps1` – Ensures node, pnpm, wrangler exist. Run `pnpm speckit:check`.
- `create-new-feature.ps1` – Bootstraps a spec folder. Run `pnpm speckit:new-feature`.

## Workflow Example

1. `pnpm speckit:check`
2. `pnpm speckit:new-feature` (choose ID + slug)
3. `/speckit.specify`
4. `/speckit.clarify` (iterate until resolved)
5. `/speckit.plan`
6. `/speckit.tasks`
7. `/speckit.checklist`
8. `/speckit.implement`
9. `/speckit.analyze` before review

Throughout, keep `docs/` and tests synchronized, use pnpm scripts (`dev:*`, `migrate:*`, `test`), and ensure Cloudflare bindings remain accurate.
