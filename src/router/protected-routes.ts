import { RouterShell } from "./components/router-shell";
import { loadVuePage } from "./components/static-pages";
import type { AppRouteRecordRaw } from "./types";

const loadDynamicPage = () =>
  import("./components/static-pages").then((module) => module.DynamicRoutePage);
const loadDictDataPage = loadVuePage(
  "Data",
  "字典数据",
  () => import("../views/system/dict/data.vue"),
);

export const protectedRoutes: AppRouteRecordRaw[] = [
  {
    path: "/system/user-auth",
    name: "UserAuthRoot",
    component: RouterShell,
    hidden: true,
    permissions: ["system:user:edit"],
    children: [
      {
        path: "role/:userId(\\d+)",
        name: "AuthRole",
        component: loadDynamicPage,
        meta: { title: "分配角色", activeMenu: "/system/user" },
      },
    ],
  },
  {
    path: "/system/role-auth",
    name: "RoleAuthRoot",
    component: RouterShell,
    hidden: true,
    permissions: ["system:role:edit"],
    children: [
      {
        path: "user/:roleId(\\d+)",
        name: "AuthUser",
        component: loadDynamicPage,
        meta: { title: "分配用户", activeMenu: "/system/role" },
      },
    ],
  },
  {
    path: "/system/dict-data",
    name: "DictDataRoot",
    component: RouterShell,
    hidden: true,
    permissions: ["system:dict:list"],
    children: [
      {
        path: "index/:dictId(\\d+)",
        name: "Data",
        component: loadDictDataPage,
        meta: { title: "字典数据", activeMenu: "/system/dict" },
      },
    ],
  },
  {
    path: "/monitor/job-log",
    name: "JobLogRoot",
    component: RouterShell,
    hidden: true,
    permissions: ["monitor:job:list"],
    children: [
      {
        path: "index/:jobId(\\d+)",
        name: "JobLog",
        component: loadDynamicPage,
        meta: { title: "调度日志", activeMenu: "/monitor/job" },
      },
    ],
  },
  {
    path: "/tool/gen-edit",
    name: "GenEditRoot",
    component: RouterShell,
    hidden: true,
    permissions: ["tool:gen:edit"],
    children: [
      {
        path: "index/:tableId(\\d+)",
        name: "GenEdit",
        component: loadDynamicPage,
        meta: { title: "修改生成配置", activeMenu: "/tool/gen" },
      },
    ],
  },
];
