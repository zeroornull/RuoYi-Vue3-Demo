import { defineStore } from "pinia";
import { shallowRef } from "vue";
import { filterRoutesByAccess, type RouteAccess } from "../../router/access";
import { parseBackendRoutes } from "../../router/backend-dto";
import { transformBackendRoutes } from "../../router/transform";
import type { RouteTransformIssue } from "../../router/transform";
import { assertUniqueRouteNames, type AppRouteRecordRaw } from "../../router/types";

export type PermissionRoute = AppRouteRecordRaw;
export type PermissionRouteStatus = "idle" | "loading" | "loaded" | "error";

export type PermissionStoreDeps = {
  constantRoutes: readonly PermissionRoute[];
  protectedRoutes: readonly PermissionRoute[];
  loadBackendRoutes: () => Promise<unknown>;
  reportIssues?: (issues: readonly RouteTransformIssue[]) => void;
};

function cloneRoutes(routes: readonly PermissionRoute[]): PermissionRoute[] {
  return routes.map((route) => ({
    ...route,
    ...(route.meta ? { meta: { ...route.meta } } : {}),
    ...(route.children ? { children: cloneRoutes(route.children) } : {}),
  }));
}

export function createUsePermissionStore(deps: PermissionStoreDeps) {
  return defineStore("permission", () => {
    const routes = shallowRef<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const addRoutes = shallowRef<PermissionRoute[]>([]);
    const defaultRoutes = shallowRef<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const topbarRouters = shallowRef<PermissionRoute[]>([]);
    const sidebarRouters = shallowRef<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const issues = shallowRef<RouteTransformIssue[]>([]);
    const status = shallowRef<PermissionRouteStatus>("idle");

    function setRoutes(value: readonly PermissionRoute[]): void {
      addRoutes.value = cloneRoutes(value);
      routes.value = [...cloneRoutes(deps.constantRoutes), ...cloneRoutes(value)];
      status.value = "loaded";
    }

    function setDefaultRoutes(value: readonly PermissionRoute[]): void {
      defaultRoutes.value = [...cloneRoutes(deps.constantRoutes), ...cloneRoutes(value)];
    }

    function setTopbarRoutes(value: readonly PermissionRoute[]): void {
      topbarRouters.value = cloneRoutes(value);
    }

    function setSidebarRouters(value: readonly PermissionRoute[]): void {
      sidebarRouters.value = [...cloneRoutes(deps.constantRoutes), ...cloneRoutes(value)];
    }

    async function generateRoutes(access: RouteAccess): Promise<PermissionRoute[]> {
      status.value = "loading";
      try {
        const raw = await deps.loadBackendRoutes();
        const dtos = parseBackendRoutes(raw);
        const transformed = transformBackendRoutes(dtos);
        const allowedProtected = filterRoutesByAccess(deps.protectedRoutes, access);
        const dynamic = [...transformed.routes, ...allowedProtected];
        assertUniqueRouteNames([...deps.constantRoutes, ...dynamic]);
        issues.value = [...transformed.issues];
        deps.reportIssues?.(issues.value);
        setRoutes(dynamic);
        setSidebarRouters(transformed.routes);
        setDefaultRoutes(transformed.routes);
        setTopbarRoutes(transformed.routes);
        return cloneRoutes(dynamic);
      } catch (error) {
        status.value = "error";
        throw error;
      }
    }

    function resetRoutes(): void {
      routes.value = cloneRoutes(deps.constantRoutes);
      addRoutes.value = [];
      defaultRoutes.value = cloneRoutes(deps.constantRoutes);
      topbarRouters.value = [];
      sidebarRouters.value = cloneRoutes(deps.constantRoutes);
      issues.value = [];
      status.value = "idle";
    }

    return {
      routes,
      addRoutes,
      defaultRoutes,
      topbarRouters,
      sidebarRouters,
      issues,
      status,
      setRoutes,
      setDefaultRoutes,
      setTopbarRoutes,
      setSidebarRouters,
      generateRoutes,
      resetRoutes,
    };
  });
}
