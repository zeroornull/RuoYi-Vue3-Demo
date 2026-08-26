const APP_MODES = ["development", "staging", "production"] as const;

export type AppMode = (typeof APP_MODES)[number];

export type BuildCompress = "gzip" | "brotli" | "gzip,brotli";

export type BuildEnv = {
  title: string;
  appEnv: AppMode;
  baseApi: string;
  compress?: BuildCompress;
};

function required(env: Record<string, string>, name: string): string {
  const value = env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function isAppMode(value: string): value is AppMode {
  return (APP_MODES as readonly string[]).includes(value);
}

function parseCompress(value: string | undefined): BuildCompress | undefined {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  if (value === "gzip" || value === "brotli" || value === "gzip,brotli") {
    return value;
  }
  throw new Error(`Invalid VITE_BUILD_COMPRESS: ${value}`);
}

export function requireBuildEnv(env: Record<string, string>, mode: string): BuildEnv {
  const title = required(env, "VITE_APP_TITLE");
  const appEnv = required(env, "VITE_APP_ENV");
  if (!isAppMode(appEnv)) {
    throw new Error(`VITE_APP_ENV must be development|staging|production, got ${appEnv}`);
  }
  if (appEnv !== mode) {
    throw new Error(`VITE_APP_ENV=${appEnv} does not match Vite mode=${mode}`);
  }
  const baseApi = required(env, "VITE_APP_BASE_API");
  const compress = parseCompress(env.VITE_BUILD_COMPRESS);
  const parsed: BuildEnv = { title, appEnv, baseApi };
  if (compress !== undefined) {
    parsed.compress = compress;
  }
  return parsed;
}
