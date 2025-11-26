import { TagID, toTagID } from "@privatetag/x402-core";
import { PhotoRecord } from "@privatetag/x402-db";

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "media-core" });
    }

    if (request.method === "POST" && url.pathname === "/upload") {
      const stubPayload = await parseUploadRequest(request);
      const tagId = toTagID((stubPayload.tag_id ?? "UNKNOWN").toString().toUpperCase());

      console.log(`[media-core] stub upload for TagID=${tagId} placeholder=${stubPayload.placeholder ?? false}`);

      // TODO: Persist metadata to env.DB and stream bytes to env.MEDIA_BUCKET.
      const photo: PhotoRecord = {
        id: Date.now(),
        tagId,
        mediaId: `media-${Date.now()}`,
        objectKey: `dev/${tagId}/${Date.now()}.jpg`,
        createdAt: new Date().toISOString()
      };

      return json({
        photo_id: photo.mediaId,
        object_key: photo.objectKey,
        note: "Stubbed upload - no binary stored yet"
      });
    }

    return json({ error: "Not Found", service: "media-core" }, { status: 404 });
  }
};

async function parseUploadRequest(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await request.json<Record<string, unknown>>();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = new URLSearchParams(await request.text());
      return Object.fromEntries(form.entries());
    }
  } catch (error) {
    console.warn("[media-core] unable to parse upload body", error);
  }

  return {};
}
