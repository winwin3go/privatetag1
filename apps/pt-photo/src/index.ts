import { AuthContext, ResolvedAction } from "@privatetag/x402-core";
import {
  AuditEvent,
  AuditEventType,
  MAX_CAPTURE_FILE_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES
} from "@privatetag/pt-domain";

interface Env {
  TAG_CORE?: Fetcher;
  MEDIA_CORE?: Fetcher;
  ST_IDP?: Fetcher;
  AUDIT_CORE?: Fetcher;
  TAG_CORE_ORIGIN?: string;
  MEDIA_CORE_ORIGIN?: string;
  ST_IDP_ORIGIN?: string;
  AUDIT_CORE_ORIGIN?: string;
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
      const captures = await fetchRecentCaptures(env, 5);
      return html(renderCapturePage("", "", captures));
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
    const captures = await fetchRecentCaptures(env, 5);
    return html(renderCapturePage("Missing tag_id field", "", captures), { status: 400 });
  }

  const authContext = await fetchAuthContext(env);

  await sendAuditEvents(env, [
    {
      type: AuditEventType.PHOTO_UPLOAD_REQUESTED,
      timestamp: new Date().toISOString(),
      tagId: rawTag,
      auth: authContext,
      metadata: {
        source: "pt-photo",
        filename: input.mode === "form" ? input.file?.name ?? undefined : undefined
      }
    }
  ]);

  const tagLookup = await callService(env.TAG_CORE, env.TAG_CORE_ORIGIN, `/tags/${encodeURIComponent(rawTag)}`, {
    method: "GET"
  });

  if (!tagLookup.ok) {
    const message = await tagLookup.text();
    const captures = await fetchRecentCaptures(env, 5);
    return html(renderCapturePage(`Tag lookup failed: ${message}`, "", captures), { status: tagLookup.status });
  }

  const resolvedAction = (await tagLookup.json()) as ResolvedAction;

  let mediaRequest: RequestInit;
  try {
    mediaRequest = await buildMediaCoreRequest(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    const captures = await fetchRecentCaptures(env, 5);
    return html(renderCapturePage(message, "", captures), { status: 400 });
  }
  const mediaResponse = await callService(env.MEDIA_CORE, env.MEDIA_CORE_ORIGIN, "/upload", mediaRequest);
  if (!mediaResponse.ok) {
    const message = await mediaResponse.text();
    const captures = await fetchRecentCaptures(env, 5);
    return html(renderCapturePage(`Media-core upload failed: ${message}`, "", captures), { status: mediaResponse.status });
  }

  const mediaResult = (await mediaResponse.json()) as MediaCoreResponse;

  console.log(
    `[pt-photo] upload flow TagID=${rawTag} => action=${resolvedAction.actionType}, media=${JSON.stringify(mediaResult)}`
  );

  await sendAuditEvents(env, [
    {
      type: AuditEventType.PHOTO_UPLOAD_COMPLETED,
      timestamp: new Date().toISOString(),
      tagId: rawTag,
      mediaId: mediaResult.photo_id,
      auth: authContext,
      metadata: {
        source: "pt-photo",
        object_key: mediaResult.object_key
      }
    }
  ]);

  // TODO: integrate PII-safe logging + audit-core emission once real uploads are wired in.
  const summary = `
    ${renderResultDetails(rawTag, resolvedAction, mediaResult)}
    <p class="todo">TODO: persist capture session + binary metadata (D1/R2) and audit trail.</p>
  `;

  const captures = await fetchRecentCaptures(env, 5);
  return html(renderCapturePage("Stub upload complete.", summary, captures));
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

async function callOptionalService(
  binding: Fetcher | undefined,
  fallbackOrigin: string | undefined,
  path: string,
  init?: RequestInit
): Promise<Response | null> {
  if (!binding && !fallbackOrigin) {
    return null;
  }

  return callService(binding, fallbackOrigin, path, init);
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
    const file = ensureValidFile(input.file);

    const formData = new FormData();
    formData.append("tag_id", input.tagId);
    formData.append("photo", file);
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
          .status.error { background: #fee; color: #600; border: 1px solid #c55; }
          .todo { color: #a40; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ddd; padding: 0.4rem; font-size: 0.9rem; }
          th { background: #f5f5f5; text-align: left; }
        </style>
      </head>
      <body>
        ${body}
        <script>
          (() => {
            const form = document.getElementById("capture-form");
            const fileInput = document.getElementById("photo");
            const errorBox = document.getElementById("client-error");
            const allowedTypes = ${JSON.stringify(Array.from(SUPPORTED_IMAGE_TYPES))};
            const maxBytes = ${MAX_CAPTURE_FILE_SIZE_BYTES};

            form?.addEventListener("submit", (event) => {
              if (!fileInput) return;
              const file = fileInput.files?.[0];
              const showError = (msg) => {
                if (!errorBox) return;
                errorBox.textContent = msg;
                errorBox.hidden = false;
              };
              errorBox.hidden = true;
              if (!file) {
                event.preventDefault();
                showError("Select an image before uploading.");
                return;
              }
              if (file.size > maxBytes) {
                event.preventDefault();
                showError(\`File too large (max \${(maxBytes / 1024 / 1024).toFixed(0)} MB).\`);
                return;
              }
              if (file.type && !allowedTypes.includes(file.type)) {
                event.preventDefault();
                showError(\`Unsupported type \${file.type}.\`);
              }
            });
          })();
        </script>
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

function renderCapturePage(
  statusMessage = "",
  extraContent = "",
  captures: MediaRecordSummary[] = []
): string {
  return `
    <h1>PrivateTag1 Photo Capture MVP</h1>
    <p>This stub demonstrates the control-plane (tag-core) → data-plane (media-core) flow.</p>
    ${statusMessage ? `<div class="status">${statusMessage}</div>` : ""}
    <div id="client-error" class="status error" hidden></div>
    <form id="capture-form" action="/upload" method="post" enctype="multipart/form-data" novalidate>
      <label for="tag_id">Tag ID</label>
      <input type="text" id="tag_id" name="tag_id" required placeholder="e.g., TESTPHOTO1" />

      <label for="photo">Photo</label>
      <input type="file" id="photo" name="photo" accept="image/*" required />
      <small>Accepted: ${Array.from(SUPPORTED_IMAGE_TYPES).join(", ")} • Max size: ${Math.round(
        MAX_CAPTURE_FILE_SIZE_BYTES / (1024 * 1024)
      )} MB</small>

      <p class="todo">TODO: stream directly to media-core + D1 via durable upload/resume logic.</p>

      <button type="submit">Upload (stub)</button>
    </form>
    ${extraContent}
    ${renderCaptureList(captures)}
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

interface MediaRecordSummary {
  media_id: string;
  tag_id: string;
  filename?: string | null;
  created_at: string;
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

function renderCaptureList(captures: MediaRecordSummary[]): string {
  if (!captures.length) {
    return `<section><h2>Recent captures</h2><p>No records yet. Upload a photo to populate this list.</p></section>`;
  }

  const rows = captures
    .map(
      (entry) => `
        <tr>
          <td>${entry.created_at}</td>
          <td>${entry.tag_id}</td>
          <td><code>${entry.media_id}</code></td>
          <td>${entry.filename ?? "n/a"}</td>
          <td><a href="/media/${encodeURIComponent(entry.media_id)}" target="_blank" rel="noopener">Open</a></td>
        </tr>
      `
    )
    .join("");

  return `
    <section>
      <h2>Recent captures</h2>
      <table>
        <thead>
          <tr><th>Created</th><th>Tag ID</th><th>Media ID</th><th>Filename</th><th>Preview</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

async function fetchRecentCaptures(env: Env, limit: number): Promise<MediaRecordSummary[]> {
  try {
    const response = await callService(
      env.MEDIA_CORE,
      env.MEDIA_CORE_ORIGIN,
      `/media?limit=${encodeURIComponent(String(limit))}`
    );
    if (!response.ok) {
      console.warn("[pt-photo] unable to load capture history", await response.text());
      return [];
    }
    return (await response.json()) as MediaRecordSummary[];
  } catch (error) {
    console.warn("[pt-photo] capture history fetch error", error);
    return [];
  }
}

function ensureValidFile(file: File | null): File {
  if (!file) {
    throw new Error("Photo file is required.");
  }

  if (file.size > MAX_CAPTURE_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large. Limit is ${Math.round(MAX_CAPTURE_FILE_SIZE_BYTES / (1024 * 1024))} MB (received ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)} MB).`
    );
  }

  if (file.type && !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type "${file.type}". Allowed: ${Array.from(SUPPORTED_IMAGE_TYPES).join(", ")}`);
  }

  return file;
}

async function fetchAuthContext(env: Env): Promise<AuthContext | null> {
  try {
    const response = await callOptionalService(env.ST_IDP, env.ST_IDP_ORIGIN, "/whoami");
    if (!response || !response.ok) {
      return null;
    }
    return (await response.json()) as AuthContext;
  } catch (error) {
    console.warn("[pt-photo] unable to fetch auth context", error);
    return null;
  }
}

async function sendAuditEvents(env: Env, events: AuditEvent[]): Promise<void> {
  if (!events.length) {
    return;
  }

  try {
    const response = await callOptionalService(env.AUDIT_CORE, env.AUDIT_CORE_ORIGIN, "/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(events)
    });

    if (!response) {
      return;
    }

    if (!response.ok) {
      console.warn("[pt-photo] audit-core returned non-200", response.status);
    }
  } catch (error) {
    console.warn("[pt-photo] failed to send audit event", error);
  }
}
