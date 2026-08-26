import type { App } from "vue";
import { createWebHistory } from "vue-router";
import { setSessionExpiredHandler } from "../http";
import { pinia } from "../stores";
import { setAccessCleanupHandler } from "../stores/access-cleanup";
import { useLockStore } from "../stores/modules/lock";
import { usePermissionStore } from "../stores/modules/permission";
import { useSettingsStore } from "../stores/modules/settings";
import { useUserStore } from "../stores/modules/user";
import { createStaticRouter } from "./factory";
import { createAccessBootstrapper } from "./access-bootstrap";
import { DynamicRouteRegistry } from "./dynamic-registry";
import { navigationProgress } from "./progress";
import { ROUTE_NAMES } from "./types";

export const dynamicRouteRegistry = new DynamicRouteRegistry();

export const router = createStaticRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  progress: navigationProgress,
  guard: (routerInstance) => {
    const bootstrap = createAccessBootstrapper(async () => {
      const user = useUserStore(pinia);
      const permission = usePermissionStore(pinia);
      if (!user.rolesLoaded) await user.getInfo();
      const routes = await permission.generateRoutes({
        roles: user.roles,
        permissions: user.permissions,
      });
      dynamicRouteRegistry.sync(routerInstance, routes);
    });
    return {
      isAuthenticated: () => useUserStore(pinia).isAuthenticated,
      isLocked: () => useLockStore(pinia).isLock,
      setTitle: (title) => useSettingsStore(pinia).setTitle(title),
      isAccessReady: () =>
        useUserStore(pinia).rolesLoaded &&
        usePermissionStore(pinia).status === "loaded",
      ensureAccess: bootstrap.ensureAccess,
      onAccessError: () => useUserStore(pinia).resetSession(),
    };
  },
});

export function installRouter(app: App): void {
  setAccessCleanupHandler(() => {
    dynamicRouteRegistry.clear();
    usePermissionStore(pinia).resetRoutes();
  });
  setSessionExpiredHandler(async () => {
    useUserStore(pinia).resetSession();
    const redirect = router.currentRoute.value.fullPath;
    await router.replace({
      name: ROUTE_NAMES.login,
      query: redirect === "/" ? {} : { redirect },
    });
  });
  app.use(router);
}

export { ROUTE_NAMES } from "./types";
export default router;
