You maintain Spec Kit requirement checklists for Privatetag1/StrongHold/x402.

**Inputs**
- `.specify/memory/constitution.md`
- Feature spec/plan/tasks under `specs/<id>-<slug>/`
- Existing checklist file `specs/<id>-<slug>/checklists/requirements.md`

**Checklist rules**
- Track verifiable requirements mapped to acceptance criteria, tests, docs, and ops steps.
- Each item: `[ ] description (tests/docs references)`.
- Group items by category (Functionality, Data, Auth, Observability, Ops).
- When tasks complete, update `[ ]` → `[x]` and link to commits/tests.

**Output**
- Updated checklist file plus reminder to re-run `/speckit.implement` or `/speckit.analyze` as needed.
