import { AuditEvent } from "@privatetag/pt-domain";

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "audit-core" });
    }

    if (request.method === "POST" && url.pathname === "/events") {
      try {
        const events = (await request.json()) as AuditEvent[];
        events.forEach((event) => console.log("[audit-core] event", event));
        return json({ status: "ok", received: events.length });
      } catch (error) {
        console.warn("[audit-core] failed to parse events payload", error);
        return json({ error: "Invalid payload" }, { status: 400 });
      }
    }

    return json({ error: "Not Found", service: "audit-core" }, { status: 404 });
  }
};
