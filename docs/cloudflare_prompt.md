# Prompt: Add Cloudflare Resources To `privatetag1`

Use the text below verbatim (or adapt it) whenever an agent/person needs to provision the Cloudflare foundation and wire this repo into that stack.

```
You are a Cloudflare platform engineer for winwin3go. Your task is to stand up the Cloudflare foundation for the org and make sure the `privatetag1` repo is wired into it.

1. Create the org-level knowledge base repo `winwin3go/cf-foundation` with:
   - README summarizing the Cloudflare platform strategy.
   - `docs/` files: 01_overview, 02_workers_basics, 03_data_services_kv_r2_d1, 04_zero_trust_and_tunnels, 05_ai_workers, 10_patterns_private-tag, 11_patterns_stronghold.
   - `links/` files: `cloudflare_docs_index.md`, `github_repos_index.md`, `awesome_lists.md` populated with the resources spelled out in this prompt (Workers docs, KV/R2/D1 docs, Durable Objects/Queues, Workers AI, quickstarts, CI/CD, workers-sdk, templates, workers-rs, workerd, python examples, Cloudflare org index, awesome lists).

2. Create Cloudflare template repos and flip on GitHub’s template flag:
   - `winwin3go/cf-worker-template-basic`: TypeScript Worker, KV binding, Wrangler config, README instructions, CODEOWNERS.
   - `winwin3go/cf-worker-template-r2-api`: focus on R2 upload/download flows.
   - `winwin3go/cf-worker-template-d1-api`: D1 migrations + query helpers.
   - Optional templates for Python (`python-workers-examples`) and Rust (`workers-rs`).

3. Create `winwin3go/cf-worker-libs` with reusable TS/JS helpers (routing, JSON envelopes, logging, auth, KV/R2/D1 binding helpers). Publish instructions for installing it via git+ssh or as a package.

4. Wire GitHub repos to Cloudflare Workers via the Workers & Pages Git integration:
   - Document the click-path (Workers & Pages → Create application → Import repository) plus environment variable/binding setup.
   - Provide (or link to) GitHub Actions samples using Wrangler + CF API tokens for CI deploys.

5. Update `privatetag1`:
   - Ensure `docs/cloudflare.md` points to cf-foundation and template repos as the entry point.
   - Reference cf-foundation docs from the project README or contributing guide.
   - Confirm a CODEOWNERS entry routes Worker changes to the Cloudflare platform maintainers.

6. Capture any new learnings back in cf-foundation (patterns, naming, auth, multitenant practices for PrivateTag/Stronghold).

Deliverables: populated cf-foundation repo, template repos marked as templates, cf-worker-libs package, and `privatetag1` docs linking into that ecosystem so future AI/agents can onboard instantly.
```

Keep this prompt alongside `docs/cloudflare.md` so future automation can bootstrap the Cloudflare stack without re-reading the full chat history.
