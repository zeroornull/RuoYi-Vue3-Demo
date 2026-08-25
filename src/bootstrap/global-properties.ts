import type { App } from "vue";
import { appEnv } from "@/config/env";

export function installGlobalProperties(app: App): void {
  app.config.globalProperties.$appTitle = appEnv.title;
}
