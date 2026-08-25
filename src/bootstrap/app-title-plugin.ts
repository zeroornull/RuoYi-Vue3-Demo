import type { Plugin } from "vue";
import { appEnv } from "@/config/env";

export const appTitleKey = "appTitle";

export const appTitlePlugin: Plugin = {
  install(app) {
    app.provide(appTitleKey, appEnv.title);
  },
};
