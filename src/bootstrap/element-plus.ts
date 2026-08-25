import type { App, Plugin } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import { readCookie } from "./cookie";

type ElementSize = "large" | "default" | "small";

function readElementSize(): ElementSize {
  const size = readCookie("size");
  if (size === "large" || size === "default" || size === "small") {
    return size;
  }
  return "default";
}

export function installElementPlus(app: App): void {
  app.use(ElementPlus as Plugin, {
    locale: zhCn,
    size: readElementSize(),
  });
}
