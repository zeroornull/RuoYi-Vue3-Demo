import { describe, expect, test } from "bun:test";
import { createMemoryHistory, loadRouteLocation } from "vue-router";
import {
  createStaticRouter,
  resolveScrollPosition,
} from "../../../src/router/factory";
import {
  buildRedirectLocation,
  parseProfileActiveTab,
  parseSingleRouteParam,
} from "../../../src/router/params";
import { staticRoutes } from "../../../src/router/routes";
import {
  assertUniqueRouteNames,
  collectRouteNames,
  ROUTE_NAMES,
} from "../../../src/router/types";

function testRouter(options: {
  authenticated?: boolean;
  locked?: boolean;
  base?: string;
} = {}) {
  const title = { value: "" };
  const state = {
    authenticated: options.authenticated ?? true,
    locked: options.locked ?? false,
  };
  const router = createStaticRouter({
    history: createMemoryHistory(options.base ?? "/"),
    guard: {
      isAuthenticated: () => state.authenticated,
      isLocked: () => state.locked,
      setTitle: (value) => {
        title.value = value;
      },
    },
  });
  return { router, state, title };
}

describe("static route definitions", () => {
  test("uses the configured history base and unique string names", () => {
    const { router } = testRouter({ base: "/console/" });
    expect(router.options.history.base).toBe("/console");
    expect(collectRouteNames(staticRoutes)).toEqual([
      "Redirect",
      "Login",
      "Register",
      "Unauthorized",
      "Root",
      "Index",
      "Lock",
      "User",
      "Profile",
      "NotFound",
    ]);
    expect(() => assertUniqueRouteNames(staticRoutes)).not.toThrow();
    expect(() =>
      assertUniqueRouteNames([
        ...staticRoutes,
        { path: "/duplicate", name: ROUTE_NAMES.login, redirect: "/login" },
      ]),
    ).toThrow("Duplicate route name: Login");
  });

  test("matches unknown addresses with the catch-all route", async () => {
    const { router } = testRouter();
    await router.push("/does/not/exist");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.notFound);
    expect(router.currentRoute.value.params.pathMatch).toEqual([
      "does",
      "not",
      "exist",
    ]);
  });

  test("resolves lazy placeholder components during navigation", async () => {
    const { router } = testRouter();
    await router.push("/index");
    await router.isReady();
    const loaded = await loadRouteLocation(router.currentRoute.value);
    expect(loaded.name).toBe(ROUTE_NAMES.index);
    expect(loaded.matched.at(-1)?.components?.default).toBeTruthy();
  });

  test("navigates every public placeholder route anonymously", async () => {
    for (const [path, expectedName] of [
      ["/login", ROUTE_NAMES.login],
      ["/register", ROUTE_NAMES.register],
      ["/401", ROUTE_NAMES.unauthorized],
    ] as const) {
      const { router } = testRouter({ authenticated: false });
      await router.push(path);
      await router.isReady();
      expect(router.currentRoute.value.name).toBe(expectedName);
      const loaded = await loadRouteLocation(router.currentRoute.value);
      expect(loaded.matched.at(-1)?.components?.default).toBeTruthy();
    }
  });
});

describe("route params and redirects", () => {
  test("parses single and optional profile params without assertions", () => {
    expect(parseSingleRouteParam("resetPwd")).toBe("resetPwd");
    expect(parseSingleRouteParam(["userinfo"])).toBe("userinfo");
    expect(parseSingleRouteParam(["a", "b"])).toBeNull();
    expect(parseSingleRouteParam(undefined)).toBeNull();
    expect(parseProfileActiveTab("userinfo")).toBe("userinfo");
    expect(parseProfileActiveTab("resetPwd")).toBe("resetPwd");
    expect(parseProfileActiveTab("unknown")).toBeNull();
  });

  test("restores redirect target path and query", async () => {
    const { router } = testRouter();
    await router.push("/redirect/user/profile/resetPwd?source=notice");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.profile);
    expect(router.currentRoute.value.path).toBe("/user/profile/resetPwd");
    expect(router.currentRoute.value.params.activeTab).toBe("resetPwd");
    expect(router.currentRoute.value.query.source).toBe("notice");

    expect(buildRedirectLocation(["a", "b"], {})).toEqual({
      path: "/index",
      query: {},
    });
  });
});

describe("static navigation guard", () => {
  test("redirects anonymous protected navigation with the original fullPath", async () => {
    const { router, title } = testRouter({ authenticated: false });
    await router.push("/user/profile/resetPwd?source=notice");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.login);
    expect(router.currentRoute.value.query.redirect).toBe(
      "/user/profile/resetPwd?source=notice",
    );
    expect(title.value).toBe("登录");
  });

  test("redirects authenticated guest pages and enforces lock state", async () => {
    const fixture = testRouter({ authenticated: true });
    await fixture.router.push("/login");
    await fixture.router.isReady();
    expect(fixture.router.currentRoute.value.name).toBe(ROUTE_NAMES.index);

    fixture.state.locked = true;
    await fixture.router.push("/user/profile");
    expect(fixture.router.currentRoute.value.name).toBe(ROUTE_NAMES.lock);

    fixture.state.locked = false;
    await fixture.router.push("/index");
    await fixture.router.push("/lock");
    expect(fixture.router.currentRoute.value.name).toBe(ROUTE_NAMES.index);
  });
});

describe("scroll behavior", () => {
  test("restores saved positions and otherwise scrolls to the top", () => {
    const saved = { left: 12, top: 34 };
    expect(resolveScrollPosition(saved)).toBe(saved);
    expect(resolveScrollPosition(null)).toEqual({ top: 0 });
  });
});

describe("round 11 boundary", () => {
  test("does not request or register dynamic routes", async () => {
    const sources = await Promise.all(
      ["routes.ts", "guard.ts", "factory.ts", "index.ts"].map((file) =>
        Bun.file(`src/router/${file}`).text(),
      ),
    );
    const combined = sources.join("\n");
    expect(combined).not.toContain("getRouters");
    expect(combined).not.toContain("addRoute(");
    expect(combined).not.toContain("roles.includes");
    expect(combined).not.toContain("permissions.includes");
  });
});
