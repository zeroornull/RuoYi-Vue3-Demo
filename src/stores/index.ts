import type { App } from "vue";
import { createPinia } from "pinia";

export const pinia = createPinia();

export function installStores(app: App): void {
  app.use(pinia);
}

export { useAppStore } from "./modules/app";
export { useDictStore } from "./modules/dict";
export { useLockStore } from "./modules/lock";
export { usePermissionStore } from "./modules/permission";
export { useSettingsStore } from "./modules/settings";
export { useTagsViewStore } from "./modules/tags-view";
export { useUserStore } from "./modules/user";
export { STORE_MIGRATION_MANIFEST } from "./migration-manifest";
