import type { MockJson, MockRequest, MockResponse } from "./auth.ts";
import { dispatchJobMock, resetMockJobState } from "./job.ts";
import { dispatchRuntimeMock, resetMockRuntimeState } from "./runtime.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });

type OnlineRow = {
  tokenId: string;
  deptName: string;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: number;
};

type LoginInfoRow = {
  infoId: string;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  status: "0" | "1";
  msg: string;
  loginTime: string;
};

type OperLogRow = {
  operId: string;
  title: string;
  businessType: number;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string;
  jsonResult: string;
  status: "0" | "1";
  errorMsg: string;
  operTime: string;
  costTime: number;
};

const ADMIN_LOGIN_TIME = Date.parse("2026-08-26T08:00:00+08:00");

let online: OnlineRow[] = [];
let loginLogs: LoginInfoRow[] = [];
let operLogs: OperLogRow[] = [];
const lockedUsers = new Set<string>();

function seedOnline(): OnlineRow[] {
  return [
    {
      tokenId: "token-admin",
      deptName: "研发部门",
      userName: "admin",
      ipaddr: "127.0.0.1",
      loginLocation: "内网IP",
      browser: "Chrome",
      os: "Linux",
      loginTime: ADMIN_LOGIN_TIME,
    },
    {
      tokenId: "token-ry",
      deptName: "测试部门",
      userName: "ry",
      ipaddr: "10.0.0.8",
      loginLocation: "上海市",
      browser: "Firefox",
      os: "Windows 10",
      loginTime: ADMIN_LOGIN_TIME - 3600_000,
    },
    {
      tokenId: "token-user3",
      deptName: "研发部门",
      userName: "user3",
      ipaddr: "192.168.1.20",
      loginLocation: "深圳市",
      browser: "Edge",
      os: "Windows 11",
      loginTime: ADMIN_LOGIN_TIME - 7200_000,
    },
  ];
}

function seedLoginLogs(): LoginInfoRow[] {
  return [
    login("1", "admin", "127.0.0.1", "0", "登录成功", "2026-08-26 08:00:00"),
    login("2", "ry", "10.0.0.8", "0", "登录成功", "2026-08-25 09:00:00"),
    login("3", "ry", "10.0.0.8", "1", "密码错误", "2026-08-24 18:00:00"),
    login("4", "user3", "192.168.1.20", "0", "登录成功", "2026-08-23 10:00:00"),
    login("5", "user4", "192.168.1.21", "1", "用户不存在", "2026-08-22 11:00:00"),
    login("6", "admin", "10.1.1.4", "0", "登录成功", "2026-07-01 08:00:00"),
    login("7", "user5", "10.0.0.5", "0", "登录成功", "2026-08-20 08:30:00"),
    login("8", "user6", "10.0.0.6", "1", "验证码错误", "2026-08-19 08:30:00"),
    login("9", "user7", "10.0.0.7", "0", "登录成功", "2026-08-18 08:30:00"),
    login("10", "user8", "10.0.0.8", "0", "登录成功", "2026-08-17 08:30:00"),
    login("11", "user9", "10.0.0.9", "1", "密码错误", "2026-08-16 08:30:00"),
    login("12", "user10", "10.0.0.10", "0", "登录成功", "2026-08-15 08:30:00"),
  ];
}

function login(
  infoId: string,
  userName: string,
  ipaddr: string,
  status: "0" | "1",
  msg: string,
  loginTime: string,
): LoginInfoRow {
  return {
    infoId,
    userName,
    ipaddr,
    loginLocation: ipaddr.startsWith("127") ? "内网IP" : "上海市",
    browser: "Chrome",
    os: "Linux",
    status,
    msg,
    loginTime,
  };
}

