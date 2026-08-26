import type { RouteComponent } from "vue-router";
import { RouterShell } from "./components/router-shell";

export type LazyRouteComponent = () => Promise<RouteComponent>;

export type ComponentResolution = {
  component?: RouteComponent | LazyRouteComponent;
  issue?: {
    code: "missing-component" | "unknown-component";
    detail: string;
  };
};

export const SAFE_BACKEND_COMPONENTS = new Set<string>([
  "error/401",
  "error/404",
  "index",
  "lock",
  "login",
  "monitor/cache/index",
  "monitor/cache/list",
  "monitor/druid/index",
  "monitor/job/detail",
  "monitor/job/index",
  "monitor/job/log",
  "monitor/logininfor/index",
  "monitor/online/index",
  "monitor/operlog/detail",
  "monitor/operlog/index",
  "monitor/server/index",
  "redirect/index",
  "register",
  "system/config/index",
  "system/dept/index",
  "system/dict/data",
  "system/dict/detail",
  "system/dict/index",
  "system/menu/index",
  "system/notice/ReadUsers",
  "system/notice/index",
  "system/post/index",
  "system/role/authUser",
  "system/role/index",
  "system/role/selectUser",
  "system/user/authRole",
  "system/user/index",
  "system/user/profile/index",
  "system/user/profile/resetPwd",
  "system/user/profile/userAvatar",
  "system/user/profile/userInfo",
  "system/user/view",
  "tool/build/index",
  "tool/gen/createTable",
  "tool/gen/editTable",
  "tool/gen/importTable",
  "tool/gen/index",
  "tool/swagger/index",
]);

const loadDynamicPage: LazyRouteComponent = () =>
  import("./components/static-pages").then((module) => module.DynamicRoutePage);
const loadInnerLink: LazyRouteComponent = () =>
  import("./components/static-pages").then((module) => module.InnerLinkPage);
const loadUnknownComponent: LazyRouteComponent = () =>
  import("./components/static-pages").then(
    (module) => module.UnknownComponentPage,
  );
const loadParentView: LazyRouteComponent = () =>
  import("../components/ParentView/index.vue");

export function resolveBackendComponent(options: {
  component: string | null | undefined;
  hasChildren: boolean;
  link: string | null | undefined;
  hasRedirect: boolean;
}): ComponentResolution {
  const component = options.component;
  if (component === "Layout") {
    return { component: RouterShell };
  }
  if (component === "ParentView") {
    return { component: loadParentView };
  }
  if (component === "InnerLink" || options.link) {
    return { component: loadInnerLink };
  }
  if (component && SAFE_BACKEND_COMPONENTS.has(component)) {
    return { component: loadDynamicPage };
  }
  if (!component && options.hasChildren) {
    return { component: RouterShell };
  }
  if (!component && options.hasRedirect) {
    return {};
  }
  if (!component) {
    return {
      component: loadUnknownComponent,
      issue: {
        code: "missing-component",
        detail: "Leaf route has no component",
      },
    };
  }
  return {
    component: loadUnknownComponent,
    issue: {
      code: "unknown-component",
      detail: component,
    },
  };
}
