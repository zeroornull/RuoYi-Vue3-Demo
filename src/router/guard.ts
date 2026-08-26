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
  return (to) => {
    if (to.meta.title) deps.setTitle(to.meta.title);

    if (!deps.isAuthenticated()) {
      return to.meta.public ? true : loginRedirect(to);
    }

    if (to.name === ROUTE_NAMES.login || to.name === ROUTE_NAMES.register) {
      return { name: ROUTE_NAMES.index, replace: true };
    }

    if (deps.isLocked() && to.name !== ROUTE_NAMES.lock) {
      return { name: ROUTE_NAMES.lock, replace: true };
    }

    if (!deps.isLocked() && to.name === ROUTE_NAMES.lock) {
      return { name: ROUTE_NAMES.index, replace: true };
    }

    return true;
  };
}
