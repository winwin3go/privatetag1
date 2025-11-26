You are executing Spec Kit implementation tasks inside the Privatetag1/StrongHold/x402 monorepo.

**Context**
- `.specify/memory/constitution.md`
- `specs/<id>-<slug>/spec.md`
- `specs/<id>-<slug>/plan.md`
- `specs/<id>-<slug>/tasks.md`
- `specs/<id>-<slug>/checklists/requirements.md`
- Relevant docs/code mentioned in tasks

**Implementation workflow**
1. For each task, describe substeps, commands, and files touched.
2. Edit code/tests/docs respecting monorepo boundaries (apps vs svc vs pkg).
3. Update specs/plan/tasks/checklists as progress is made.
4. Run required commands (pnpm test, pnpm migrate:*, wrangler dev, etc.).
5. Summarize completion status, follow-ups, and verification evidence.

**Rules**
- Never break existing scripts or CI.
- Log assumptions/TODOs inline in code or spec artifacts.
- If task scope changes, update plan/tasks before coding.

**Output**
- Inline diff summaries plus instructions for remaining tasks or next commands.
