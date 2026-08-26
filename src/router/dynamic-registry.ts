import type { Router } from "vue-router";
import type { AppRouteRecordRaw } from "./types";

export type DynamicRegistrationResult = {
  added: string[];
  skipped: string[];
};

function routeKey(route: AppRouteRecordRaw): string {
  return route.name ? `name:${route.name}` : `path:${route.path}`;
}

export class DynamicRouteRegistry {
  private readonly removers = new Map<string, () => void>();

  sync(router: Router, routes: readonly AppRouteRecordRaw[]): DynamicRegistrationResult {
    const added: string[] = [];
    const skipped: string[] = [];
    for (const route of routes) {
      const key = routeKey(route);
      if (this.removers.has(key) || (route.name !== undefined && router.hasRoute(route.name))) {
        skipped.push(key);
        continue;
      }
      this.removers.set(key, router.addRoute(route));
      added.push(key);
    }
    return { added, skipped };
  }

  clear(): void {
    for (const remove of [...this.removers.values()].reverse()) remove();
    this.removers.clear();
  }

  keys(): string[] {
    return [...this.removers.keys()];
  }
}
