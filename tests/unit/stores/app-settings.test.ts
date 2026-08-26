import { beforeEach, describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryStore } from "../../../src/http/cache";
import {
  createUseAppStore,
  type AppCookieStore,
} from "../../../src/stores/modules/app";
import {
  createUseSettingsStore,
  DEFAULT_LAYOUT_SETTINGS,
  LAYOUT_SETTINGS_KEY,
  parseLayoutSettings,
} from "../../../src/stores/modules/settings";

beforeEach(() => {
  setActivePinia(createPinia());
});

function memoryCookies(initial: Record<string, string> = {}): {
  adapter: AppCookieStore;
  values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    values,
    adapter: {
      get: (key) => values.get(key),
      set: (key, value) => {
        values.set(key, value);
      },
    },
  };
}

describe("app store", () => {
  test("restores and mutates sidebar, device and size state", () => {
    const cookies = memoryCookies({ sidebarStatus: "0", size: "small" });
    const store = createUseAppStore(cookies.adapter)();
    expect(store.sidebar.opened).toBe(false);
    expect(store.size).toBe("small");

    expect(store.toggleSideBar(true)).toBe(true);
    expect(store.sidebar).toEqual({
      opened: true,
      withoutAnimation: true,
      hide: false,
    });
    expect(cookies.values.get("sidebarStatus")).toBe("1");

    store.toggleSideBarHide(true);
    expect(store.toggleSideBar()).toBe(false);
    expect(store.sidebar.opened).toBe(true);

    store.toggleDevice("mobile");
    store.setSize("large");
    store.closeSideBar({ withoutAnimation: false });
    expect(store.device).toBe("mobile");
    expect(store.size).toBe("large");
    expect(store.sidebar.opened).toBe(false);
    expect(cookies.values.get("size")).toBe("large");
  });
});

describe("settings store", () => {
  test("recovers defaults from damaged storage", () => {
    const storage = createMemoryStore();
    storage.set(LAYOUT_SETTINGS_KEY, "{broken");
    const darkCalls: boolean[] = [];
    const store = createUseSettingsStore({
      storage,
      applyDarkMode: (enabled) => darkCalls.push(enabled),
    })();
    expect(store.theme).toBe(DEFAULT_LAYOUT_SETTINGS.theme);
    expect(store.navType).toBe(1);
    expect(store.tagsViewPersist).toBe(false);
    expect(darkCalls).toEqual([false]);
  });

  test("changes title/theme and writes a versioned settings envelope", () => {
    const storage = createMemoryStore();
    const darkCalls: boolean[] = [];
    const store = createUseSettingsStore({
      storage,
      applyDarkMode: (enabled) => darkCalls.push(enabled),
    })();
    store.setTitle("用户管理");
    store.changeSetting({ key: "theme", value: "#123456" });
    store.changeSetting({ key: "tagsViewPersist", value: true });
    store.toggleTheme();

    expect(store.title).toBe("用户管理");
    expect(store.theme).toBe("#123456");
    expect(store.tagsViewPersist).toBe(true);
    expect(store.isDark).toBe(true);
    expect(darkCalls).toEqual([false, true]);

    const raw = storage.get(LAYOUT_SETTINGS_KEY);
    expect(raw).not.toBeNull();
    const parsed = parseLayoutSettings(JSON.parse(raw ?? "null") as unknown);
    expect(parsed.theme).toBe("#123456");
    expect(parsed.tagsViewPersist).toBe(true);
    expect(parsed.isDark).toBe(true);
  });
});
