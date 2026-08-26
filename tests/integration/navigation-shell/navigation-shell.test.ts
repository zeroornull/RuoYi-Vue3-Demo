import { describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { createMemoryStore } from "../../../src/http/cache";
import { buildThemeVariables } from "../../../src/layout/theme";
import {
  collectAffixTags,
  normalizeKeepAliveNames,
  resolveLayoutDevice,
  routeToTagView,
  sanitizeIframeUrl,
} from "../../../src/layout/model";
import { staticRoutes } from "../../../src/router/routes";
import { createUseSettingsStore } from "../../../src/stores/modules/settings";
import { createUseTagsViewStore } from "../../../src/stores/modules/tags-view";

function shellFixture(storage = createMemoryStore()) {
  setActivePinia(createPinia());
  const settings = createUseSettingsStore({
    storage,
    applyDarkMode: () => undefined,
  })();
  const tags = createUseTagsViewStore({
    storage,
    isPersistenceEnabled: () => settings.tagsViewPersist,
  })();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: staticRoutes,
  });
  return { router, settings, tags, storage };
}

function addCurrentTag(fixture: ReturnType<typeof shellFixture>): void {
  const view = routeToTagView(fixture.router.currentRoute.value);
  if (view) fixture.tags.addView(view);
}

describe("navigation shell integration", () => {
  test("keeps fixed home, current tags and keep-alive names in sync", async () => {
    const fixture = shellFixture();
    for (const tag of collectAffixTags(staticRoutes)) {
      fixture.tags.addAffixView(tag);
      fixture.tags.addCachedView(tag);
    }
    await fixture.router.push("/index");
    await fixture.router.isReady();
    addCurrentTag(fixture);
    await fixture.router.push("/user/profile/userinfo");
    addCurrentTag(fixture);

    expect(fixture.tags.visitedViews.map((tag) => tag.path)).toEqual(["/index", "/user/profile/userinfo"]);
    expect(normalizeKeepAliveNames(fixture.tags.cachedViews)).toEqual(["Index", "Profile"]);

    fixture.tags.delAllViews();
    expect(fixture.tags.visitedViews.map((tag) => tag.path)).toEqual(["/index"]);
    expect(fixture.tags.cachedViews).toEqual([]);
  });

  test("restores a minimal persisted tag model across a fresh shell", async () => {
    const storage = createMemoryStore();
    const first = shellFixture(storage);
    first.settings.changeSetting({ key: "tagsViewPersist", value: true });
    await first.router.push("/user/profile/resetPwd?source=tag");
    await first.router.isReady();
    addCurrentTag(first);
    expect(storage.get("tags-view-visited")).toContain('"version":1');

    const refreshed = shellFixture(storage);
    refreshed.settings.changeSetting({ key: "tagsViewPersist", value: true });
    refreshed.tags.loadPersistedViews();
    expect(refreshed.tags.visitedViews).toEqual([
      {
        path: "/user/profile/resetPwd",
        fullPath: "/user/profile/resetPwd?source=tag",
        name: "Profile",
        title: "个人中心",
        query: { source: "tag" },
        meta: { title: "个人中心", icon: "user" },
      },
    ]);
  });

  test("coordinates responsive mode, theme variables and safe iframe links", () => {
    const fixture = shellFixture();
    fixture.settings.changeSetting({ key: "theme", value: "#ff4500" });
    fixture.settings.changeSetting({ key: "isDark", value: true });
    expect(resolveLayoutDevice(1440)).toBe("desktop");
    expect(resolveLayoutDevice(390)).toBe("mobile");
    expect(buildThemeVariables(fixture.settings.theme, fixture.settings.isDark)["--app-primary"]).toBe("#ff4500");
    expect(sanitizeIframeUrl("https://example.invalid/inside")).toBe("https://example.invalid/inside");
    expect(sanitizeIframeUrl("data:text/html,bad")).toBeNull();
  });
});
