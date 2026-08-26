import type { App } from "vue";
import { hasPermiDirective } from "./has-permi";

export function installDirectives(app: App): void {
  app.directive("hasPermi", hasPermiDirective);
}
