# Operations Runbooks

## Local database prep

Each Worker that touches D1 ships with migrations + seed scripts. Run them via root-level pnpm scripts (Wrangler must be installed and logged in).

```
# Control plane (TagID registry + actions)
pnpm migrate:tag-core
pnpm seed:tag-core

# Media metadata (photo_records)
pnpm migrate:media-core
pnpm seed:media-core
```

Commands execute the SQL files in `svc/<worker>/sql/*.sql` against the preview DB defined in each `wrangler.toml`.

## Manual Wrangler commands (fallback)

If you need to run a single SQL file manually:

```
(cd svc/tag-core && wrangler d1 execute privatetag-db --local --config wrangler.toml --file=sql/001_init.sql)
```

Prefer the pnpm scripts above so new SQL files get added without changing local instructions. If you need to run a specific SQL file or target a different environment you can still use the filter scripts (`pnpm --filter svc/tag-core run migrate:local`, etc.).

## Deployment (scaffolding)

Each Worker now defines `[env.dev]` and `[env.stage]` blocks inside its `wrangler.toml`. Once real Cloudflare account IDs and resource IDs are known:

1. Update `account_id`, `database_id`, and `bucket_name` placeholders in the relevant env section.
2. Deploy using:
   ```
   pnpm --filter apps/pt-photo exec wrangler deploy --env dev
   pnpm --filter svc/tag-core exec wrangler deploy --env dev
   ```
3. Promote to stage via `--env stage`.

Workers remain on `wrangler dev` for local development; the env scaffolding exists so the promotion path is documented and ready.

## Future sections

- Deploying Workers and services.
- Managing Cloudflare bindings (D1, R2, KV, Durable Objects).
- Handling incidents and rollbacks.
- Routine maintenance tasks.
