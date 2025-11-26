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
  const rawTag = input.tagId;

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

  let mediaRequest: RequestInit;
  try {
    mediaRequest = await buildMediaCoreRequest(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    return html(renderCapturePage(message), { status: 400 });
  }
  const mediaResponse = await callService(env.MEDIA_CORE, env.MEDIA_CORE_ORIGIN, "/upload", mediaRequest);
  if (!mediaResponse.ok) {
    const message = await mediaResponse.text();
    return html(renderCapturePage(`Media-core upload failed: ${message}`), { status: mediaResponse.status });
  }

  const mediaResult = (await mediaResponse.json()) as MediaCoreResponse;

  console.log(
    `[pt-photo] upload flow TagID=${rawTag} => action=${resolvedAction.actionType}, media=${JSON.stringify(mediaResult)}`
  );

  // TODO: integrate PII-safe logging + audit-core emission once real uploads are wired in.
  const summary = `
    ${renderResultDetails(rawTag, resolvedAction, mediaResult)}
    <p class="todo">TODO: persist capture session + binary metadata (D1/R2) and audit trail.</p>
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

type UploadInput =
  | { mode: "form"; tagId: string; file: File | null }
  | { mode: "json"; tagId: string; placeholder?: boolean };

async function parseUploadRequest(request: Request): Promise<UploadInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const tagId = (form.get("tag_id") ?? "").toString().trim().toUpperCase();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return { mode: "form", tagId, file: null };
    }
    return { mode: "form", tagId, file };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    const tagId = (params.get("tag_id") ?? "").toString().trim().toUpperCase();
    return { mode: "json", tagId, placeholder: true };
  }

  // Default to JSON for API clients/tools.
  try {
    const body = await request.json<Record<string, unknown>>();
    const tagId = (body.tag_id ?? "").toString().trim().toUpperCase();
    return { mode: "json", tagId, placeholder: Boolean(body.placeholder) };
  } catch (error) {
    console.warn("[pt-photo] unable to parse upload body", error);
    return { mode: "json", tagId: "" };
  }
}

async function buildMediaCoreRequest(input: UploadInput): Promise<RequestInit> {
  if (input.mode === "form") {
    if (!input.file) {
      throw new Error("File required for form submission");
    }

    const formData = new FormData();
    formData.append("tag_id", input.tagId);
    formData.append("photo", input.file);
    return { method: "POST", body: formData };
  }

  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tag_id: input.tagId,
      placeholder: input.placeholder ?? true
    })
  };
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
    <form action="/upload" method="post" enctype="multipart/form-data">
      <label for="tag_id">Tag ID</label>
      <input type="text" id="tag_id" name="tag_id" required placeholder="e.g., TESTPHOTO1" />

      <label for="photo">Photo</label>
      <input type="file" id="photo" name="photo" accept="image/*" />

      <p class="todo">TODO: stream directly to media-core + D1 via durable upload/resume logic.</p>

      <button type="submit">Upload (stub)</button>
    </form>
    ${extraContent}
  `;
}

interface MediaCoreResponse {
  photo_id: string;
  object_key: string;
  filename?: string | null;
  size?: number | null;
  type?: string | null;
  note?: string;
  download_url?: string;
}

function renderResultDetails(tagId: string, action: ResolvedAction, media: MediaCoreResponse): string {
  const downloadUrl = media.download_url;
  return `
    <div class="result">
      <h2>Upload Summary</h2>
      <dl>
        <dt>Tag ID</dt><dd>${tagId}</dd>
        <dt>Action Type</dt><dd>${action.actionType}</dd>
        <dt>Photo ID</dt><dd>${media.photo_id}</dd>
        <dt>Object Key</dt><dd><code>${media.object_key}</code></dd>
        <dt>Filename</dt><dd>${media.filename ?? "n/a"}</dd>
        <dt>Size</dt><dd>${media.size ? `${media.size} bytes` : "n/a"}</dd>
        <dt>Type</dt><dd>${media.type ?? "n/a"}</dd>
      </dl>
      ${
        downloadUrl
          ? `<p><a href="${downloadUrl}" target="_blank" rel="noopener">Preview stored object</a> (local dev only)</p>`
          : "<p class=\"todo\">TODO: expose download URL when media-core response includes it.</p>"
      }
      ${media.note ? `<p><em>${media.note}</em></p>` : ""}
    </div>
  `;
}
