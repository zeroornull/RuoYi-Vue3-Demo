import type { RouteComponent } from "vue-router";
import { loadVuePage } from "./components/static-pages";

type LazyRouteComponent = () => Promise<RouteComponent>;

export const migratedViewLoaders: Record<string, LazyRouteComponent> = {
  "system/config/index": loadVuePage(
    "Config",
    "参数设置",
    () => import("../views/system/config/index.vue"),
  ),
  "system/post/index": loadVuePage(
    "Post",
    "岗位管理",
    () => import("../views/system/post/index.vue"),
  ),
  "system/notice/index": loadVuePage(
    "Notice",
    "通知公告",
    () => import("../views/system/notice/index.vue"),
  ),
  "system/notice/ReadUsers": loadVuePage(
    "NoticeReadUsers",
    "已读用户",
    () => import("../views/system/notice/ReadUsers.vue"),
  ),
  "system/dict/index": loadVuePage(
    "Dict",
    "字典管理",
    () => import("../views/system/dict/index.vue"),
  ),
  "system/dict/data": loadVuePage(
    "Data",
    "字典数据",
    () => import("../views/system/dict/data.vue"),
  ),
  "system/dict/detail": loadVuePage(
    "DictDetail",
    "字典详情",
    () => import("../views/system/dict/detail.vue"),
  ),
  "system/dept/index": loadVuePage(
    "Dept",
    "部门管理",
    () => import("../views/system/dept/index.vue"),
  ),
  "system/menu/index": loadVuePage(
    "Menu",
    "菜单管理",
    () => import("../views/system/menu/index.vue"),
  ),
  "system/user/index": loadVuePage(
    "User",
    "用户管理",
    () => import("../views/system/user/index.vue"),
  ),
  "system/user/view": loadVuePage(
    "UserView",
    "用户详情",
    () => import("../views/system/user/view.vue"),
  ),
  "system/user/authRole": loadVuePage(
    "AuthRole",
    "分配角色",
    () => import("../views/system/user/authRole.vue"),
  ),
};
