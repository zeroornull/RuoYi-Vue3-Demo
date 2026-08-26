import { defineStore } from "pinia";
import { ref } from "vue";
import type { RouteNode } from "../../types/api";

export type PermissionRoute = RouteNode;
export type PermissionRouteStatus = "idle" | "loaded";

export type PermissionStoreDeps = {
  constantRoutes: readonly PermissionRoute[];
};

const defaultDeps: PermissionStoreDeps = { constantRoutes: [] };

function cloneRoutes(routes: readonly PermissionRoute[]): PermissionRoute[] {
  return routes.map((route) => ({
    ...route,
    ...(route.meta ? { meta: { ...route.meta } } : {}),
    ...(route.children ? { children: cloneRoutes(route.children) } : {}),
  }));
}

export function createUsePermissionStore(
  deps: PermissionStoreDeps = defaultDeps,
) {
  return defineStore("permission", () => {
    const routes = ref<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const addRoutes = ref<PermissionRoute[]>([]);
    const defaultRoutes = ref<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const topbarRouters = ref<PermissionRoute[]>([]);
    const sidebarRouters = ref<PermissionRoute[]>(cloneRoutes(deps.constantRoutes));
    const status = ref<PermissionRouteStatus>("idle");

    function setRoutes(value: readonly PermissionRoute[]): void {
      addRoutes.value = cloneRoutes(value);
      routes.value = [...cloneRoutes(deps.constantRoutes), ...cloneRoutes(value)];
      status.value = "loaded";
    }

    function setDefaultRoutes(value: readonly PermissionRoute[]): void {
      defaultRoutes.value = [
        ...cloneRoutes(deps.constantRoutes),
        ...cloneRoutes(value),
      ];
    }

    function setTopbarRoutes(value: readonly PermissionRoute[]): void {
      topbarRouters.value = cloneRoutes(value);
    }

    function setSidebarRouters(value: readonly PermissionRoute[]): void {
      sidebarRouters.value = cloneRoutes(value);
    }

    function resetRoutes(): void {
      routes.value = cloneRoutes(deps.constantRoutes);
      addRoutes.value = [];
      defaultRoutes.value = cloneRoutes(deps.constantRoutes);
      topbarRouters.value = [];
      sidebarRouters.value = cloneRoutes(deps.constantRoutes);
      status.value = "idle";
    }

    return {
      routes,
      addRoutes,
      defaultRoutes,
      topbarRouters,
      sidebarRouters,
      status,
      setRoutes,
      setDefaultRoutes,
      setTopbarRoutes,
      setSidebarRouters,
      resetRoutes,
    };
  });
}

export const usePermissionStore = createUsePermissionStore();
export default usePermissionStore;
