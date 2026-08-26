import type { RouteLocationNormalizedLoadedGeneric, RouteLocationRaw } from "vue-router";
import type { AppDevice } from "../stores/modules/app";
import type { TagViewInput, TagViewMeta } from "../stores/modules/tags-view";
import type { AppRouteRecordRaw } from "../router/types";
import { ROUTE_NAMES } from "../router/types";
import { isExternal } from "../utils/validate";

export const MOBILE_BREAKPOINT = 992;

export function resolveLayoutDevice(width: number, breakpoint = MOBILE_BREAKPOINT): AppDevice {
  return width < breakpoint ? "mobile" : "desktop";
}

export function joinRoutePath(basePath: string, routePath: string): string {
  if (isExternal(routePath)) return routePath;
  if (routePath.startsWith("/")) return routePath.replace(/\/{2,}/g, "/");
  const base = basePath === "/" ? "" : basePath.replace(/\/$/, "");
  return `${base}/${routePath}`.replace(/\/{2,}/g, "/") || "/";
}

export function resolveActiveMenu(route: { path: string; meta: { activeMenu?: string } }): string {
  return route.meta.activeMenu ?? route.path;
}

export function visibleMenuRoutes(routes: readonly AppRouteRecordRaw[]): AppRouteRecordRaw[] {
  return routes.filter((route) => route.hidden !== true);
}

function routeMetaToTagMeta(meta: RouteLocationNormalizedLoadedGeneric["meta"]): TagViewMeta {
  return {
    ...(meta.title === undefined ? {} : { title: meta.title }),
    ...(meta.icon === undefined ? {} : { icon: meta.icon }),
    ...(meta.noCache === undefined ? {} : { noCache: meta.noCache }),
    ...(meta.affix === undefined ? {} : { affix: meta.affix }),
    ...(meta.link === undefined ? {} : { link: meta.link }),
  };
}

export function routeToTagView(route: RouteLocationNormalizedLoadedGeneric): TagViewInput | null {
  if (typeof route.name !== "string") return null;
  return {
    path: route.path,
    fullPath: route.fullPath,
    name: route.name,
    title: route.meta.title ?? route.name,
    query: { ...route.query },
    meta: routeMetaToTagMeta(route.meta),
  };
}

export function collectAffixTags(routes: readonly AppRouteRecordRaw[], basePath = ""): TagViewInput[] {
  const tags: TagViewInput[] = [];
  for (const route of routes) {
    const path = joinRoutePath(basePath, route.path);
    if (route.meta?.affix && typeof route.name === "string") {
      tags.push({
        path,
        fullPath: path,
        name: route.name,
        title: route.meta.title ?? route.name,
        meta: {
          ...(route.meta.title === undefined ? {} : { title: route.meta.title }),
          ...(route.meta.icon === undefined ? {} : { icon: route.meta.icon }),
          affix: true,
          ...(route.meta.noCache === undefined ? {} : { noCache: route.meta.noCache }),
          ...(route.meta.link === undefined ? {} : { link: route.meta.link }),
        },
      });
    }
    if (route.children) tags.push(...collectAffixTags(route.children, path));
  }
  return tags;
}

export function normalizeKeepAliveNames(names: readonly string[]): string[] {
  return [...new Set(names.filter((name) => name.trim().length > 0))];
}

export function sanitizeIframeUrl(link: string | null | undefined): string | null {
  if (!link) return null;
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function fallbackAfterClose(visitedPaths: readonly string[]): RouteLocationRaw {
  return visitedPaths.at(-1) ?? { name: ROUTE_NAMES.index };
}

export function shouldUseAdminShell(route: {
  name?: string | symbol | null | undefined;
  meta: { public?: boolean };
}): boolean {
  return (
    route.name != null &&
    route.meta.public !== true &&
    route.name !== ROUTE_NAMES.lock &&
    route.name !== ROUTE_NAMES.notFound
  );
}
