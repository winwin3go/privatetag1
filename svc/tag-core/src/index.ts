import { ActionType, ResolvedAction, toTagID } from "@privatetag/x402-core";

export interface Env {
  DB: D1Database;
}

const FALLBACK: Record<string, ResolvedAction> = {
  TESTPHOTO1: {
    tagId: toTagID("TESTPHOTO1"),
    actionType: ActionType.PHOTO_CAPTURE,
    target: { type: "service", value: "media-core" },
    note: "Fallback action for capture flows"
  }
};

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "tag-core" });
    }

    if (request.method === "POST" && url.pathname === "/tags") {
      const payload = await parseTagCreateRequest(request);
      if (!payload.ok) {
        return json({ error: payload.error }, { status: 400 });
      }

      try {
        await env.DB.prepare(
          `
            INSERT OR IGNORE INTO tag_records (tag_id, tenant_id, status)
            VALUES (?1, ?2, 'active')
          `
        )
          .bind(payload.tagId, payload.tenantId)
          .run();

        await env.DB.prepare(
          `
            INSERT INTO tag_actions (tag_id, action_type, target_type, target_value, note)
            VALUES (?1, ?2, ?3, ?4, ?5)
          `
        )
          .bind(payload.tagId, payload.actionType, payload.target.type, payload.target.value, payload.note ?? null)
          .run();
      } catch (error) {
        console.error("[tag-core] failed to create tag", error);
        return json({ error: "Failed to create tag" }, { status: 500 });
      }

      return json({
        status: "created",
        tag_id: payload.tagId,
        tenant_id: payload.tenantId,
        action_type: payload.actionType,
        target: payload.target
      });
    }

    if (url.pathname.startsWith("/tags/")) {
      const rawId = decodeURIComponent(url.pathname.replace("/tags/", "")).trim().toUpperCase();
      console.log(`[tag-core] resolving TagID=${rawId}`);

      const resolved = await resolveFromDatabase(env, rawId);
      if (resolved) {
        return json(resolved);
      }

      const fallback = FALLBACK[rawId];
      if (fallback) {
        console.warn(`[tag-core] using fallback action for TagID=${rawId}; seed the D1 database to avoid this.`);
        return json(fallback);
      }

      return json({ error: "TagID not found", tagId: rawId }, { status: 404 });
    }

    return json({ error: "Not Found", service: "tag-core" }, { status: 404 });
  }
};

type TagActionRow = {
  tag_id: string;
  action_type: string;
  target_type: "service" | "url";
  target_value: string;
  note?: string | null;
};

async function resolveFromDatabase(env: Env, tagId: string): Promise<ResolvedAction | null> {
  try {
    const row = await env.DB.prepare<TagActionRow>(
      `
      SELECT tr.tag_id, ta.action_type, ta.target_type, ta.target_value, ta.note
      FROM tag_records tr
      JOIN tag_actions ta ON ta.tag_id = tr.tag_id
      WHERE tr.tag_id = ?
      LIMIT 1
    `
    )
      .bind(tagId)
      .first();

    if (!row) {
      return null;
    }

    return {
      tagId: toTagID(row.tag_id),
      actionType: toActionType(row.action_type),
      target: {
        type: row.target_type,
        value: row.target_value
      },
      note: row.note ?? undefined
    };
  } catch (error) {
    console.error("[tag-core] failed to query D1", error);
    return null;
  }
}

function toActionType(value: string): ActionType {
  if (value in ActionType) {
    return ActionType[value as keyof typeof ActionType];
  }

  return ActionType.REDIRECT;
}

type TagCreateParseResult =
  | {
      ok: true;
      tagId: string;
      tenantId: string;
      actionType: string;
      target: { type: "service" | "url"; value: string };
      note?: string;
    }
  | { ok: false; error: string };

async function parseTagCreateRequest(request: Request): Promise<TagCreateParseResult> {
  try {
    const body = await request.json<Record<string, unknown>>();
    const tagId = (body.tag_id ?? "").toString().trim().toUpperCase();
    const tenantId = (body.tenant_id ?? "").toString().trim();
    const actionType = (body.action_type ?? "").toString().trim().toUpperCase();
    const targetType = (body.target_type ?? "").toString().trim().toLowerCase();
    const targetValue = (body.target_value ?? "").toString().trim();

    if (!tagId || !tenantId || !actionType || !targetType || !targetValue) {
      return { ok: false, error: "tag_id, tenant_id, action_type, target_type, target_value are required" };
    }
    if (targetType !== "service" && targetType !== "url") {
      return { ok: false, error: "target_type must be 'service' or 'url'" };
    }

    return {
      ok: true,
      tagId,
      tenantId,
      actionType,
      target: { type: targetType, value: targetValue },
      note: body.note ? body.note.toString() : undefined
    };
  } catch (error) {
    console.warn("[tag-core] failed to parse create request", error);
    return { ok: false, error: "Invalid JSON body" };
  }
}
