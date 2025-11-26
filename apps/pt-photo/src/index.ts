import { ResolvedAction } from "@privatetag/x402-core";

interface Env {
  TAG_CORE?: Fetcher;
  MEDIA_CORE?: Fetcher;
  TAG_CORE_ORIGIN?: string;
  MEDIA_CORE_ORIGIN?: string;
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "pt-photo" });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return html(renderCapturePage());
    }

    if (request.method === "POST" && url.pathname === "/upload") {
      return handleUpload(request, env);
    }

    return html(`<h1>Not Found</h1>`, { status: 404 });
  }
};

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const input = await parseUploadRequest(request);
  const rawTag = (input.tag_id ?? "").toString().trim().toUpperCase();

  if (!rawTag) {
    return html(renderCapturePage("Missing tag_id field"), { status: 400 });
  }

  const tagLookup = await callService(env.TAG_CORE, env.TAG_CORE_ORIGIN, `/tags/${encodeURIComponent(rawTag)}`, {
    method: "GET"
  });

  if (!tagLookup.ok) {
    const message = await tagLookup.text();
    return html(renderCapturePage(`Tag lookup failed: ${message}`), { status: tagLookup.status });
  }

  const resolvedAction = (await tagLookup.json()) as ResolvedAction;

  // TODO: parse multipart/form-data and stream file bytes rather than sending a placeholder payload.
  const mediaResponse = await callService(env.MEDIA_CORE, env.MEDIA_CORE_ORIGIN, "/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tag_id: rawTag, placeholder: true })
  });

  const mediaResult = await mediaResponse.json<Record<string, unknown>>();

  console.log(
    `[pt-photo] stub upload for TagID=${rawTag} => action=${resolvedAction.actionType}, media=${JSON.stringify(mediaResult)}`
  );

  // TODO: integrate PII-safe logging + audit-core emission once real uploads are wired in.
  const summary = `
    <p><strong>TagID:</strong> ${rawTag}</p>
    <p><strong>Action:</strong> ${resolvedAction.actionType}</p>
    <p><strong>Media:</strong> ${JSON.stringify(mediaResult)}</p>
    <p class="todo">TODO: replace stub workflow with real D1/R2 integration.</p>
  `;

  return html(renderCapturePage("Stub upload complete.", summary));
}

async function callService(
  binding: Fetcher | undefined,
  fallbackOrigin: string | undefined,
  path: string,
  init?: RequestInit
): Promise<Response> {
  if (binding) {
    return binding.fetch(`https://cf-internal${path}`, init);
  }

  if (fallbackOrigin) {
    const url = new URL(path, fallbackOrigin);
    return fetch(url.toString(), init);
  }

  throw new Error(`No binding or fallback origin configured for service path ${path}`);
}

async function parseUploadRequest(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await request.json();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(await request.text());
      return Object.fromEntries(params.entries());
    }
    // Basic form parsing without file support yet.
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      return { tag_id: form.get("tag_id") ?? "" };
    }
  } catch (error) {
    console.warn("[pt-photo] unable to parse upload body", error);
  }

  return {};
}

const html = (body: string, init: ResponseInit = {}): Response =>
  new Response(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PrivateTag1 Photo Capture MVP</title>
        <style>
          body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; padding: 1rem; }
          label { display: block; margin-bottom: 0.5rem; }
          input[type="text"], input[type="file"] { width: 100%; margin-bottom: 1rem; }
          .status { padding: 0.5rem; background: #eef; border-radius: 4px; margin-bottom: 1rem; }
          .todo { color: #a40; }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>`,
    {
      headers: { "content-type": "text/html; charset=utf-8" },
      ...init
    }
  );

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

function renderCapturePage(statusMessage = "", extraContent = ""): string {
  return `
    <h1>PrivateTag1 Photo Capture MVP</h1>
    <p>This stub demonstrates the control-plane (tag-core) → data-plane (media-core) flow.</p>
    ${statusMessage ? `<div class="status">${statusMessage}</div>` : ""}
    <form action="/upload" method="post">
      <label for="tag_id">Tag ID</label>
      <input type="text" id="tag_id" name="tag_id" required placeholder="e.g., TESTPHOTO1" />

      <label for="photo">Photo</label>
      <input type="file" id="photo" name="photo" accept="image/*" />

      <p class="todo">TODO: send multipart/form-data and stream real files to media-core.</p>

      <button type="submit">Upload (stub)</button>
    </form>
    ${extraContent}
  `;
}