function seedOperLogs(): OperLogRow[] {
  return [
    oper("1", "用户管理", 1, "admin", "0", "2026-08-26 09:00:00", 12, {
      operUrl: "/system/user",
      operParam: '{"userName":"user13"}',
      jsonResult: '{"code":200,"msg":"操作成功"}',
    }),
    oper("2", "角色管理", 2, "admin", "0", "2026-08-25 10:00:00", 18, {
      operUrl: "/system/role",
      operParam: '{"roleId":"2"}',
      jsonResult: '{"code":200,"msg":"操作成功"}',
    }),
    oper("3", "参数设置", 3, "ry", "1", "2026-08-24 11:00:00", 40, {
      operUrl: "/system/config/1",
      operParam: '{"configId":"1"}',
      jsonResult: '{"code":500,"msg":"操作失败"}',
      errorMsg: "不允许删除内置参数",
    }),
    oper("4", "登录日志", 9, "admin", "0", "2026-08-23 12:00:00", 8, {
      operUrl: "/monitor/logininfor/clean",
      requestMethod: "DELETE",
    }),
    oper("5", "在线用户", 7, "admin", "0", "2026-08-22 13:00:00", 6, {
      operUrl: "/monitor/online/token-ry",
      requestMethod: "DELETE",
    }),
    oper("6", "通知公告", 5, "ry", "0", "2026-08-21 14:00:00", 22, {
      operUrl: "/system/notice/export",
    }),
    oper("7", "菜单管理", 1, "admin", "0", "2026-07-02 09:00:00", 15),
    oper("8", "部门管理", 2, "user3", "0", "2026-08-20 15:00:00", 11),
  ];
}

function oper(
  operId: string,
  title: string,
  businessType: number,
  operName: string,
  status: "0" | "1",
  operTime: string,
  costTime: number,
  extra: Partial<OperLogRow> = {},
): OperLogRow {
  return {
    operId,
    title,
    businessType,
    method: "com.ruoyi.web.controller.system.Handler.list()",
    requestMethod: extra.requestMethod ?? "POST",
    operatorType: 1,
    operName,
    deptName: operName === "admin" ? "研发部门" : "测试部门",
    operUrl: extra.operUrl ?? "/system/demo",
    operIp: operName === "admin" ? "127.0.0.1" : "10.0.0.8",
    operLocation: "内网IP",
    operParam: extra.operParam ?? "{}",
    jsonResult: extra.jsonResult ?? '{"code":200,"msg":"操作成功"}',
    status,
    errorMsg: extra.errorMsg ?? "",
    operTime,
    costTime,
  };
}

export function resetMockMonitorState(): void {
  online = seedOnline();
  loginLogs = seedLoginLogs();
  operLogs = seedOperLogs();
  lockedUsers.clear();
  lockedUsers.add("ry");
  resetMockJobState();
  resetMockRuntimeState();
}

resetMockMonitorState();

function queryOf(request: MockRequest): Record<string, string> {
  return request.query ?? {};
}

function includes(haystack: string, needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

function inDateRange(value: string, query: Record<string, string>): boolean {
  const begin = query["params[beginTime]"];
  const end = query["params[endTime]"];
  if (begin && value < begin) {
    return false;
  }
  if (end && value > end) {
    return false;
  }
  return true;
}

function pageOf<T>(
  rows: readonly T[],
  query: Record<string, string>,
  map: (row: T) => MockJson,
): { rows: MockJson[]; total: number } {
  const pageNum = Number(query.pageNum ?? "1") || 1;
  const pageSize = Number(query.pageSize ?? "10") || 10;
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size).map(map),
    total: rows.length,
  };
}

function sortRows<T>(
  rows: readonly T[],
  query: Record<string, string>,
  getters: Record<string, (row: T) => string | number>,
): T[] {
  const column = query.orderByColumn;
  if (!column) {
    return [...rows];
  }
  const getter = getters[column];
  if (!getter) {
    return [...rows];
  }
  const dir = query.isAsc === "asc" || query.isAsc === "ascending" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = getter(left);
    const b = getter(right);
    if (a < b) return -1 * dir;
    if (a > b) return 1 * dir;
    return 0;
  });
}

function exportBlob(): MockResponse {
  return {
    status: 200,
    body: { code: 200, msg: "操作成功" },
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    raw: "mock-xlsx",
  };
}

function parseIds(rest: string): string[] {
  return rest
    .split(",")
    .map((item) => decodeURIComponent(item))
    .filter(Boolean);
}

