import type { App } from "vue";
import { createPinia } from "pinia";
import { setSessionExpiredHandler } from "../http";
import { useUserStore } from "./modules/user";

export const pinia = createPinia();

export function installStores(app: App): void {
  app.use(pinia);
  setSessionExpiredHandler(() => {
    useUserStore(pinia).resetSession();
    if (typeof window !== "undefined") {
      window.location.href = "/index";
    }
  });
}

export { useAppStore } from "./modules/app";
export { useDictStore } from "./modules/dict";
export { useLockStore } from "./modules/lock";
export { usePermissionStore } from "./modules/permission";
export { useSettingsStore } from "./modules/settings";
export { useTagsViewStore } from "./modules/tags-view";
export { useUserStore } from "./modules/user";
export { STORE_MIGRATION_MANIFEST } from "./migration-manifest";
