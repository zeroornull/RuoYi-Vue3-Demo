import { dispatchMonitorMock, resetMockMonitorState } from "./monitor.ts";
import { DRUID_LOGIN_HTML } from "./runtime.ts";
import { dispatchSystemMock, resetMockSystemState } from "./system.ts";
import {
  dispatchPublicToolMock,
  dispatchToolMock,
  resetMockToolState,
} from "./tool.ts";

export type MockJson = Record<string, unknown>;

export type MockRequest = {
  method: string;
  path: string;
  body: unknown;
  query?: Record<string, string>;
  token?: string;
};

export type MockResponse = {
  status: number;
  body: MockJson;
  contentType?: string;
  raw?: string;
};

export const MOCK_TOKEN = "mock-admin-token";
export const MOCK_USERNAME = "admin";
export const MOCK_PASSWORD = "admin123";
const PIXEL_GIF =
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse =>
  ok({ code, msg });

type MockUser = {
  userId: string;
  deptId: string;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  sex: "0" | "1" | "2";
  avatar: string | null;
  status: "0";
  createTime: string;
  dept: {
    deptId: string;
    parentId: string;
    deptName: string;
    orderNum: number;
    status: "0";
  };
};

const defaultUser = (): MockUser => ({
  userId: "1",
  deptId: "103",
  userName: MOCK_USERNAME,
  nickName: "管理员",
  email: "admin@ruoyi.local",
  phonenumber: "15888888888",
  sex: "0",
  avatar: null,
  status: "0",
  createTime: "2026-01-01 00:00:00",
  dept: {
    deptId: "103",
    parentId: "101",
    deptName: "研发部门",
    orderNum: 1,
    status: "0",
  },
});

let user = defaultUser();

