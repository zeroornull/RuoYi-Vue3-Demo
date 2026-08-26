import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { mount, type ComponentMountingOptions } from "@vue/test-utils";
import type { App, Component } from "vue";
import { pinia } from "../../src/stores";
import { installDirectives } from "../../src/bootstrap/directives";

function installElementPlus(app: App): void {
  app.use(ElementPlus, { locale: zhCn });
  installDirectives(app);
}

export function mountPage(component: Component, options: ComponentMountingOptions = {}) {
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [pinia, { install: installElementPlus }, ...(options.global?.plugins ?? [])],
    },
  });
}
