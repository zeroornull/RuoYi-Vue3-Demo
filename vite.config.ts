import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import { charsetRemoval } from "./vite/charset-removal.ts";
import { requireBuildEnv } from "./vite/env.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const srcDir = fileURLToPath(new URL("./src", import.meta.url));
const backendOrigin = "http://localhost:8080";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  requireBuildEnv(env, mode);

  return {
    base: "/",
    plugins: [vue()],
    resolve: {
      alias: {
        "@": srcDir,
        "~": rootDir,
      },
    },
    build: {
      sourcemap: false,
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
      },
    },
    server: {
      // Old RuoYi used port 80; this machine cannot bind it (EACCES).
      port: 5173,
      host: true,
      open: false,
      strictPort: true,
      proxy: {
        "/dev-api": {
          target: backendOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ""),
        },
        "^/v3/api-docs/": {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
    css: {
      postcss: {
        plugins: [charsetRemoval],
      },
    },
  };
});
