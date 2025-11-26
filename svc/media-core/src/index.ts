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

      // Validate the TagID exists in the shared registry.
      const tagValid = await validateTag(env, payload.tagId);
      if (!tagValid) {
        return json({ error: "Unknown TagID", tag_id: payload.tagId }, { status: 404 });
      }

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

      const downloadUrl = buildSelfUrl(url, `/media/${encodeURIComponent(mediaId)}`);

      return json({
        photo_id: record.mediaId,
        object_key: record.objectKey,
        filename: record.originalName,
        size: record.size,
        type: record.contentType,
        download_url: downloadUrl,
        note: payload.file ? "Stored in R2 preview bucket" : "Placeholder upload without binary content"
      });
    }

    if (request.method === "GET" && url.pathname === "/media") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), 50);
      const records = await listRecentMedia(env, isNaN(limit) || limit <= 0 ? 10 : limit);
      return json(records);
    }

    if (request.method === "GET" && url.pathname.startsWith("/media/")) {
      const mediaId = decodeURIComponent(url.pathname.replace("/media/", "")).trim();
      if (!mediaId) {
        return json({ error: "media_id required" }, { status: 400 });
      }

      const record = await lookupMedia(env, mediaId);
      if (!record) {
        return json({ error: "Media not found" }, { status: 404 });
      }

      const object = await env.MEDIA_BUCKET.get(record.objectKey);
      if (!object) {
        return json({ error: "Object not found in R2" }, { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          "content-type": record.contentType ?? "application/octet-stream",
          "content-disposition": `inline; filename="${record.originalName ?? mediaId}"`
        }
      });
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/media/")) {
      const mediaId = decodeURIComponent(url.pathname.replace("/media/", "")).trim();
      if (!mediaId) {
        return json({ error: "media_id required" }, { status: 400 });
      }

      const record = await lookupMedia(env, mediaId);
      if (!record) {
        return json({ error: "Media not found" }, { status: 404 });
      }

      await env.MEDIA_BUCKET.delete(record.objectKey);
      await env.DB.prepare(`DELETE FROM photo_records WHERE media_id = ?1`).bind(mediaId).run();

      console.log(`[media-core] deleted media_id=${mediaId}`);
      return json({ status: "deleted", media_id: mediaId });
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

async function lookupMedia(env: Env, mediaId: string): Promise<PhotoRecord | null> {
  try {
    const row = await env.DB.prepare<{
      tag_id: string;
      media_id: string;
      object_key: string;
      original_name?: string | null;
      content_type?: string | null;
      size?: number | null;
      created_at: string;
    }>(`SELECT * FROM photo_records WHERE media_id = ?1 LIMIT 1`)
      .bind(mediaId)
      .first();

    if (!row) {
      return null;
    }

    return {
      id: 0,
      tagId: toTagID(row.tag_id),
      mediaId: row.media_id,
      objectKey: row.object_key,
      originalName: row.original_name ?? null,
      contentType: row.content_type ?? null,
      size: row.size ?? null,
      createdAt: row.created_at
    };
  } catch (error) {
    console.error("[media-core] failed to lookup media record", error);
    return null;
  }
}

function buildSelfUrl(current: URL, path: string): string {
  const origin = `${current.protocol}//${current.host}`;
  return new URL(path, origin).toString();
}

async function validateTag(env: Env, tagId: string): Promise<boolean> {
  try {
    const row = await env.DB.prepare(`SELECT 1 FROM tag_records WHERE tag_id = ?1 LIMIT 1`).bind(tagId).first();
    return Boolean(row);
  } catch (error) {
    console.error("[media-core] failed to validate TagID", error);
    return false;
  }
}

async function listRecentMedia(env: Env, limit: number): Promise<
  Array<{
    media_id: string;
    tag_id: string;
    filename?: string | null;
    created_at: string;
  }>
> {
  try {
    const results = await env.DB.prepare<{
      media_id: string;
      tag_id: string;
      original_name?: string | null;
      created_at: string;
    }>(
      `
        SELECT media_id, tag_id, original_name, created_at
        FROM photo_records
        ORDER BY created_at DESC
        LIMIT ?1
      `
    )
      .bind(limit)
      .all();

    return results.results.map((row) => ({
      media_id: row.media_id,
      tag_id: row.tag_id,
      filename: row.original_name ?? null,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error("[media-core] failed to list media records", error);
    return [];
  }
}
