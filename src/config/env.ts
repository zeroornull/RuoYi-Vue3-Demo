const APP_MODES = ["development", "staging", "production"] as const;

export type AppMode = (typeof APP_MODES)[number];

export type AppEnv = {
  title: string;
  appEnv: AppMode;
  baseApi: string;
  compress?: "gzip" | "brotli" | "gzip,brotli";
};

export function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function isAppMode(value: string): value is AppMode {
  return (APP_MODES as readonly string[]).includes(value);
}

function parseCompress(value: string | undefined): AppEnv["compress"] {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  if (value === "gzip" || value === "brotli" || value === "gzip,brotli") {
    return value;
  }
  throw new Error(`Invalid VITE_BUILD_COMPRESS: ${value}`);
}

export function loadAppEnv(): AppEnv {
  const title = requireEnv(import.meta.env.VITE_APP_TITLE, "VITE_APP_TITLE");
  const appEnv = requireEnv(import.meta.env.VITE_APP_ENV, "VITE_APP_ENV");
  if (!isAppMode(appEnv)) {
    throw new Error(`Invalid VITE_APP_ENV: ${appEnv}`);
  }
  const baseApi = requireEnv(import.meta.env.VITE_APP_BASE_API, "VITE_APP_BASE_API");
  const compress = parseCompress(import.meta.env.VITE_BUILD_COMPRESS);
  const parsed: AppEnv = { title, appEnv, baseApi };
  if (compress !== undefined) {
    parsed.compress = compress;
  }
  return parsed;
}

export const appEnv = loadAppEnv();
