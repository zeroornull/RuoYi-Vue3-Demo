import { describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory } from "vue-router";
import { createMemoryStore } from "../../../src/http/cache";
import { createAccessBootstrapper } from "../../../src/router/access-bootstrap";
import { DynamicRouteRegistry } from "../../../src/router/dynamic-registry";
import { createStaticRouter } from "../../../src/router/factory";
import { ROUTE_NAMES } from "../../../src/router/types";
import { clearAccessState, setAccessCleanupHandler } from "../../../src/stores/access-cleanup";
import { createUsePermissionStore } from "../../../src/stores/modules/permission-core";
import { createUseUserStore } from "../../../src/stores/modules/user-core";
import type { UserInfoResponse } from "../../../src/types/api";

type FixtureOptions = {
  failGetInfo?: boolean;
  failGetRouters?: boolean;
};

function userInfo(): UserInfoResponse {
  return {
    code: 200,
    user: {
      userId: "1",
      userName: "sample",
      nickName: "示例",
      status: "0",
    },
    roles: ["manager"],
    permissions: ["system:user:list"],
  };
}

function createFixture(options: FixtureOptions = {}) {
  setActivePinia(createPinia());
  const calls = { getInfo: 0, getRouters: 0, logout: 0 };
  const persistedToken = { value: "token-1" as string | undefined };
  const permission = createUsePermissionStore({
    constantRoutes: [],
    protectedRoutes: [],
    loadBackendRoutes: async () => {
      calls.getRouters += 1;
      if (options.failGetRouters) throw new Error("getRouters failed");
      return [
        {
          path: "/dynamic-users",
          name: "DynamicUsers",
          component: "system/user/index",
          meta: { title: "动态用户" },
        },
      ];
    },
  })();
  const user = createUseUserStore({
    login: async () => ({ code: 200, token: "token-2" }),
    getInfo: async () => {
      calls.getInfo += 1;
      if (options.failGetInfo) throw new Error("getInfo failed");
      return userInfo();
    },
    logout: async () => {
      calls.logout += 1;
      return { code: 200 };
    },
    readToken: () => persistedToken.value,
    writeToken: (token) => {
      persistedToken.value = token;
    },
    clearToken: () => {
      persistedToken.value = undefined;
    },
    clearAccess: clearAccessState,
    unlockScreen: () => undefined,
    baseApi: "/dev-api",
    sessionStorage: createMemoryStore(),
  })();
  const registry = new DynamicRouteRegistry();
  const router = createStaticRouter({
    history: createMemoryHistory(),
    guard: (routerInstance) => {
      const bootstrap = createAccessBootstrapper(async () => {
        if (!user.rolesLoaded) await user.getInfo();
        const routes = await permission.generateRoutes({
          roles: user.roles,
          permissions: user.permissions,
        });
        registry.sync(routerInstance, routes);
      });
      return {
        isAuthenticated: () => user.isAuthenticated,
        isLocked: () => false,
        setTitle: () => undefined,
        isAccessReady: () => user.rolesLoaded && permission.status === "loaded",
        ensureAccess: bootstrap.ensureAccess,
        onAccessError: () => user.resetSession(),
      };
    },
  });
  setAccessCleanupHandler(() => {
    registry.clear();
    permission.resetRoutes();
  });
  return { router, registry, user, permission, calls, persistedToken };
}

describe("authentication and dynamic routing loop", () => {
  test("restores user info/routes on first protected navigation and after refresh", async () => {
    const first = createFixture();
    await first.router.push("/dynamic-users");
    await first.router.isReady();
    expect(first.router.currentRoute.value.name).toBe("DynamicUsers");
    expect(first.calls).toEqual({ getInfo: 1, getRouters: 1, logout: 0 });
    expect(first.permission.status).toBe("loaded");
    expect(first.registry.keys()).toEqual(["name:DynamicUsers"]);

    await first.router.push("/dynamic-users?again=1");
    expect(first.calls.getInfo).toBe(1);
    expect(first.calls.getRouters).toBe(1);

    const refreshed = createFixture();
    await refreshed.router.push("/dynamic-users");
    await refreshed.router.isReady();
    expect(refreshed.router.currentRoute.value.name).toBe("DynamicUsers");
    expect(refreshed.calls.getInfo).toBe(1);
    expect(refreshed.calls.getRouters).toBe(1);
  });

  test("invalid token/getInfo failure resets once and lands on login without a loop", async () => {
    const fixture = createFixture({ failGetInfo: true });
    await fixture.router.push("/dynamic-users");
    await fixture.router.isReady();
    expect(fixture.router.currentRoute.value.name).toBe(ROUTE_NAMES.login);
    expect(fixture.calls.getInfo).toBe(1);
    expect(fixture.calls.getRouters).toBe(0);
    expect(fixture.user.token).toBeNull();
    expect(fixture.persistedToken.value).toBeUndefined();
    expect(fixture.permission.status).toBe("idle");
  });

  test("getRouters failure clears partially loaded identity and dynamic access", async () => {
    const fixture = createFixture({ failGetRouters: true });
    await fixture.router.push("/dynamic-users");
    await fixture.router.isReady();
    expect(fixture.router.currentRoute.value.name).toBe(ROUTE_NAMES.login);
    expect(fixture.calls.getInfo).toBe(1);
    expect(fixture.calls.getRouters).toBe(1);
    expect(fixture.user.profile).toBeNull();
    expect(fixture.user.rolesLoaded).toBe(false);
    expect(fixture.registry.keys()).toEqual([]);
    expect(fixture.permission.status).toBe("idle");
  });

  test("logout removes registered routes so old protected URLs are no longer resolved", async () => {
    const fixture = createFixture();
    await fixture.router.push("/dynamic-users");
    await fixture.router.isReady();
    expect(fixture.router.hasRoute("DynamicUsers")).toBe(true);

    await fixture.user.logOut();
    expect(fixture.calls.logout).toBe(1);
    expect(fixture.router.hasRoute("DynamicUsers")).toBe(false);
    expect(fixture.router.resolve("/dynamic-users").name).toBe(ROUTE_NAMES.notFound);
    expect(fixture.permission.status).toBe("idle");
  });
});

describe("access bootstrap single-flight", () => {
  test("coalesces concurrent access restoration", async () => {
    let calls = 0;
    let release: () => void = () => undefined;
    const bootstrap = createAccessBootstrapper(
      () =>
        new Promise<void>((resolve) => {
          calls += 1;
          release = resolve;
        }),
    );
    const first = bootstrap.ensureAccess();
    const second = bootstrap.ensureAccess();
    expect(first).toBe(second);
    expect(bootstrap.isPending()).toBe(true);
    await Promise.resolve();
    expect(calls).toBe(1);
    release();
    await Promise.all([first, second]);
    expect(calls).toBe(1);
    expect(bootstrap.isPending()).toBe(false);
  });
});
