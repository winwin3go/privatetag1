import { AuthContext } from "@privatetag/x402-core";

const STUB_CONTEXT: AuthContext = {
  userId: "demo-user",
  sessionId: "session-demo",
  roles: ["photographer"],
  issuedAt: new Date().toISOString()
};

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "st-idp" });
    }

    if (request.method === "GET" && url.pathname === "/whoami") {
      // TODO: replace with real token verification once SentinelTrust IdP is implemented.
      return json(STUB_CONTEXT);
    }

    return json({ error: "Not Found", service: "st-idp" }, { status: 404 });
  }
};
