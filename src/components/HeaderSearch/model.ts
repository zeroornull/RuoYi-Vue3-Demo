import Fuse from "fuse.js";
import type { AppRouteRecordRaw } from "../../router/types";
import { getNormalPath } from "../../utils/path";
import { isHttp } from "../../utils/validate";

export type HeaderSearchItem = {
  path: string;
  title: string[];
  icon: string;
  query?: string;
};

export function generateSearchRoutes(
  routes: readonly AppRouteRecordRaw[],
  basePath = "",
  prefixTitle: readonly string[] = [],
): HeaderSearchItem[] {
  const result: HeaderSearchItem[] = [];
  for (const route of routes) {
    if (route.hidden) {
      continue;
    }
    const absolute = route.path.length > 0 && route.path.startsWith("/") ? route.path : `/${route.path}`;
    const path = isHttp(route.path) ? route.path : getNormalPath(`${basePath}${absolute}`);
    const title = [...prefixTitle];
    if (route.meta?.title) {
      title.push(route.meta.title);
      const icon = route.meta.icon ?? "";
      if (route.redirect !== "noRedirect") {
        const item: HeaderSearchItem = { path, title, icon };
        if (route.backendQuery) {
          item.query = route.backendQuery;
        }
        result.push(item);
      }
    }
    if (route.children) {
      result.push(...generateSearchRoutes(route.children, path, title));
    }
  }
  return result;
}

export function createHeaderSearchIndex(items: readonly HeaderSearchItem[]): Fuse<HeaderSearchItem> {
  return new Fuse([...items], {
    shouldSort: true,
    threshold: 0.2,
    distance: 100,
    minMatchCharLength: 1,
    keys: [
      { name: "title", weight: 0.7 },
      { name: "path", weight: 0.3 },
    ],
  });
}

export function searchHeaderItems(
  pool: readonly HeaderSearchItem[],
  fuse: Fuse<HeaderSearchItem> | null,
  query: string,
): HeaderSearchItem[] {
  if (query.length === 0) {
    return [...pool];
  }
  const lowered = query.toLowerCase();
  const pathMatches = pool.filter((item) => item.path.toLowerCase().includes(lowered));
  const fuseMatches = fuse ? fuse.search(query).map((item) => item.item) : [];
  const merged = [...pathMatches];
  for (const item of fuseMatches) {
    if (!merged.some((current) => current.path === item.path)) {
      merged.push(item);
    }
  }
  return merged;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function highlightText(text: string, keyword: string): string {
  const safe = escapeHtml(text);
  if (keyword.length === 0) {
    return safe;
  }
  const pattern = new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, "gi");
  return safe.replace(pattern, '<span class="highlight">$1</span>');
}

export function nextActiveIndex(current: number, length: number, direction: "up" | "down"): number {
  if (length === 0) {
    return -1;
  }
  if (direction === "up") {
    return current <= 0 ? length - 1 : current - 1;
  }
  return current >= length - 1 ? 0 : current + 1;
}

export function parseBackendQuery(query: string | undefined): Record<string, string> | undefined {
  if (!query) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(query);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return undefined;
  }
}
