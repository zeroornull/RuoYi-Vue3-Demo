import type { RuoYiRequestConfig } from "../types/http";

function readHeader(headers: unknown, key: string): unknown {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }
  return (headers as Record<string, unknown>)[key];
}

export function shouldAttachToken(config: RuoYiRequestConfig): boolean {
  if (config.ruoyi?.withToken === false) {
    return false;
  }
  return readHeader(config.headers, "isToken") !== false;
}

export function shouldPreventDuplicateSubmit(
  config: RuoYiRequestConfig,
): boolean {
  if (config.ruoyi?.preventDuplicateSubmit === false) {
    return false;
  }
  return readHeader(config.headers, "repeatSubmit") !== false;
}

export function duplicateIntervalMs(config: RuoYiRequestConfig): number {
  const fromMeta = config.ruoyi?.duplicateIntervalMs;
  if (typeof fromMeta === "number") {
    return fromMeta;
  }
  const legacy = readHeader(config.headers, "interval");
  return typeof legacy === "number" ? legacy : 1000;
}

export function requestMethod(config: RuoYiRequestConfig): string {
  return (config.method ?? "get").toLowerCase();
}
