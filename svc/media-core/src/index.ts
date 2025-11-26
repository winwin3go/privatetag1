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
      if (!payload.tagId) {
        return json({ error: "tag_id required" }, { status: 400 });
      }

      // TODO: consult tag-core or shared cache to validate tag_id + permissions.
      const tagId = toTagID(payload.tagId);
      const mediaId = `media-${Date.now()}`;
      const objectKey = `dev/${tagId}/${Date.now()}-${sanitizeFilename(payload.file?.name ?? "placeholder.bin")}`;

      if (payload.file) {
        await env.MEDIA_BUCKET.put(objectKey, payload.file.stream(), {
          httpMetadata: {
            contentType: payload.file.type || "application/octet-stream"
          }
        });
      }

      await env.DB.prepare(
        `
          INSERT INTO photo_records (tag_id, media_id, object_key, original_name, content_type, size)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        `
      )
        .bind(payload.tagId, mediaId, objectKey, payload.file?.name ?? null, payload.file?.type ?? null, payload.file?.size ?? null)
        .run();

      const record: PhotoRecord = {
        id: 0,
        tagId,
        mediaId,
        objectKey,
        originalName: payload.file?.name ?? null,
        contentType: payload.file?.type ?? null,
        size: payload.file?.size ?? null,
        createdAt: new Date().toISOString()
      };

      console.log(`[media-core] stored object ${objectKey} for TagID=${payload.tagId}`);

      return json({
        photo_id: record.mediaId,
        object_key: record.objectKey,
        filename: record.originalName,
        size: record.size,
        type: record.contentType,
        note: payload.file ? "Stored in R2 preview bucket" : "Placeholder upload without binary content"
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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}
