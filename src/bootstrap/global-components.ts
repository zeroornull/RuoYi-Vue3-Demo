import type { App } from "vue";
import SvgIcon from "../components/SvgIcon.vue";

export function installGlobalComponents(app: App): void {
  app.component("SvgIcon", SvgIcon);
}
