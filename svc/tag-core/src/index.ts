import { ActionType, ResolvedAction, TagID, toTagID } from "@privatetag/x402-core";

export interface Env {
  DB: D1Database;
}

const SAMPLE_LOOKUP: Record<string, ResolvedAction> = {
  TESTPHOTO1: {
    tagId: toTagID("TESTPHOTO1"),
    actionType: ActionType.PHOTO_CAPTURE,
    target: { type: "service", value: "media-core" },
    note: "Stub action for capture flows"
  },
  TESTPHOTO2: {
    tagId: toTagID("TESTPHOTO2"),
    actionType: ActionType.PHOTO_VIEW,
    target: { type: "url", value: "https://example.com/preview" }
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
      console.log(`[tag-core] stub lookup for TagID=${rawId}`);

      // TODO: Replace SAMPLE_LOOKUP with D1 query (env.DB).
      const payload = SAMPLE_LOOKUP[rawId];
      if (!payload) {
        return json({ error: "TagID not found", tagId: rawId }, { status: 404 });
      }

      return json(payload);
    }

    return json({ error: "Not Found", service: "tag-core" }, { status: 404 });
  }
};
