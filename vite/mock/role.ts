import type { MockJson, MockRequest, MockResponse } from "./auth.ts";
import { listMockDeptTree, listMockMenuTree } from "./org.ts";
import {
  addMockRole,
  addRoleToUsers,
  deleteMockRoles,
  getMockRoles,
  getMockUsers,
  removeRoleFromUsers,
  updateMockRole,
} from "./user.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const ADMIN_ROLE_ID = "1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function queryOf(request: MockRequest): Record<string, string> {
  return request.query ?? {};
}

function includes(haystack: string, needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string"
    ? value.trim()
    : typeof value === "number"
      ? String(value)
      : "";
}

function readIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string" && value.length > 0) {
    return value.split(",").filter(Boolean);
  }
  return [];
}

function readNumber(body: Record<string, unknown>, key: string): number | undefined {
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
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

function inDateRange(createTime: string, query: Record<string, string>): boolean {
  const day = createTime.slice(0, 10);
  const begin = query["params[beginTime]"];
  const end = query["params[endTime]"];
  if (begin && day < begin) {
    return false;
  }
  if (end && day > end) {
    return false;
  }
  return true;
}

function publicRole(row: ReturnType<typeof getMockRoles>[number]): MockJson {
  return { ...row };
}

function publicUser(row: ReturnType<typeof getMockUsers>[number]): MockJson {
  return {
    userId: row.userId,
    deptId: row.deptId,
    userName: row.userName,
    nickName: row.nickName,
    email: row.email,
    phonenumber: row.phonenumber,
    status: row.status,
    createTime: row.createTime,
  };
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

function exportBlob(): MockResponse {
  return {
    status: 200,
    body: { code: 200, msg: "操作成功" },
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    raw: "mock-xlsx",
  };
}

function readScope(value: string): "1" | "2" | "3" | "4" | "5" {
  return value === "2" || value === "3" || value === "4" || value === "5"
    ? value
    : "1";
}

type RoleWriteFields = Omit<ReturnType<typeof getMockRoles>[number], "roleId" | "createTime">;

function isFailResponse(
  value: RoleWriteFields | Partial<RoleWriteFields> | MockResponse,
): value is MockResponse {
  return "body" in value;
}

function roleFromBody(
  body: Record<string, unknown>,
  mode: "create",
): RoleWriteFields | MockResponse;
function roleFromBody(
  body: Record<string, unknown>,
  mode: "update",
): Partial<RoleWriteFields> | MockResponse;
function roleFromBody(
  body: Record<string, unknown>,
  mode: "create" | "update",
): RoleWriteFields | Partial<RoleWriteFields> | MockResponse {
  const roleName = readString(body, "roleName");
  const roleKey = readString(body, "roleKey");
  const roleSort = readNumber(body, "roleSort");
  if (!roleName) return fail("角色名称不能为空");
  if (!roleKey) return fail("权限字符不能为空");
  if (roleSort === undefined) return fail("角色顺序不能为空");
  const core = {
    roleName,
    roleKey,
    roleSort,
    status: readString(body, "status") === "1" ? ("1" as const) : ("0" as const),
    dataScope: readScope(readString(body, "dataScope")),
    remark: readString(body, "remark"),
  };
  if (mode === "create") {
    return {
      ...core,
      menuCheckStrictly: body.menuCheckStrictly !== false,
      deptCheckStrictly: body.deptCheckStrictly !== false,
      menuIds: readIds(body.menuIds),
      deptIds: readIds(body.deptIds),
    };
  }
  const patch: Partial<RoleWriteFields> = { ...core };
  if ("menuCheckStrictly" in body) {
    patch.menuCheckStrictly = body.menuCheckStrictly !== false;
  }
  if ("deptCheckStrictly" in body) {
    patch.deptCheckStrictly = body.deptCheckStrictly !== false;
  }
  if ("menuIds" in body) {
    patch.menuIds = readIds(body.menuIds);
  }
  if ("deptIds" in body) {
    patch.deptIds = readIds(body.deptIds);
  }
  return patch;
}

export function dispatchRoleMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  const query = queryOf(request);

  if (method === "GET" && path === "/system/role/list") {
    const rows = getMockRoles().filter(
      (row) =>
        includes(row.roleName, query.roleName) &&
        includes(row.roleKey, query.roleKey) &&
        (!query.status || row.status === query.status) &&
        inDateRange(row.createTime, query),
    );
    const page = pageOf(rows, query, publicRole);
    return ok({
      code: 200,
      msg: "查询成功",
      rows: page.rows,
      total: page.total,
    });
  }
  if (method === "POST" && path === "/system/role/export") {
    return exportBlob();
  }
  if (method === "PUT" && path === "/system/role/changeStatus") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const roleId = readString(request.body, "roleId");
    if (roleId === ADMIN_ROLE_ID) return fail("不允许操作超级管理员角色");
    const row = updateMockRole(roleId, {
      status: readString(request.body, "status") === "1" ? "1" : "0",
    });
    return row ? ok({ code: 200, msg: "操作成功" }) : fail("数据不存在");
  }
  if (method === "PUT" && path === "/system/role/dataScope") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const roleId = readString(request.body, "roleId");
    if (roleId === ADMIN_ROLE_ID) return fail("不允许操作超级管理员角色");
    const parsed = roleFromBody(request.body, "update");
    if (isFailResponse(parsed)) {
      return parsed;
    }
    const row = updateMockRole(roleId, parsed);
    return row ? ok({ code: 200, msg: "操作成功" }) : fail("数据不存在");
  }
  if (method === "GET" && path === "/system/role/authUser/allocatedList") {
    const roleId = query.roleId;
    if (!roleId) return fail("角色不能为空");
    const rows = getMockUsers().filter(
      (row) =>
        row.roleIds.includes(roleId) &&
        includes(row.userName, query.userName) &&
        includes(row.phonenumber, query.phonenumber),
    );
    const page = pageOf(rows, query, publicUser);
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "GET" && path === "/system/role/authUser/unallocatedList") {
    const roleId = query.roleId;
    if (!roleId) return fail("角色不能为空");
    const rows = getMockUsers().filter(
      (row) =>
        !row.roleIds.includes(roleId) &&
        includes(row.userName, query.userName) &&
        includes(row.phonenumber, query.phonenumber),
    );
    const page = pageOf(rows, query, publicUser);
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "PUT" && path === "/system/role/authUser/cancel") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const roleId = readString(request.body, "roleId");
    const userId = readString(request.body, "userId");
    if (!roleId || !userId) return fail("请求参数错误");
    removeRoleFromUsers(roleId, [userId]);
    return ok({ code: 200, msg: "取消授权成功" });
  }
  if (method === "PUT" && path === "/system/role/authUser/cancelAll") {
    const roleId = query.roleId;
    const userIds = readIds(query.userIds);
    if (!roleId || userIds.length === 0) return fail("请选择要取消授权的用户");
    removeRoleFromUsers(roleId, userIds);
    return ok({ code: 200, msg: "取消授权成功" });
  }
  if (method === "PUT" && path === "/system/role/authUser/selectAll") {
    const roleId = query.roleId;
    const userIds = readIds(query.userIds);
    if (!roleId || userIds.length === 0) return fail("请选择要分配的用户");
    addRoleToUsers(roleId, userIds);
    return ok({ code: 200, msg: "授权成功" });
  }
  const deptTree = restAfter(path, "/system/role/deptTree");
  if (method === "GET" && deptTree) {
    const row = getMockRoles().find((item) => item.roleId === decodeURIComponent(deptTree));
    if (!row) return fail("数据不存在");
    return ok({
      code: 200,
      msg: "操作成功",
      checkedKeys: row.deptIds,
      depts: listMockDeptTree(),
    });
  }
  const roleMenu = restAfter(path, "/system/menu/roleMenuTreeselect");
  if (method === "GET" && roleMenu) {
    const row = getMockRoles().find((item) => item.roleId === decodeURIComponent(roleMenu));
    if (!row) return fail("数据不存在");
    return ok({
      code: 200,
      msg: "操作成功",
      checkedKeys: row.menuIds,
      menus: listMockMenuTree(),
    });
  }
  if (method === "POST" && path === "/system/role") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const parsed = roleFromBody(request.body, "create");
    if (isFailResponse(parsed)) {
      return parsed;
    }
    if (getMockRoles().some((item) => item.roleKey === parsed.roleKey)) {
      return fail("角色权限已存在");
    }
    addMockRole(parsed);
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/role") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const roleId = readString(request.body, "roleId");
    if (roleId === ADMIN_ROLE_ID) return fail("不允许操作超级管理员角色");
    const parsed = roleFromBody(request.body, "update");
    if (isFailResponse(parsed)) {
      return parsed;
    }
    if (
      getMockRoles().some((item) => item.roleKey === parsed.roleKey && item.roleId !== roleId)
    ) {
      return fail("角色权限已存在");
    }
    const row = updateMockRole(roleId, parsed);
    return row ? ok({ code: 200, msg: "操作成功" }) : fail("数据不存在");
  }
  const rest = restAfter(path, "/system/role");
  if (rest === null || rest === "" || rest.startsWith("authUser") || rest.startsWith("deptTree")) {
    return null;
  }
  if (method === "GET") {
    const row = getMockRoles().find((item) => item.roleId === decodeURIComponent(rest));
    return row
      ? ok({ code: 200, msg: "操作成功", data: publicRole(row) })
      : fail("数据不存在");
  }
  if (method === "DELETE") {
    if (rest === "") return fail("请选择要删除的数据");
    const ids = rest.split(",").map((item) => decodeURIComponent(item)).filter(Boolean);
    if (ids.includes(ADMIN_ROLE_ID)) return fail("不允许操作超级管理员角色");
    return deleteMockRoles(ids)
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }
  return null;
}