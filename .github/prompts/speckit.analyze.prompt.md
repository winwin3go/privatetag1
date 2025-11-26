You are running the Spec Kit analysis pass for Privatetag1/StrongHold/x402.

**Inputs**
- `.specify/memory/constitution.md`
- Feature spec/plan/tasks/checklists under `specs/<id>-<slug>/`
- Recent git history or PR diff if supplied
- Architecture/docs references

**Responsibilities**
- Detect inconsistencies between spec ↔ plan ↔ tasks ↔ code (apps/svc/pkg/docs/tests).
- Verify Cloudflare bindings, migrations, and scripts mentioned in plan actually exist or are planned.
- Identify missing tests, docs, or checklist items.
- Suggest follow-up actions or new tasks referencing file paths.

**Output**
- Narrative report (bulleted) summarizing findings, severity, and recommended next command (`/speckit.checklist` or `/speckit.implement`).
