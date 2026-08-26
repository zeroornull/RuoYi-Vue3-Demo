import Cookies from "js-cookie";
import { defineStore } from "pinia";

export type AppDevice = "desktop" | "mobile";
export type AppSize = "default" | "small" | "large";

export type SidebarState = {
  opened: boolean;
  withoutAnimation: boolean;
  hide: boolean;
};

export type AppCookieStore = {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
};

export const APP_COOKIE_KEYS = {
  sidebar: "sidebarStatus",
  size: "size",
} as const;

const browserCookies: AppCookieStore = {
  get: (key) => Cookies.get(key),
  set: (key, value) => {
    Cookies.set(key, value);
  },
};

export function parseSidebarOpened(value: string | undefined): boolean {
  if (value === "0") return false;
  if (value === "1") return true;
  return true;
}

export function parseAppSize(value: string | undefined): AppSize {
  return value === "small" || value === "large" || value === "default"
    ? value
    : "default";
}

export function createUseAppStore(cookies: AppCookieStore = browserCookies) {
  return defineStore("app", {
    state: (): {
      sidebar: SidebarState;
      device: AppDevice;
      size: AppSize;
    } => ({
      sidebar: {
        opened: parseSidebarOpened(cookies.get(APP_COOKIE_KEYS.sidebar)),
        withoutAnimation: false,
        hide: false,
      },
      device: "desktop",
      size: parseAppSize(cookies.get(APP_COOKIE_KEYS.size)),
    }),
    actions: {
      toggleSideBar(withoutAnimation = false): boolean {
        if (this.sidebar.hide) return false;
        this.sidebar.opened = !this.sidebar.opened;
        this.sidebar.withoutAnimation = withoutAnimation;
        cookies.set(APP_COOKIE_KEYS.sidebar, this.sidebar.opened ? "1" : "0");
        return true;
      },
      closeSideBar(options: { withoutAnimation: boolean }): void {
        this.sidebar.opened = false;
        this.sidebar.withoutAnimation = options.withoutAnimation;
        cookies.set(APP_COOKIE_KEYS.sidebar, "0");
      },
      toggleDevice(device: AppDevice): void {
        this.device = device;
      },
      setSize(size: AppSize): void {
        this.size = size;
        cookies.set(APP_COOKIE_KEYS.size, size);
      },
      toggleSideBarHide(status: boolean): void {
        this.sidebar.hide = status;
      },
    },
  });
}

export const useAppStore = createUseAppStore();
export default useAppStore;
