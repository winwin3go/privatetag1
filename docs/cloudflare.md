# Cloudflare Integration Entry Point

This project follows the PrivateTag/Stronghold Cloudflare platform playbook. Before building or deploying a Worker, walk through the resources below so every service aligns with the shared foundation.

## 1. Foundation Repo (source of truth)

- `winwin3go/cf-foundation` (planned) &rarr; hosts strategy docs, platform conventions, and curated resource links.
- Key subpaths once the repo exists:
  - `docs/01_overview.md` & `02_workers_basics.md` for the baseline dev workflow.
  - `docs/03_data_services_kv_r2_d1.md`, `04_zero_trust_and_tunnels.md`, `05_ai_workers.md` for store-specific playbooks.
  - `docs/10_patterns_private-tag.md`, `11_patterns_stronghold.md` for product-ready patterns.
  - `links/cloudflare_docs_index.md`, `links/github_repos_index.md`, `links/awesome_lists.md` for curated links (see section 3).

## 2. Template Repos (bootstrap every Worker)

Each Worker/service should start from an org-level template so naming, bindings, and CI are consistent:

- `winwin3go/cf-worker-template-basic` → TypeScript Worker, KV binding example, Wrangler config.
- `winwin3go/cf-worker-template-r2-api` → File interfaces backed by R2.
- `winwin3go/cf-worker-template-d1-api` → D1 migrations plus multi-tenant query helpers.
- Optional additions:
  - `winwin3go/cf-worker-template-python`
  - `winwin3go/cf-worker-template-rust`

Templates must:

1. Reference cf-foundation docs (above) and official Cloudflare docs in their README files.
2. Ship `wrangler.toml` stubs with placeholder Worker names, KV/R2/D1 bindings, and logging patterns.
3. Include CODEOWNERS pointing to the Cloudflare platform maintainers.
4. Showcase how to wire GitHub repos to Cloudflare (Workers & Pages → Import repository) for auto-deploy.

## 3. Official Cloudflare Resources

Maintain these doc links in `cf-foundation/links/cloudflare_docs_index.md` and reference them from project READMEs:

- Cloudflare Developer Docs (root index)
- Workers platform overview
- Workers KV docs
- R2 docs (Pages/R2 sections)
- D1 docs
- Durable Objects / Queues docs
- Workers AI model catalog
- Workers quickstart templates (`npm create cloudflare@latest`)
- Workers CI/CD integration (GitHub + Wrangler)

GitHub repos to track in `links/github_repos_index.md`:

- `cloudflare/workers-sdk` (Wrangler CLI, Miniflare)
- `cloudflare/templates`
- `cloudflare/workers-rs`
- `cloudflare/workerd`
- `cloudflare/python-workers-examples`
- Cloudflare org index for other tooling (cloudflared, quiche, etc.)

Awesome-resource indexes for deeper research (capture in `links/awesome_lists.md`):

- Awesome Cloudflare Workers lists (multiple GitHub lists for routing/auth/proxy patterns)
- Awesome Cloudflare (general)

## 4. Shared Libraries

- `winwin3go/cf-worker-libs` (planned) centralizes TS/JS helpers for routing, JSON envelopes, auth, and bindings. Templates should install from this repo (direct git dep or private package).

## 5. Action Checklist for New Projects

1. Read cf-foundation overview/docs to align on conventions.
2. Pick the appropriate template repo and create a new repo via “Use this template”.
3. Update Worker name, bindings, and docs; install `cf-worker-libs`.
4. Connect the repo to Cloudflare via Workers & Pages Git integration (auto deploy on push).
5. Use Miniflare locally via `workers-sdk`.
6. Keep docs in sync by contributing back to cf-foundation.

This `docs/cloudflare.md` file is the single entry point for Cloudflare work inside `privatetag1`. Update it whenever templates or foundation docs evolve so every contributor and agent lands here first.
