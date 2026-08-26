import { defineStore } from "pinia";
import { ref } from "vue";
import { isRecord } from "../../utils/guard";
import {
  browserLocalStore,
  readStoredJson,
  writeStoredJson,
  type StoreStorage,
} from "../persistence";

export type SideTheme = "theme-dark" | "theme-light";
export type NavigationType = 1 | 2 | 3;
export type TagsViewStyle = "card" | "chrome";

export type LayoutSettings = {
  theme: string;
  sideTheme: SideTheme;
  navType: NavigationType;
  tagsView: boolean;
  tagsViewPersist: boolean;
  tagsIcon: boolean;
  tagsViewStyle: TagsViewStyle;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  dynamicTitle: boolean;
  footerVisible: boolean;
  isDark: boolean;
};

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  theme: "#409EFF",
  sideTheme: "theme-dark",
  navType: 1,
  tagsView: true,
  tagsViewPersist: false,
  tagsIcon: false,
  tagsViewStyle: "card",
  fixedHeader: true,
  sidebarLogo: true,
  dynamicTitle: false,
  footerVisible: false,
  isDark: false,
};

export const LAYOUT_SETTINGS_KEY = "layout-setting";
const LAYOUT_SETTINGS_VERSION = 1;

export type SettingChange =
  | { key: "theme"; value: string }
  | { key: "sideTheme"; value: SideTheme }
  | { key: "navType"; value: NavigationType }
  | { key: "tagsView"; value: boolean }
  | { key: "tagsViewPersist"; value: boolean }
  | { key: "tagsIcon"; value: boolean }
  | { key: "tagsViewStyle"; value: TagsViewStyle }
  | { key: "fixedHeader"; value: boolean }
  | { key: "sidebarLogo"; value: boolean }
  | { key: "dynamicTitle"; value: boolean }
  | { key: "footerVisible"; value: boolean }
  | { key: "isDark"; value: boolean };

export type SettingsStoreDeps = {
  storage: StoreStorage;
  applyDarkMode: (enabled: boolean) => void;
};

const browserDeps: SettingsStoreDeps = {
  storage: browserLocalStore,
  applyDarkMode(enabled) {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", enabled);
    }
  },
};

function readBoolean(
  source: Record<string, unknown>,
  key: keyof LayoutSettings,
  fallback: boolean,
): boolean {
  return typeof source[key] === "boolean" ? source[key] : fallback;
}

export function parseLayoutSettings(value: unknown): LayoutSettings {
  const envelope = isRecord(value) ? value : {};
  const source =
    envelope.version === LAYOUT_SETTINGS_VERSION && isRecord(envelope.settings)
      ? envelope.settings
      : envelope;
  const theme = typeof source.theme === "string" ? source.theme : DEFAULT_LAYOUT_SETTINGS.theme;
  const sideTheme =
    source.sideTheme === "theme-light" || source.sideTheme === "theme-dark"
      ? source.sideTheme
      : DEFAULT_LAYOUT_SETTINGS.sideTheme;
  const navType =
    source.navType === 1 || source.navType === 2 || source.navType === 3
      ? source.navType
      : DEFAULT_LAYOUT_SETTINGS.navType;
  const tagsViewStyle =
    source.tagsViewStyle === "chrome" || source.tagsViewStyle === "card"
      ? source.tagsViewStyle
      : DEFAULT_LAYOUT_SETTINGS.tagsViewStyle;
  return {
    theme,
    sideTheme,
    navType,
    tagsView: readBoolean(source, "tagsView", DEFAULT_LAYOUT_SETTINGS.tagsView),
    tagsViewPersist: readBoolean(
      source,
      "tagsViewPersist",
      DEFAULT_LAYOUT_SETTINGS.tagsViewPersist,
    ),
    tagsIcon: readBoolean(source, "tagsIcon", DEFAULT_LAYOUT_SETTINGS.tagsIcon),
    tagsViewStyle,
    fixedHeader: readBoolean(
      source,
      "fixedHeader",
      DEFAULT_LAYOUT_SETTINGS.fixedHeader,
    ),
    sidebarLogo: readBoolean(
      source,
      "sidebarLogo",
      DEFAULT_LAYOUT_SETTINGS.sidebarLogo,
    ),
    dynamicTitle: readBoolean(
      source,
      "dynamicTitle",
      DEFAULT_LAYOUT_SETTINGS.dynamicTitle,
    ),
    footerVisible: readBoolean(
      source,
      "footerVisible",
      DEFAULT_LAYOUT_SETTINGS.footerVisible,
    ),
    isDark: readBoolean(source, "isDark", DEFAULT_LAYOUT_SETTINGS.isDark),
  };
}

