import type { RuoYiRequestConfig } from "../types/http";

export function shouldAttachToken(config: RuoYiRequestConfig): boolean {
  return config.ruoyi?.withToken !== false;
}

export function shouldPreventDuplicateSubmit(
  config: RuoYiRequestConfig,
): boolean {
  return config.ruoyi?.preventDuplicateSubmit !== false;
}

export function duplicateIntervalMs(config: RuoYiRequestConfig): number {
  return config.ruoyi?.duplicateIntervalMs ?? 1000;
}

export function requestMethod(config: RuoYiRequestConfig): string {
  return (config.method ?? "get").toLowerCase();
}
