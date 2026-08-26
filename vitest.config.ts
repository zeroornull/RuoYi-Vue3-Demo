import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/vue/**/*.test.ts"],
    isolate: true,
    fileParallelism: false,
    env: {
      VITE_APP_TITLE: "若依管理系统",
      VITE_APP_ENV: "development",
      VITE_APP_BASE_API: "/dev-api",
      VITE_MOCK_API: "true",
    },
  },
});