export function createUseSettingsStore(deps: SettingsStoreDeps = browserDeps) {
  return defineStore("settings", () => {
    const initial = parseLayoutSettings(readStoredJson(deps.storage, LAYOUT_SETTINGS_KEY));
    const title = ref("");
    const theme = ref(initial.theme);
    const sideTheme = ref<SideTheme>(initial.sideTheme);
    const showSettings = ref(true);
    const navType = ref<NavigationType>(initial.navType);
    const tagsView = ref(initial.tagsView);
    const tagsViewPersist = ref(initial.tagsViewPersist);
    const tagsIcon = ref(initial.tagsIcon);
    const tagsViewStyle = ref<TagsViewStyle>(initial.tagsViewStyle);
    const fixedHeader = ref(initial.fixedHeader);
    const sidebarLogo = ref(initial.sidebarLogo);
    const dynamicTitle = ref(initial.dynamicTitle);
    const footerVisible = ref(initial.footerVisible);
    const footerContent = ref(
      "Copyright © 2018-2026 RuoYi. All Rights Reserved.",
    );
    const isDark = ref(initial.isDark);

    function snapshot(): LayoutSettings {
      return {
        theme: theme.value,
        sideTheme: sideTheme.value,
        navType: navType.value,
        tagsView: tagsView.value,
        tagsViewPersist: tagsViewPersist.value,
        tagsIcon: tagsIcon.value,
        tagsViewStyle: tagsViewStyle.value,
        fixedHeader: fixedHeader.value,
        sidebarLogo: sidebarLogo.value,
        dynamicTitle: dynamicTitle.value,
        footerVisible: footerVisible.value,
        isDark: isDark.value,
      };
    }

    function persist(): void {
      writeStoredJson(deps.storage, LAYOUT_SETTINGS_KEY, {
        version: LAYOUT_SETTINGS_VERSION,
        settings: snapshot(),
      });
    }

    function changeSetting(change: SettingChange): void {
      switch (change.key) {
        case "theme": theme.value = change.value; break;
        case "sideTheme": sideTheme.value = change.value; break;
        case "navType": navType.value = change.value; break;
        case "tagsView": tagsView.value = change.value; break;
        case "tagsViewPersist": tagsViewPersist.value = change.value; break;
        case "tagsIcon": tagsIcon.value = change.value; break;
        case "tagsViewStyle": tagsViewStyle.value = change.value; break;
        case "fixedHeader": fixedHeader.value = change.value; break;
        case "sidebarLogo": sidebarLogo.value = change.value; break;
        case "dynamicTitle": dynamicTitle.value = change.value; break;
        case "footerVisible": footerVisible.value = change.value; break;
        case "isDark":
          isDark.value = change.value;
          deps.applyDarkMode(change.value);
          break;
      }
      persist();
    }

    function setTitle(value: string): void {
      title.value = value;
    }

    function toggleTheme(): void {
      changeSetting({ key: "isDark", value: !isDark.value });
    }

    function restoreDefaults(): void {
      theme.value = DEFAULT_LAYOUT_SETTINGS.theme;
      sideTheme.value = DEFAULT_LAYOUT_SETTINGS.sideTheme;
      navType.value = DEFAULT_LAYOUT_SETTINGS.navType;
      tagsView.value = DEFAULT_LAYOUT_SETTINGS.tagsView;
      tagsViewPersist.value = DEFAULT_LAYOUT_SETTINGS.tagsViewPersist;
      tagsIcon.value = DEFAULT_LAYOUT_SETTINGS.tagsIcon;
      tagsViewStyle.value = DEFAULT_LAYOUT_SETTINGS.tagsViewStyle;
      fixedHeader.value = DEFAULT_LAYOUT_SETTINGS.fixedHeader;
      sidebarLogo.value = DEFAULT_LAYOUT_SETTINGS.sidebarLogo;
      dynamicTitle.value = DEFAULT_LAYOUT_SETTINGS.dynamicTitle;
      footerVisible.value = DEFAULT_LAYOUT_SETTINGS.footerVisible;
      isDark.value = DEFAULT_LAYOUT_SETTINGS.isDark;
      deps.applyDarkMode(isDark.value);
      persist();
    }

    deps.applyDarkMode(isDark.value);

    return {
      title,
      theme,
      sideTheme,
      showSettings,
      navType,
      tagsView,
      tagsViewPersist,
      tagsIcon,
      tagsViewStyle,
      fixedHeader,
      sidebarLogo,
      dynamicTitle,
      footerVisible,
      footerContent,
      isDark,
      changeSetting,
      setTitle,
      toggleTheme,
      restoreDefaults,
    };
  });
}

export const useSettingsStore = createUseSettingsStore();
export default useSettingsStore;
