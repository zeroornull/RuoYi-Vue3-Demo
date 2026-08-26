import type { AppRouteRecordRaw } from "./types";

export const ALL_PERMISSION = "*:*:*";
export const SUPER_ADMIN_ROLE = "admin";

export type RouteAccess = {
  roles: readonly string[];
  permissions: readonly string[];
};

export function hasAnyRole(
  required: readonly string[],
  actual: readonly string[],
): boolean {
  return (
    actual.includes(SUPER_ADMIN_ROLE) ||
    required.some((role) => actual.includes(role))
  );
}

export function hasAnyPermission(
  required: readonly string[],
  actual: readonly string[],
): boolean {
  return (
    actual.includes(ALL_PERMISSION) ||
    required.some((permission) => actual.includes(permission))
  );
}

export function canAccessRoute(
  route: AppRouteRecordRaw,
  access: RouteAccess,
): boolean {
  const roleAllowed =
    !route.roles || route.roles.length === 0 || hasAnyRole(route.roles, access.roles);
  const permissionAllowed =
    !route.permissions ||
    route.permissions.length === 0 ||
    hasAnyPermission(route.permissions, access.permissions);
  return roleAllowed && permissionAllowed;
}

export function filterRoutesByAccess(
  routes: readonly AppRouteRecordRaw[],
  access: RouteAccess,
): AppRouteRecordRaw[] {
  const filtered: AppRouteRecordRaw[] = [];
  for (const route of routes) {
    if (!canAccessRoute(route, access)) continue;
    const children = route.children
      ? filterRoutesByAccess(route.children, access)
      : undefined;
    if (route.children && route.children.length > 0 && children?.length === 0) {
      continue;
    }
    filtered.push({
      ...route,
      ...(route.meta ? { meta: { ...route.meta } } : {}),
      ...(children === undefined ? {} : { children }),
    });
  }
  return filtered;
}
