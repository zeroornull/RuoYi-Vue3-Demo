import {
  createRouter,
  type Router,
  type RouterHistory,
  type RouterScrollBehavior,
} from "vue-router";
import { createStaticNavigationGuard, type StaticGuardDeps } from "./guard";
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
  guard: StaticGuardDeps;
}): Router {
  const router = createRouter({
    history: options.history,
    routes: staticRoutes,
    scrollBehavior: staticScrollBehavior,
  });
  router.beforeEach(createStaticNavigationGuard(options.guard));
  return router;
}
