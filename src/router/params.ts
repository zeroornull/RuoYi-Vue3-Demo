import type { LocationQuery, RouteLocationRaw } from "vue-router";

export const PROFILE_TABS = ["userinfo", "resetPwd"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export function parseSingleRouteParam(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    Array.isArray(value) &&
    value.length === 1 &&
    typeof value[0] === "string"
  ) {
    return value[0];
  }
  return null;
}

export function parseProfileActiveTab(value: unknown): ProfileTab | null {
  const parsed = parseSingleRouteParam(value);
  return parsed === "userinfo" || parsed === "resetPwd" ? parsed : null;
}

export function buildRedirectLocation(
  pathParam: unknown,
  query: LocationQuery,
): RouteLocationRaw {
  const parsed = parseSingleRouteParam(pathParam);
  const normalized = parsed?.replace(/^\/+/, "") ?? "";
  const path =
    normalized.length === 0 || normalized.startsWith("redirect/")
      ? "/index"
      : `/${normalized}`;
  return { path, query: { ...query } };
}
