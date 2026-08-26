import { describe, expect, test } from "bun:test";
import { createMemoryHistory, createRouter } from "vue-router";
import { DynamicRouteRegistry } from "../../../src/router/dynamic-registry";
import { staticRoutes } from "../../../src/router/routes";

function routerFixture() {
  return createRouter({ history: createMemoryHistory(), routes: staticRoutes });
}

describe("dynamic route registry", () => {
  test("registers once, skips duplicates and removes routes on clear", () => {
    const router = routerFixture();
    const registry = new DynamicRouteRegistry();
    const routes = [
      {
        path: "/dynamic-users",
        name: "DynamicUsers",
        redirect: "/index",
      },
    ];
    expect(registry.sync(router, routes)).toEqual({
      added: ["name:DynamicUsers"],
      skipped: [],
    });
    expect(router.hasRoute("DynamicUsers")).toBe(true);
    expect(router.resolve("/dynamic-users").name).toBe("DynamicUsers");

    expect(registry.sync(router, routes)).toEqual({
      added: [],
      skipped: ["name:DynamicUsers"],
    });
    expect(registry.keys()).toEqual(["name:DynamicUsers"]);

    registry.clear();
    expect(router.hasRoute("DynamicUsers")).toBe(false);
    expect(router.resolve("/dynamic-users").name).toBe("NotFound");
    expect(registry.keys()).toEqual([]);
  });

  test("restores the same dynamic route on a fresh router instance", () => {
    const firstRouter = routerFixture();
    const route = {
      path: "/refreshable",
      name: "Refreshable",
      redirect: "/index",
    };
    new DynamicRouteRegistry().sync(firstRouter, [route]);
    expect(firstRouter.hasRoute("Refreshable")).toBe(true);

    const refreshedRouter = routerFixture();
    const refreshedRegistry = new DynamicRouteRegistry();
    refreshedRegistry.sync(refreshedRouter, [route]);
    expect(refreshedRouter.hasRoute("Refreshable")).toBe(true);
    expect(refreshedRouter.resolve("/refreshable").name).toBe("Refreshable");
  });
});
