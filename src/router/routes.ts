import type { RouteLocationNormalizedGeneric } from "vue-router";
import { RouterShell } from "./components/router-shell";
import { IndexPage, loadVuePage } from "./components/static-pages";
import { buildRedirectLocation, parseProfileActiveTab } from "./params";
import {
  assertUniqueRouteNames,
  ROUTE_NAMES,
  type AppRouteRecordRaw,
} from "./types";

export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: "/redirect/:path(.*)",
    name: ROUTE_NAMES.redirect,
    hidden: true,
    redirect: (to) => buildRedirectLocation(to.params.path, to.query),
  },
  {
    path: "/login",
    name: ROUTE_NAMES.login,
    component: loadVuePage("Login", "登录", () => import("../views/login/index.vue")),
    hidden: true,
    meta: { title: "登录", public: true },
  },
  {
    path: "/register",
    name: ROUTE_NAMES.register,
    component: loadVuePage("Register", "注册", () => import("../views/register/index.vue")),
    hidden: true,
    meta: { title: "注册", public: true },
  },
  {
    path: "/401",
    name: ROUTE_NAMES.unauthorized,
    component: loadVuePage("Unauthorized", "无权限", () => import("../views/error/401.vue")),
    hidden: true,
    meta: { title: "无权限", public: true },
  },
  {
    path: "/",
    name: ROUTE_NAMES.root,
    component: RouterShell,
    redirect: "/index",
    children: [
      {
        path: "index",
        name: ROUTE_NAMES.index,
        component: IndexPage,
        meta: {
          title: "首页",
          icon: "dashboard",
          affix: true,
          noCache: false,
          breadcrumb: true,
        },
      },
    ],
  },
  {
    path: "/lock",
    name: ROUTE_NAMES.lock,
    component: loadVuePage("Lock", "锁定屏幕", () => import("../views/lock/index.vue")),
    hidden: true,
    meta: { title: "锁定屏幕", noCache: true },
  },
  {
    path: "/user",
    name: ROUTE_NAMES.user,
    component: RouterShell,
    hidden: true,
    children: [
      {
        path: "profile/:activeTab?",
        name: ROUTE_NAMES.profile,
        component: loadVuePage("Profile", "个人中心", () => import("../views/profile/index.vue")),
        props: (route: RouteLocationNormalizedGeneric) => ({
          activeTab: parseProfileActiveTab(route.params.activeTab),
        }),
        meta: {
          title: "个人中心",
          icon: "user",
          activeMenu: "/user/profile",
          breadcrumb: true,
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: ROUTE_NAMES.notFound,
    component: loadVuePage("NotFound", "页面不存在", () => import("../views/error/404.vue")),
    hidden: true,
    meta: { title: "页面不存在", noCache: true },
  },
];

assertUniqueRouteNames(staticRoutes);
