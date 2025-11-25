# file-upload-test

## Local development

1. `cd ./apps/file-upload-test`
2. `npm install`
3. `npm run dev`

`wrangler dev` starts a local worker plus Cloudflare DevTools listening on the terminal (press `D` when prompted to open the DevTools UI and re-open via the printed URL if needed).

### Debugging in VS Code

- Open the workspace and run the **Attach to Wrangler Dev** launch configuration in `.vscode/launch.json` while the `npm run dev` session is running.
- The configuration launches `wrangler dev --inspect` so VS Code can attach to the Miniflare VM and break on `src/index.ts`.

### Testing the upload form

- Use any smartphone browser to open `apps/file-upload-test/public/upload.html` over your preferred static server (for example, `npx http-server public -c-1` or `python -m http.server` from that directory).
- The upload form POSTs to `/upload` on the Worker that runs under `wrangler dev`, and the UI echoes the JSON response.

The Worker already enables CORS on `/upload`, so the standalone HTML page can hit the same origin when you proxy it through the local dev server or expose it via `wrangler dev`.
