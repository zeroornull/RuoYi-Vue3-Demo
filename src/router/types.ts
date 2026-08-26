import type { RouteRecordRaw } from "vue-router";

export const ROUTE_NAMES = {
  redirect: "Redirect",
  login: "Login",
  register: "Register",
  unauthorized: "Unauthorized",
  root: "Root",
  index: "Index",
  lock: "Lock",
  user: "User",
  profile: "Profile",
  notFound: "NotFound",
} as const;

export type AppRouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export type AppRouteRecordRaw = RouteRecordRaw & {
  name?: AppRouteName;
  hidden?: boolean;
  alwaysShow?: boolean;
  roles?: string[];
  permissions?: string[];
  children?: AppRouteRecordRaw[];
};

export function collectRouteNames(
  routes: readonly AppRouteRecordRaw[],
): AppRouteName[] {
  const names: AppRouteName[] = [];
  for (const route of routes) {
    if (route.name !== undefined) {
      if (typeof route.name !== "string") {
        throw new Error("Application route names must be strings");
      }
      names.push(route.name);
    }
    if (route.children) names.push(...collectRouteNames(route.children));
  }
  return names;
}

export function assertUniqueRouteNames(
  routes: readonly AppRouteRecordRaw[],
): void {
  const seen = new Set<string>();
  for (const name of collectRouteNames(routes)) {
    if (seen.has(name)) throw new Error(`Duplicate route name: ${name}`);
    seen.add(name);
  }
}
