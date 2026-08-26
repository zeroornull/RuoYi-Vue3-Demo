import type {
  NavigationGuard,
  RouteLocationNormalizedGeneric,
  RouteLocationRaw,
} from "vue-router";
import { ROUTE_NAMES } from "./types";

export type StaticGuardDeps = {
  isAuthenticated: () => boolean;
  isLocked: () => boolean;
  setTitle: (title: string) => void;
  isAccessReady?: () => boolean;
  ensureAccess?: () => Promise<void>;
  onAccessError?: (error: unknown) => void | Promise<void>;
};

function loginRedirect(to: RouteLocationNormalizedGeneric): RouteLocationRaw {
  return {
    name: ROUTE_NAMES.login,
    query: { redirect: to.fullPath },
    replace: true,
  };
}

export function createStaticNavigationGuard(
  deps: StaticGuardDeps,
): NavigationGuard {
  return async (to) => {
    if (to.meta.title) deps.setTitle(to.meta.title);

    if (!deps.isAuthenticated()) {
      return to.meta.public ? true : loginRedirect(to);
    }

    if (to.name === ROUTE_NAMES.login || to.name === ROUTE_NAMES.register) {
      return { name: ROUTE_NAMES.index, replace: true };
    }

    if (to.meta.public) return true;

    if (deps.isLocked() && to.name !== ROUTE_NAMES.lock) {
      return { name: ROUTE_NAMES.lock, replace: true };
    }

    if (!deps.isLocked() && to.name === ROUTE_NAMES.lock) {
      return { name: ROUTE_NAMES.index, replace: true };
    }

    if (
      deps.isAccessReady &&
      deps.ensureAccess &&
      !deps.isAccessReady()
    ) {
      try {
        await deps.ensureAccess();
        if (!deps.isAccessReady()) {
          throw new Error("Access bootstrap completed without ready state");
        }
        return { path: to.fullPath, replace: true };
      } catch (error) {
        await deps.onAccessError?.(error);
        return loginRedirect(to);
      }
    }

    return true;
  };
}
