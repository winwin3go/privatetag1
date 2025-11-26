import { toTagID } from "@privatetag/x402-core";
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
      const payload = await parseUploadRequest(request);
      const tagId = toTagID(payload.tagId ?? "UNKNOWN");

      console.log(
        `[media-core] stub upload TagID=${tagId} filename=${payload.file?.name ?? "N/A"} size=${payload.file?.size ?? 0}`
      );

      // TODO: Persist metadata to env.DB and stream bytes to env.MEDIA_BUCKET.
      const photo: PhotoRecord = {
        id: Date.now(),
        tagId,
        mediaId: `media-${Date.now()}`,
        objectKey: `dev/${tagId}/${Date.now()}-${payload.file?.name ?? "placeholder"}`,
        createdAt: new Date().toISOString()
      };

      return json({
        photo_id: photo.mediaId,
        object_key: photo.objectKey,
        filename: payload.file?.name ?? null,
        size: payload.file?.size ?? null,
        type: payload.file?.type ?? null,
        note: payload.file
          ? "Stubbed upload - binary not yet written to R2."
          : "Stubbed upload - placeholder body used (no binary)."
      });
    }

    return json({ error: "Not Found", service: "media-core" }, { status: 404 });
  }
};

interface UploadPayload {
  tagId: string;
  file?: File | null;
}

async function parseUploadRequest(request: Request): Promise<UploadPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const tagId = (form.get("tag_id") ?? "").toString().trim().toUpperCase();
    const file = form.get("photo");
    return { tagId, file: file instanceof File ? file : null };
  }

  if (contentType.includes("application/json")) {
    const body = await request.json<Record<string, unknown>>();
    return {
      tagId: (body.tag_id ?? "").toString().trim().toUpperCase(),
      file: null
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    return {
      tagId: (params.get("tag_id") ?? "").toString().trim().toUpperCase(),
      file: null
    };
  }

  return { tagId: "" };
}
