import type { App } from "vue";
import { createWebHistory } from "vue-router";
import { setSessionExpiredHandler } from "../http";
import { pinia } from "../stores";
import { useLockStore } from "../stores/modules/lock";
import { useSettingsStore } from "../stores/modules/settings";
import { useUserStore } from "../stores/modules/user";
import { createStaticRouter } from "./factory";
import { ROUTE_NAMES } from "./types";

export const router = createStaticRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  guard: {
    isAuthenticated: () => useUserStore(pinia).isAuthenticated,
    isLocked: () => useLockStore(pinia).isLock,
    setTitle: (title) => useSettingsStore(pinia).setTitle(title),
  },
});

export function installRouter(app: App): void {
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