export function dispatchMonitorMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  const query = queryOf(request);

  if (method === "GET" && path === "/monitor/online/list") {
    const rows = online.filter(
      (row) =>
        includes(row.ipaddr, query.ipaddr) &&
        includes(row.userName, query.userName),
    );
    return ok({
      code: 200,
      msg: "查询成功",
      rows,
      total: rows.length,
    });
  }
  const onlineRest = restAfter(path, "/monitor/online");
  if (method === "DELETE" && onlineRest && onlineRest !== "list") {
    const tokenId = decodeURIComponent(onlineRest);
    const before = online.length;
    online = online.filter((row) => row.tokenId !== tokenId);
    return online.length !== before
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }

  if (method === "GET" && path === "/monitor/logininfor/list") {
    const filtered = loginLogs.filter(
      (row) =>
        includes(row.ipaddr, query.ipaddr) &&
        includes(row.userName, query.userName) &&
        (!query.status || row.status === query.status) &&
        inDateRange(row.loginTime, query),
    );
    const sorted = sortRows(filtered, query, {
      loginTime: (row) => row.loginTime,
      userName: (row) => row.userName,
    });
    const page = pageOf(sorted, query, (row) => ({ ...row }));
    return ok({
      code: 200,
      msg: "查询成功",
      rows: page.rows,
      total: page.total,
    });
  }
  if (method === "POST" && path === "/monitor/logininfor/export") {
    return exportBlob();
  }
  if (method === "DELETE" && path === "/monitor/logininfor/clean") {
    loginLogs = [];
    return ok({ code: 200, msg: "清空成功" });
  }
  const unlockRest = restAfter(path, "/monitor/logininfor/unlock");
  if (method === "GET" && unlockRest) {
    const userName = decodeURIComponent(unlockRest);
    lockedUsers.delete(userName);
    return ok({ code: 200, msg: `用户${userName}解锁成功` });
  }
  const loginRest = restAfter(path, "/monitor/logininfor");
  if (
    method === "DELETE" &&
    loginRest &&
    loginRest !== "list" &&
    loginRest !== "export" &&
    loginRest !== "clean"
  ) {
    const ids = new Set(parseIds(loginRest));
    const before = loginLogs.length;
    loginLogs = loginLogs.filter((row) => !ids.has(row.infoId));
    return loginLogs.length !== before
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }

  if (method === "GET" && path === "/monitor/operlog/list") {
    const businessType =
      query.businessType !== undefined && query.businessType !== ""
        ? Number(query.businessType)
        : undefined;
    const filtered = operLogs.filter(
      (row) =>
        includes(row.operIp, query.operIp) &&
        includes(row.title, query.title) &&
        includes(row.operName, query.operName) &&
        (businessType === undefined || Number.isNaN(businessType)
          ? true
          : row.businessType === businessType) &&
        (!query.status || row.status === query.status) &&
        inDateRange(row.operTime, query),
    );
    const sorted = sortRows(filtered, query, {
      operTime: (row) => row.operTime,
      operName: (row) => row.operName,
      costTime: (row) => row.costTime,
    });
    const page = pageOf(sorted, query, (row) => ({ ...row }));
    return ok({
      code: 200,
      msg: "查询成功",
      rows: page.rows,
      total: page.total,
    });
  }
  if (method === "POST" && path === "/monitor/operlog/export") {
    return exportBlob();
  }
  if (method === "DELETE" && path === "/monitor/operlog/clean") {
    operLogs = [];
    return ok({ code: 200, msg: "清空成功" });
  }
  const operRest = restAfter(path, "/monitor/operlog");
  if (
    method === "DELETE" &&
    operRest &&
    operRest !== "list" &&
    operRest !== "export" &&
    operRest !== "clean"
  ) {
    const ids = new Set(parseIds(operRest));
    const before = operLogs.length;
    operLogs = operLogs.filter((row) => !ids.has(row.operId));
    return operLogs.length !== before
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }

  return dispatchJobMock(request) ?? dispatchRuntimeMock(request);
}

export function isUserLocked(userName: string): boolean {
  return lockedUsers.has(userName);
}
