import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Miniflare } from "miniflare";

const SERVICE_ROOT = path.resolve(__dirname, "..");

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    modules: true,
    modulesRules: [{ type: "ESModule", include: ["**/*.ts"], fallthrough: true }],
    scriptPath: path.join(SERVICE_ROOT, "src/index.ts"),
    compatibilityDate: "2025-01-01",
    d1Databases: ["DB"]
  });

  const db = await mf.getD1Database("DB");
  await db.exec(readFileSync(path.join(SERVICE_ROOT, "sql/001_init.sql"), "utf8"));
  await db.exec(readFileSync(path.join(SERVICE_ROOT, "sql/100_seed.sql"), "utf8"));
});

afterAll(async () => {
  await mf.dispose();
});

describe("tag-core Worker", () => {
  it("fetches a seeded tag", async () => {
    const res = await mf.dispatchFetch("http://localhost/tags/TESTPHOTO1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tagId).toBe("TESTPHOTO1");
  });

  it("creates a new tag via POST /tags", async () => {
    const create = await mf.dispatchFetch("http://localhost/tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tag_id: "AUTOTEST1",
        tenant_id: "tenant-test",
        action_type: "PHOTO_CAPTURE",
        target_type: "service",
        target_value: "media-core"
      })
    });
    expect(create.status).toBe(200);

    const lookup = await mf.dispatchFetch("http://localhost/tags/AUTOTEST1");
    expect(lookup.status).toBe(200);
    const payload = await lookup.json();
    expect(payload.actionType).toBe("PHOTO_CAPTURE");
  });
});
