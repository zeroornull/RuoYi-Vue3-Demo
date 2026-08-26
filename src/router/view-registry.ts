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
  "system/role/index": loadVuePage(
    "Role",
    "角色管理",
    () => import("../views/system/role/index.vue"),
  ),
  "system/role/authUser": loadVuePage(
    "AuthUser",
    "分配用户",
    () => import("../views/system/role/authUser.vue"),
  ),
  "system/role/selectUser": loadVuePage(
    "SelectUser",
    "选择用户",
    () => import("../views/system/role/selectUser.vue"),
  ),
  "monitor/online/index": loadVuePage(
    "Online",
    "在线用户",
    () => import("../views/monitor/online/index.vue"),
  ),
  "monitor/logininfor/index": loadVuePage(
    "Logininfor",
    "登录日志",
    () => import("../views/monitor/logininfor/index.vue"),
  ),
  "monitor/operlog/index": loadVuePage(
    "Operlog",
    "操作日志",
    () => import("../views/monitor/operlog/index.vue"),
  ),
  "monitor/operlog/detail": loadVuePage(
    "OperlogDetail",
    "操作日志详细",
    () => import("../views/monitor/operlog/detail.vue"),
  ),
  "monitor/job/index": loadVuePage(
    "Job",
    "定时任务",
    () => import("../views/monitor/job/index.vue"),
  ),
  "monitor/job/log": loadVuePage(
    "JobLog",
    "调度日志",
    () => import("../views/monitor/job/log.vue"),
  ),
  "monitor/job/detail": loadVuePage(
    "JobDetail",
    "任务详细",
    () => import("../views/monitor/job/detail.vue"),
  ),
  "monitor/cache/index": loadVuePage(
    "Cache",
    "缓存监控",
    () => import("../views/monitor/cache/index.vue"),
  ),
  "monitor/cache/list": loadVuePage(
    "CacheList",
    "缓存列表",
    () => import("../views/monitor/cache/list.vue"),
  ),
  "monitor/server/index": loadVuePage(
    "Server",
    "服务监控",
    () => import("../views/monitor/server/index.vue"),
  ),
  "monitor/druid/index": loadVuePage(
    "Druid",
    "数据监控",
    () => import("../views/monitor/druid/index.vue"),
  ),
  "tool/swagger/index": loadVuePage(
    "Swagger",
    "系统接口",
    () => import("../views/tool/swagger/index.vue"),
  ),
  "tool/gen/index": loadVuePage(
    "Gen",
    "代码生成",
    () => import("../views/tool/gen/index.vue"),
  ),
};
