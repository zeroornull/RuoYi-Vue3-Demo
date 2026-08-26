import {
  createRouter,
  type Router,
  type RouterHistory,
  type RouterScrollBehavior,
} from "vue-router";
import { createStaticNavigationGuard, type StaticGuardDeps } from "./guard";
import type { NavigationProgress } from "./progress";
import { staticRoutes } from "./routes";

export type SavedScrollPosition = { left: number; top: number };

export function resolveScrollPosition(
  savedPosition: SavedScrollPosition | null,
): SavedScrollPosition | { top: 0 } {
  return savedPosition ?? { top: 0 };
}

export const staticScrollBehavior: RouterScrollBehavior = (
  _to,
  _from,
  savedPosition,
) => resolveScrollPosition(savedPosition);

export function createStaticRouter(options: {
  history: RouterHistory;
  guard: StaticGuardDeps | ((router: Router) => StaticGuardDeps);
  progress?: NavigationProgress;
}): Router {
  const router = createRouter({
    history: options.history,
    routes: staticRoutes,
    scrollBehavior: staticScrollBehavior,
  });
  if (options.progress) {
    router.beforeEach(() => {
      options.progress?.start();
      return true;
    });
    router.afterEach(() => options.progress?.done());
    router.onError(() => options.progress?.done());
  }
  const guard =
    typeof options.guard === "function" ? options.guard(router) : options.guard;
  router.beforeEach(createStaticNavigationGuard(guard));
  return router;
}
