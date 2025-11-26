$root = "C:\Users\ScottAllen\privatetag1"

$createdDirs = 0
$createdFiles = 0
$skippedFiles = 0

function Ensure-Directory {
  param(
    [Parameter(Mandatory = $true)][string]$Path
  )
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
    $script:createdDirs++
    Write-Host "Created directory: $Path"
  }
}

function Ensure-File {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Content
  )

  if (Test-Path -LiteralPath $Path) {
    Write-Host "File already exists, skipping: $Path"
    $script:skippedFiles++
    return
  }

  $directory = Split-Path -Parent $Path
  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory | Out-Null
    $script:createdDirs++
    Write-Host "Created directory: $directory"
  }

  $Content | Out-File -FilePath $Path -Encoding UTF8 -Force
  $script:createdFiles++
  Write-Host "Created file: $Path"
}

$dirPaths = @(
  $root,
  "$root\.github",
  "$root\.github\workflows",
  "$root\apps\pt-saas\src",
  "$root\apps\pt-photo\src",
  "$root\apps\sh-home\src",
  "$root\apps\x402-portal\src",
  "$root\svc\tag-core\src",
  "$root\svc\media-core\src",
  "$root\svc\st-idp\src",
  "$root\svc\np-core\src",
  "$root\svc\audit-core\src",
  "$root\pkg\x402-core\src",
  "$root\pkg\x402-db\src",
  "$root\pkg\pt-domain\src",
  "$root\pkg\sh-domain\src",
  "$root\infra\cf",
  "$root\infra\local\docker",
  "$root\docs\product",
  "$root\docs\architecture",
  "$root\docs\ops"
)

foreach ($dir in $dirPaths) {
  Ensure-Directory -Path $dir
}

$rootReadme = @"
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
"@

$rootPackage = @"
{
  "name": "privatetag1",
  "private": true,
  "scripts": {
    "build": "echo \"Implement build per app/service later\"",
    "lint": "echo \"Linting to be added\""
  },
  "devDependencies": {
    "eslint": "*",
    "prettier": "*",
    "typescript": "*"
  },
  "dependencies": {}
}
"@

$pnpmWorkspace = @"
packages:
  - "apps/*"
  - "svc/*"
  - "pkg/*"
"@

$tsconfigBase = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
"@

$gitignore = @"
node_modules/
dist/
.wrangler/
.env
.DS_Store
*.log
"@

$editorconfig = @"
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
"@

$ciYaml = @"
name: CI

on:
  push:
  pull_request:

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Install dependencies
        run: pnpm install
      - name: Lint
        run: pnpm lint
      - name: Build
        run: pnpm build
"@

Ensure-File -Path "$root\README.md" -Content $rootReadme
Ensure-File -Path "$root\package.json" -Content $rootPackage
Ensure-File -Path "$root\pnpm-workspace.yaml" -Content $pnpmWorkspace
Ensure-File -Path "$root\tsconfig.base.json" -Content $tsconfigBase
Ensure-File -Path "$root\.gitignore" -Content $gitignore
Ensure-File -Path "$root\.editorconfig" -Content $editorconfig
Ensure-File -Path "$root\.github\workflows\ci.yml" -Content $ciYaml

$appNames = @{
  "pt-saas" = "PrivateTag SaaS web/API gateway"
  "pt-photo" = "First-stage PrivateTag Photo Capture app"
  "sh-home" = "StrongHold cloud-side home memory portal"
  "x402-portal" = "Cross-product portal / SSO console"
}

foreach ($app in $appNames.GetEnumerator()) {
  $name = $app.Key
  $description = $app.Value
  $path = "$root\apps\$name"
  Ensure-File -Path "$path\wrangler.toml" -Content @"
name = "$name"
main = "src/index.ts"
compatibility_date = "2025-01-01"

# TODO: add D1, R2, KV, and other bindings as needed
"@
  Ensure-File -Path "$path\src\index.ts" -Content @"
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("TODO: implement $name", { status: 200 })
  }
}
"@
  Ensure-File -Path "$path\README.md" -Content @"
# $name

Intended to serve as $description.

- Responsibility 1: Define the Worker surface and routes.
- Responsibility 2: Integrate with shared packages in `pkg/`.
- Responsibility 3: Capture telemetry and logging patterns.

Skeleton only; implementation will be added later.
"@
}

$svcNames = @{
  "tag-core" = "Tag registry + action resolver service"
  "media-core" = "Media upload/serve abstraction over R2"
  "st-idp" = "SentinelTrust IdP gateway for auth/SSO"
  "np-core" = "Notification Plane worker(s)"
  "audit-core" = "Cross-product audit/event log"
}

foreach ($svc in $svcNames.GetEnumerator()) {
  $name = $svc.Key
  $description = $svc.Value
  $path = "$root\svc\$name"
  Ensure-File -Path "$path\wrangler.toml" -Content @"
name = "$name"
main = "src/index.ts"
compatibility_date = "2025-01-01"

# TODO: add D1, R2, KV, and other bindings as needed
"@
  Ensure-File -Path "$path\src\index.ts" -Content @"
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("TODO: implement $name", { status: 200 })
  }
}
"@
  Ensure-File -Path "$path\README.md" -Content @"
# $name

$description in the privatetag1 platform.

- Responsibility 1: Expose APIs via Cloudflare Workers.
- Responsibility 2: Share domain logic via `pkg/`.
- Responsibility 3: Follow the cf-foundation guidance from docs.

