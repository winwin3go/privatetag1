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
