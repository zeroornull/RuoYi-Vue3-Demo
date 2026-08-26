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
};
