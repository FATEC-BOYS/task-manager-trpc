import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
  test: {
    environment: "node",
    environmentMatchGlobs: [["src/components/**", "jsdom"]],
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/server/store.ts", "src/server/routers/tasks.ts", "src/app/api/trpc/**/route.ts", "src/components/**/*.{ts,tsx}", "src/i18n/messages.ts"],
      exclude: ["**/*.test.*"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 }
    }
  }
});