export function resetMockAuthState(): void {
  user = defaultUser();
  resetMockSystemState();
  resetMockMonitorState();
  resetMockToolState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined;
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

function login(body: unknown): MockResponse {
  if (!isRecord(body)) {
    return fail("请求参数错误");
  }
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  const code = String(body.code ?? "");
  if (!code) {
    return fail("验证码不能为空");
  }
  if (username !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
    return fail("用户不存在/密码错误");
  }
  return ok({ code: 200, msg: "操作成功", token: MOCK_TOKEN });
}

function captcha(): MockResponse {
  return ok({
    code: 200,
    msg: "操作成功",
    uuid: "mock-captcha-uuid",
    img: PIXEL_GIF,
    captchaEnabled: true,
  });
}

function info(): MockResponse {
  return ok({
    code: 200,
    msg: "操作成功",
    user,
    roles: ["admin"],
    permissions: ["*:*:*"],
    pwdChrtype: "0",
    isDefaultModifyPwd: false,
    isPasswordExpired: false,
  });
}

function routers(): MockResponse {
  return ok({
    code: 200,
    msg: "操作成功",
    data: [
      {
        name: "System",
        path: "/system",
        hidden: false,
        component: "Layout",
        alwaysShow: true,
        meta: { title: "系统管理", icon: "system", noCache: false, link: null },
        children: [
          {
            name: "User",
            path: "user",
            component: "system/user/index",
            meta: { title: "用户管理", icon: "user", noCache: false },
          },
          {
            name: "Role",
            path: "role",
            component: "system/role/index",
            meta: { title: "角色管理", icon: "peoples", noCache: false },
          },
          {
            name: "Menu",
            path: "menu",
            component: "system/menu/index",
            meta: { title: "菜单管理", icon: "tree-table", noCache: false },
          },
          {
            name: "Dept",
            path: "dept",
            component: "system/dept/index",
            meta: { title: "部门管理", icon: "tree", noCache: false },
          },
          {
            name: "Post",
            path: "post",
            component: "system/post/index",
            meta: { title: "岗位管理", icon: "post", noCache: false },
          },
          {
            name: "Dict",
            path: "dict",
            component: "system/dict/index",
            meta: { title: "字典管理", icon: "dict", noCache: false },
          },
          {
            name: "Config",
            path: "config",
            component: "system/config/index",
            meta: { title: "参数设置", icon: "edit", noCache: false },
          },
          {
            name: "Notice",
            path: "notice",
            component: "system/notice/index",
            meta: { title: "通知公告", icon: "message", noCache: false },
          },
        ],
      },
      {
        name: "Monitor",
        path: "/monitor",
        hidden: false,
        component: "Layout",
        alwaysShow: true,
        meta: { title: "系统监控", icon: "monitor", noCache: false, link: null },
        children: [
          {
            name: "Online",
            path: "online",
            component: "monitor/online/index",
            meta: { title: "在线用户", icon: "user", noCache: false },
          },
          {
            name: "Logininfor",
            path: "logininfor",
            component: "monitor/logininfor/index",
            meta: { title: "登录日志", icon: "logininfor", noCache: false },
          },
          {
            name: "Operlog",
            path: "operlog",
            component: "monitor/operlog/index",
            meta: { title: "操作日志", icon: "form", noCache: false },
          },
          {
            name: "Job",
            path: "job",
            component: "monitor/job/index",
            meta: { title: "定时任务", icon: "job", noCache: false },
          },
          {
            name: "Cache",
            path: "cache",
            component: "monitor/cache/index",
            meta: { title: "缓存监控", icon: "redis", noCache: false },
          },
          {
            name: "CacheList",
            path: "cacheList",
            component: "monitor/cache/list",
            meta: { title: "缓存列表", icon: "redis-list", noCache: false },
          },
          {
            name: "Server",
            path: "server",
            component: "monitor/server/index",
            meta: { title: "服务监控", icon: "server", noCache: false },
          },
          {
            name: "Druid",
            path: "druid",
            component: "monitor/druid/index",
            meta: { title: "数据监控", icon: "druid", noCache: false },
          },
        ],
      },
      {
        name: "Tool",
        path: "/tool",
        hidden: false,
        component: "Layout",
        alwaysShow: true,
        meta: { title: "系统工具", icon: "tool", noCache: false, link: null },
        children: [
          {
            name: "Build",
            path: "build",
            component: "tool/build/index",
            meta: { title: "表单构建", icon: "build", noCache: false },
          },
          {
            name: "Gen",
            path: "gen",
            component: "tool/gen/index",
            meta: { title: "代码生成", icon: "code", noCache: false },
          },
          {
            name: "Swagger",
            path: "swagger",
            component: "tool/swagger/index",
            meta: { title: "系统接口", icon: "swagger", noCache: false },
          },
        ],
      },
    ],
  });
}

function profile(): MockResponse {
  return ok({
    code: 200,
    msg: "操作成功",
    data: user,
    roleGroup: "超级管理员",
    postGroup: "董事长",
  });
}

function updateProfile(body: unknown): MockResponse {
  if (!isRecord(body)) {
    return fail("请求参数错误");
  }
  if (typeof body.nickName === "string") user.nickName = body.nickName;
  if (typeof body.email === "string") user.email = body.email;
  if (typeof body.phonenumber === "string") user.phonenumber = body.phonenumber;
  if (body.sex === "0" || body.sex === "1" || body.sex === "2") {
    user.sex = body.sex;
  }
  return ok({ code: 200, msg: "操作成功" });
}

function updatePwd(body: unknown): MockResponse {
  if (!isRecord(body)) {
    return fail("请求参数错误");
  }
  if (body.oldPassword !== MOCK_PASSWORD) {
    return fail("修改密码失败，旧密码错误");
  }
  return ok({ code: 200, msg: "操作成功" });
}

export function dispatchMockRequest(request: MockRequest): MockResponse {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  const token = request.token;

  if (method === "GET" && path === "/captchaImage") {
    return captcha();
  }
  if (method === "POST" && path === "/login") {
    return login(request.body);
  }
  if (method === "POST" && path === "/register") {
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "GET" && path === "/druid/login.html") {
    return {
      status: 200,
      body: { code: 200, msg: "ok" },
      contentType: "text/html;charset=utf-8",
      raw: DRUID_LOGIN_HTML,
    };
  }
  const publicTool = dispatchPublicToolMock(request);
  if (publicTool) {
    return publicTool;
  }

  const unauthorized = token !== MOCK_TOKEN
    ? ok({ code: 401, msg: "认证失败，无法访问系统资源" })
    : null;

  if (method === "GET" && path === "/getInfo") {
    return unauthorized ?? info();
  }
  if (method === "GET" && path === "/getRouters") {
    return unauthorized ?? routers();
  }
  if (method === "POST" && path === "/logout") {
    return unauthorized ?? ok({ code: 200, msg: "操作成功" });
  }
  if (method === "POST" && path === "/unlockscreen") {
    return unauthorized ?? ok({ code: 200, msg: "操作成功" });
  }
  if (method === "GET" && path === "/system/user/profile") {
    return unauthorized ?? profile();
  }
  if (method === "PUT" && path === "/system/user/profile") {
    return unauthorized ?? updateProfile(request.body);
  }
  if (method === "PUT" && path === "/system/user/profile/updatePwd") {
    return unauthorized ?? updatePwd(request.body);
  }
  if (method === "POST" && path === "/system/user/profile/avatar") {
    if (unauthorized) return unauthorized;
    user.avatar = "/profile.jpg";
    return ok({ code: 200, msg: "操作成功", imgUrl: "/profile.jpg" });
  }

  if (
    unauthorized &&
    (path.startsWith("/system/") ||
      path.startsWith("/monitor/") ||
      path.startsWith("/tool/"))
  ) {
    return unauthorized;
  }

  const system = dispatchSystemMock(request);
  if (system) {
    return system;
  }
  const monitor = dispatchMonitorMock(request);
  if (monitor) {
    return monitor;
  }
  const tool = dispatchToolMock(request);
  if (tool) {
    return tool;
  }

  return fail(`本地 Mock 未实现 ${method} ${path}`);
}

export function tokenFromAuthorization(header: string | undefined): string | undefined {
  return bearerToken(header);
}
