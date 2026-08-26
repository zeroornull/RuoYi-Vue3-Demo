import type { RouteLocationNormalizedGeneric } from "vue-router";
import { RouterShell } from "./components/router-shell";
import { buildRedirectLocation, parseProfileActiveTab } from "./params";
import {
  assertUniqueRouteNames,
  ROUTE_NAMES,
  type AppRouteRecordRaw,
} from "./types";

const pages = () => import("./components/static-pages");

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
    component: () => pages().then((module) => module.LoginPage),
    hidden: true,
    meta: { title: "登录", public: true },
  },
  {
    path: "/register",
    name: ROUTE_NAMES.register,
    component: () => pages().then((module) => module.RegisterPage),
    hidden: true,
    meta: { title: "注册", public: true },
  },
  {
    path: "/401",
    name: ROUTE_NAMES.unauthorized,
    component: () => pages().then((module) => module.UnauthorizedPage),
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
        component: () => pages().then((module) => module.IndexPage),
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
    component: () => pages().then((module) => module.LockPage),
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
        component: () => pages().then((module) => module.ProfilePage),
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
    component: () => pages().then((module) => module.NotFoundPage),
    hidden: true,
    meta: { title: "页面不存在", noCache: true },
  },
];

assertUniqueRouteNames(staticRoutes);
