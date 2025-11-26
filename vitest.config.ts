import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["pkg/**/*.test.ts", "svc/**/tests/**/*.test.ts"]
  }
});
