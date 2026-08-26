import { describe, expect, test } from "bun:test";
import { createMemoryHistory, createRouter } from "vue-router";
import {
  collectAffixTags,
  fallbackAfterClose,
  joinRoutePath,
  normalizeKeepAliveNames,
  resolveActiveMenu,
  resolveLayoutDevice,
  routeToTagView,
  sanitizeIframeUrl,
  shouldUseAdminShell,
} from "../../../src/layout/model";
import { staticRoutes } from "../../../src/router/routes";

describe("layout model", () => {
  test("resolves desktop/mobile and menu paths", () => {
    expect(resolveLayoutDevice(1440)).toBe("desktop");
    expect(resolveLayoutDevice(991)).toBe("mobile");
    expect(joinRoutePath("/system", "user")).toBe("/system/user");
    expect(joinRoutePath("/system/", "/absolute")).toBe("/absolute");
    expect(joinRoutePath("/", "index")).toBe("/index");
    expect(joinRoutePath("/", "https://example.invalid")).toBe(
      "https://example.invalid",
    );
  });

  test("resolves active menu and shell boundaries", () => {
    expect(
      resolveActiveMenu({
        path: "/system/user/view",
        meta: { activeMenu: "/system/user" },
      }),
    ).toBe("/system/user");
    expect(resolveActiveMenu({ path: "/index", meta: {} })).toBe("/index");
    expect(shouldUseAdminShell({ name: "Index", meta: {} })).toBe(true);
    expect(
      shouldUseAdminShell({ name: "Login", meta: { public: true } }),
    ).toBe(false);
    expect(shouldUseAdminShell({ name: "Lock", meta: {} })).toBe(false);
  });

  test("collects fixed tags and normalizes keep-alive names", () => {
    const tags = collectAffixTags(staticRoutes);
    expect(tags).toEqual([
      {
        path: "/index",
        fullPath: "/index",
        name: "Index",
        title: "首页",
        meta: {
          title: "首页",
          icon: "dashboard",
          affix: true,
          noCache: false,
        },
      },
    ]);
    expect(normalizeKeepAliveNames(["Index", "", "Index", "Profile"])).toEqual([
      "Index",
      "Profile",
    ]);
    expect(fallbackAfterClose(["/index", "/user/profile"])).toBe(
      "/user/profile",
    );
    expect(fallbackAfterClose([])).toEqual({ name: "Index" });
  });

  test("derives a minimal tag from the current route", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: staticRoutes,
    });
    await router.push("/user/profile/resetPwd?source=menu");
    await router.isReady();
    expect(routeToTagView(router.currentRoute.value)).toEqual({
      path: "/user/profile/resetPwd",
      fullPath: "/user/profile/resetPwd?source=menu",
      name: "Profile",
      title: "个人中心",
      query: { source: "menu" },
      meta: { title: "个人中心", icon: "user" },
    });
  });

  test("accepts only http(s) iframe URLs", () => {
    expect(sanitizeIframeUrl("https://example.invalid/docs")).toBe(
      "https://example.invalid/docs",
    );
    expect(sanitizeIframeUrl("http://example.invalid/a")).toBe(
      "http://example.invalid/a",
    );
    expect(sanitizeIframeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeIframeUrl("/relative")).toBeNull();
  });
});
