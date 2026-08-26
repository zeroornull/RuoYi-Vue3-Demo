import type { LocationQuery, RouteLocationRaw } from "vue-router";

export function unauthorizedBackTarget(query: LocationQuery): RouteLocationRaw {
  if (query.noGoBack === "true" || query.noGoBack === "1") {
    return { path: "/" };
  }
  return { path: "__history_back__" };
}

export function shouldHistoryBack(target: RouteLocationRaw): boolean {
  return typeof target !== "string" && "path" in target && target.path === "__history_back__";
}
