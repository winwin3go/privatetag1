import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Miniflare } from "miniflare";

const SERVICE_ROOT = path.resolve(__dirname, "..");
const TAG_CORE_SQL = path.resolve(SERVICE_ROOT, "..", "tag-core", "sql");

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    modules: true,
    modulesRules: [{ type: "ESModule", include: ["**/*.ts"], fallthrough: true }],
    scriptPath: path.join(SERVICE_ROOT, "src/index.ts"),
    compatibilityDate: "2025-01-01",
    d1Databases: ["DB"],
    r2Buckets: ["MEDIA_BUCKET"]
  });

  const db = await mf.getD1Database("DB");
  await db.exec(readFileSync(path.join(TAG_CORE_SQL, "001_init.sql"), "utf8"));
  await db.exec(readFileSync(path.join(TAG_CORE_SQL, "100_seed.sql"), "utf8"));
  await db.exec(readFileSync(path.join(SERVICE_ROOT, "sql/001_init.sql"), "utf8"));
});

afterAll(async () => {
  await mf.dispose();
});

describe("media-core Worker", () => {
  it("uploads and retrieves media objects", async () => {
    const form = new FormData();
    form.append("tag_id", "TESTPHOTO1");
    form.append("photo", new File(["demo-bytes"], "demo.jpg", { type: "image/jpeg" }));

    const upload = await mf.dispatchFetch("http://localhost/upload", {
      method: "POST",
      body: form
    });
    expect(upload.status).toBe(200);
    const data = await upload.json();
    expect(data.photo_id).toBeDefined();

    const download = await mf.dispatchFetch(`http://localhost/media/${data.photo_id}`);
    expect(download.status).toBe(200);
    const buffer = Buffer.from(await download.arrayBuffer());
    expect(buffer.length).toBeGreaterThan(0);

    const listing = await mf.dispatchFetch("http://localhost/media?limit=1");
    expect(listing.status).toBe(200);
    const [first] = (await listing.json()) as Array<{ media_id: string }>;
    expect(first.media_id).toBe(data.photo_id);
  });
});
