/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENV: "development" | "staging" | "production";
  readonly VITE_APP_BASE_API: string;
  readonly VITE_BUILD_COMPRESS?: "gzip" | "brotli" | "gzip,brotli";
  readonly VITE_MOCK_API?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