Skeleton only; implementation will be added later.
"@
}

$pkgNames = @("x402-core", "x402-db", "pt-domain", "sh-domain")

foreach ($pkg in $pkgNames) {
  $pkgPath = "$root\pkg\$pkg"
  $pkgJson = @"
{
  "name": "@privatetag/$pkg",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "echo \"build $pkg later\""
  },
  "dependencies": {},
  "devDependencies": {}
}
"@
  $tsconfig = @"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
"@
  Ensure-File -Path "$pkgPath\package.json" -Content $pkgJson
  Ensure-File -Path "$pkgPath\tsconfig.json" -Content $tsconfig
  Ensure-File -Path "$pkgPath\src\index.ts" -Content @"
export const placeholder = "TODO: implement @privatetag/$pkg";
"@
}

$docs = @{
  "$root\docs\product\pt-prd.md" = @"
# PrivateTag Product Requirements (Root)

This document is the root index for PrivateTag product requirements.
It will reference more detailed PRDs, including the first-stage Photo Capture
application (`apps/pt-photo`) and future inventory, event, and tagging flows.
"@

  "$root\docs\product\sh-prd.md" = @"
# StrongHold Product Requirements (Root)

This document is the root index for StrongHold product requirements.
It will describe the StrongHold Home Memory System, vault, local node,
and cloud coordination aspects as they are defined.
"@

  "$root\docs\product\x402-platform.md" = @"
# x402 Platform Overview

The x402 platform is the shared foundation for PrivateTag and StrongHold.

It includes:

- A shared Tag and Action platform (TagID registry and action resolution).
- The SentinelTrust IdP (st-idp) for authentication and SSO.
- The Notification Plane (np-core) for multi-channel notifications.
- Shared media/storage abstractions for photos, documents, and binary assets.

Applications in `apps/` and services in `svc/` are expected to depend on
these shared capabilities via packages in `pkg/`.
"@

  "$root\docs\architecture\overview.md" = @"
# Architecture Overview

This repository uses a monorepo layout:

- `apps/` — product-facing Cloudflare Worker applications (PrivateTag, StrongHold, portals).
- `svc/` — shared backend services (tag registry, media, IdP, notifications, audit).
- `pkg/` — shared TypeScript packages for types, domain models, and utilities.
- `infra/` — infrastructure configuration and templates.
- `docs/` — product, architecture, and operations documentation.

PrivateTag and StrongHold are distinct products that share a common x402
platform. The x402 components provide tagging, identity, notifications,
and storage primitives that all applications can reuse.
"@

  "$root\docs\architecture\control-data-plane.md" = @"
# Control Plane vs Data Plane

- The **control plane** is responsible for configuration and orchestration:
  tag definitions, action configuration, tenant settings, and security policies.

- The **data plane** is responsible for handling runtime traffic:
  resolving TagIDs, serving application UIs, handling uploads/downloads,
  and processing user interactions.

In this monorepo, control-plane logic is concentrated in shared services
(for example, tag-core and st-idp) and their data models, while data-plane
traffic is handled by product-specific apps in `apps/` and focused services
in `svc/`.
"@

  "$root\docs\architecture\workers-topology.md" = @"
# Workers Topology

Current planned Workers include:

- `apps/pt-photo` — First-stage PrivateTag Photo Capture application.
- `apps/pt-saas` — Future PrivateTag SaaS web/API gateway.
- `apps/sh-home` — StrongHold home memory cloud portal.
- `apps/x402-portal` — Cross-product portal or SSO console.

- `svc/tag-core` — Tag registry and action resolver.
- `svc/media-core` — Media upload/serving abstraction over R2.
- `svc/st-idp` — SentinelTrust IdP gateway for authentication and SSO.
- `svc/np-core` — Notification Plane worker(s).
- `svc/audit-core` — Cross-product audit and event logging.

Each Worker has its own `wrangler.toml` and `src/index.ts`, and can be
deployed independently but share code via packages in `pkg/`.
"@

  "$root\docs\ops\runbooks.md" = @"
# Operations Runbooks

This document will contain operational runbooks and playbooks for:

- Deploying Workers and services.
- Managing Cloudflare bindings (D1, R2, KV, Durable Objects).
- Handling incidents and rollbacks.
- Routine maintenance tasks.

For now, it serves as a placeholder and index for future operational content.
"@
}

foreach ($item in $docs.GetEnumerator()) {
  Ensure-File -Path $item.Key -Content $item.Value
}

$infraCfReadme = @"
# Cloudflare Config

Cloudflare-specific configuration and shared wrangler templates live here for reuse across Workers.
"@

$infraCfWrangler = @"
# Shared Wrangler base configuration placeholder

# Add shared bindings, vars, and workflows here before extending in service wrangler files.
"@

$infraLocalDockerReadme = @"
# Local Docker Stack

Placeholder for future StrongHold local node or Docker-based tooling definitions.
"@

Ensure-File -Path "$root\infra\cf\README.md" -Content $infraCfReadme
Ensure-File -Path "$root\infra\cf\wrangler.base.toml" -Content $infraCfWrangler
Ensure-File -Path "$root\infra\local\docker\README.md" -Content $infraLocalDockerReadme

Write-Host "Summary: Created $createdDirs directories, $createdFiles files, skipped $skippedFiles existing files."
