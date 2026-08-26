import type { MockJson, MockRequest, MockResponse } from "./auth.ts";
import { getMockDepts, listMockDeptTree } from "./org.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const now = "2026-08-26 00:00:00";
const ADMIN_ID = "1";

type UserRow = {
  userId: string;
  deptId: string;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  sex: "0" | "1" | "2";
  status: "0" | "1";
  remark: string;
  password: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  loginIp: string;
  loginDate: string;
  postIds: string[];
  roleIds: string[];
};

export type MockRoleRow = {
  roleId: string;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: "1" | "2" | "3" | "4" | "5";
  status: "0" | "1";
  remark: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  menuIds: string[];
  deptIds: string[];
  createTime: string;
};

type PostRow = {
  postId: string;
  postCode: string;
  postName: string;
  postSort: number;
  status: "0" | "1";
};

let roles: MockRoleRow[] = [];

function seedRoles(): MockRoleRow[] {
  return [
    {
      roleId: "1",
      roleName: "超级管理员",
      roleKey: "admin",
      roleSort: 1,
      dataScope: "1",
      status: "0",
      remark: "超级管理员",
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      menuIds: ["1", "100", "1001", "101", "102", "103", "2", "200"],
      deptIds: ["100", "101", "103"],
      createTime: "2026-01-01 00:00:00",
    },
    {
      roleId: "2",
      roleName: "普通角色",
      roleKey: "common",
      roleSort: 2,
      dataScope: "2",
      status: "0",
      remark: "",
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      menuIds: ["1", "100"],
      deptIds: ["103"],
      createTime: "2026-01-01 00:00:00",
    },
    {
      roleId: "3",
      roleName: "停用角色",
      roleKey: "disabled",
      roleSort: 3,
      dataScope: "1",
      status: "1",
      remark: "停用",
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      menuIds: [],
      deptIds: [],
      createTime: "2026-01-01 00:00:00",
    },
    {
      roleId: "4",
      roleName: "只读角色",
      roleKey: "readonly",
      roleSort: 4,
      dataScope: "5",
      status: "0",
      remark: "",
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      menuIds: ["1"],
      deptIds: [],
      createTime: "2026-03-01 00:00:00",
    },
  ];
}

const posts: PostRow[] = [
  { postId: "1", postCode: "ceo", postName: "董事长", postSort: 1, status: "0" },
  { postId: "2", postCode: "se", postName: "项目经理", postSort: 2, status: "0" },
  { postId: "3", postCode: "hr", postName: "人力资源", postSort: 3, status: "0" },
  { postId: "4", postCode: "user", postName: "普通员工", postSort: 4, status: "1" },
];

let users: UserRow[] = [];

function user(
  userId: string,
  userName: string,
  nickName: string,
  deptId: string,
  status: "0" | "1",
  roleIds: string[],
  postIds: string[],
  extra: Partial<UserRow> = {},
): UserRow {
  return {
    userId,
    deptId,
    userName,
    nickName,
    email: `${userName}@ruoyi.local`,
    phonenumber: extra.phonenumber ?? `1580000000${userId}`.slice(0, 11),
    sex: extra.sex ?? "0",
    status,
    remark: extra.remark ?? "",
    password: "admin123",
    createBy: "admin",
    createTime: extra.createTime ?? "2026-01-01 00:00:00",
    updateBy: "admin",
    updateTime: "2026-01-01 00:00:00",
    loginIp: "127.0.0.1",
    loginDate: "2026-08-01 08:00:00",
    postIds,
    roleIds,
    ...extra,
  };
}

function seedUsers(): UserRow[] {
  const rows = [
    user("1", "admin", "管理员", "103", "0", ["1"], ["1"], {
      phonenumber: "15888888888",
    }),
    user("2", "ry", "若依", "105", "0", ["2"], ["2"], {
      phonenumber: "15666666666",
    }),
  ];
  for (let index = 3; index <= 12; index += 1) {
    rows.push(
      user(
        String(index),
        `user${index}`,
        `测试${index}`,
        index % 2 === 0 ? "104" : "103",
        index === 12 ? "1" : "0",
        ["2"],
        ["3"],
        { createTime: `2026-02-${String(index).padStart(2, "0")} 00:00:00` },
      ),
    );
  }
  return rows;
}

export function resetMockUserState(): void {
  roles = seedRoles();
  users = seedUsers();
}

export function getMockRoles(): MockRoleRow[] {
  return roles;
}

export function getMockUsers(): UserRow[] {
  return users;
}

export function addMockRole(input: Omit<MockRoleRow, "roleId" | "createTime">): MockRoleRow {
  const row: MockRoleRow = {
    ...input,
    roleId: nextId(roles.map((item) => item.roleId)),
    createTime: now,
  };
  roles.push(row);
  return row;
}

export function updateMockRole(roleId: string, patch: Partial<MockRoleRow>): MockRoleRow | null {
  const row = roles.find((item) => item.roleId === roleId);
  if (!row) {
    return null;
  }
  Object.assign(row, patch);
  return row;
}

export function deleteMockRoles(ids: readonly string[]): boolean {
  const blocked = ids.includes("1");
  if (blocked) {
    return false;
  }
  const before = roles.length;
  roles = roles.filter((item) => !ids.includes(item.roleId));
  return roles.length !== before;
}

export function addRoleToUsers(roleId: string, userIds: readonly string[]): void {
  for (const userId of userIds) {
    const row = users.find((item) => item.userId === userId);
    if (row && !row.roleIds.includes(roleId)) {
      row.roleIds = [...row.roleIds, roleId];
    }
  }
}

export function removeRoleFromUsers(roleId: string, userIds: readonly string[]): void {
  for (const userId of userIds) {
    const row = users.find((item) => item.userId === userId);
    if (row) {
      row.roleIds = row.roleIds.filter((id) => id !== roleId);
    }
  }
}

resetMockUserState();

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
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
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

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

function nextId(ids: string[]): string {
  return String(ids.reduce((max, id) => Math.max(max, Number(id) || 0), 0) + 1);
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

function userInDept(userDeptId: string, filterDeptId: string): boolean {
  if (userDeptId === filterDeptId) {
    return true;
  }
  const dept = getMockDepts().find((item) => item.deptId === userDeptId);
  return dept ? dept.ancestors.split(",").includes(filterDeptId) : false;
}

function publicUser(row: UserRow): MockJson {
  const dept = getMockDepts().find((item) => item.deptId === row.deptId);
  return {
    userId: row.userId,
    deptId: row.deptId,
    userName: row.userName,
    nickName: row.nickName,
    email: row.email,
    phonenumber: row.phonenumber,
    sex: row.sex,
    status: row.status,
    remark: row.remark,
    createBy: row.createBy,
    createTime: row.createTime,
    updateBy: row.updateBy,
    updateTime: row.updateTime,
    loginIp: row.loginIp,
    loginDate: row.loginDate,
    dept: dept
      ? {
          deptId: dept.deptId,
          parentId: dept.parentId,
          deptName: dept.deptName,
          orderNum: dept.orderNum,
          status: dept.status,
        }
      : null,
  };
}

function pageOf(
  rows: UserRow[],
  query: Record<string, string>,
): {
  rows: MockJson[];
  total: number;
} {
  const pageNum = Number(query.pageNum ?? "1") || 1;
  const pageSize = Number(query.pageSize ?? "10") || 10;
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size).map(publicUser),
    total: rows.length,
  };
}

function exportBlob(): MockResponse {
  return {
    status: 200,
    body: { code: 200, msg: "操作成功" },
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    raw: "mock-xlsx",
  };
}

function formOptions(): MockResponse {
  return ok({
    code: 200,
    msg: "操作成功",
    posts,
    roles,
  });
}

export function dispatchUserMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  if (path.startsWith("/system/user/profile")) {
    return null;
  }
  const query = queryOf(request);

  if (method === "GET" && path === "/system/user/list") {
    const rows = users.filter(
      (row) =>
        includes(row.userName, query.userName) &&
        includes(row.phonenumber, query.phonenumber) &&
        (!query.status || row.status === query.status) &&
        (!query.deptId || userInDept(row.deptId, query.deptId)) &&
        inDateRange(row.createTime, query),
    );
    const page = pageOf(rows, query);
    return ok({
      code: 200,
      msg: "查询成功",
      rows: page.rows,
      total: page.total,
    });
  }
  if (method === "GET" && path === "/system/user/deptTree") {
    return ok({ code: 200, msg: "操作成功", data: listMockDeptTree() });
  }
  if (method === "POST" && path === "/system/user/export") {
    return exportBlob();
  }
  if (method === "POST" && (path === "/system/user/importData" || path === "/system/user/importTemplate")) {
    return path === "/system/user/importTemplate" ? exportBlob() : ok({ code: 200, msg: "导入成功" });
  }
  if (method === "PUT" && path === "/system/user/resetPwd") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const userId = readString(request.body, "userId");
    const password = readString(request.body, "password");
    if (userId === ADMIN_ID) return fail("不允许操作超级管理员用户");
    const row = users.find((item) => item.userId === userId);
    if (!row) return fail("数据不存在");
    if (!password || password.length < 6) return fail("密码长度必须介于 6 和 20 之间");
    row.password = password;
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/user/changeStatus") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const userId = readString(request.body, "userId");
    if (userId === ADMIN_ID) return fail("不允许操作超级管理员用户");
    const row = users.find((item) => item.userId === userId);
    if (!row) return fail("数据不存在");
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/user/authRole") {
    const userId = query.userId;
    if (!userId) return fail("用户不能为空");
    if (userId === ADMIN_ID) return fail("不允许操作超级管理员用户");
    const row = users.find((item) => item.userId === userId);
    if (!row) return fail("数据不存在");
    row.roleIds = readIds(query.roleIds);
    return ok({ code: 200, msg: "操作成功" });
  }
  const authRest = restAfter(path, "/system/user/authRole");
  if (method === "GET" && authRest) {
    const row = users.find((item) => item.userId === decodeURIComponent(authRest));
    if (!row) return fail("数据不存在");
    const assigned = new Set(row.roleIds);
    return ok({
      code: 200,
      msg: "操作成功",
      user: publicUser(row),
      roles: roles.map((role) => ({ ...role, flag: assigned.has(role.roleId) })),
    });
  }
  if (method === "POST" && path === "/system/user") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const userName = readString(request.body, "userName");
    const nickName = readString(request.body, "nickName");
    const password = readString(request.body, "password");
    if (!userName) return fail("用户名称不能为空");
    if (userName.length < 2 || userName.length > 20) {
      return fail("用户名称长度必须介于 2 和 20 之间");
    }
    if (!nickName) return fail("用户昵称不能为空");
    if (!password || password.length < 6) return fail("密码长度必须介于 6 和 20 之间");
    if (users.some((item) => item.userName === userName)) {
      return fail("登录账号已存在");
    }
    users.push(
      user(
        nextId(users.map((item) => item.userId)),
        userName,
        nickName,
        readString(request.body, "deptId") || "103",
        readString(request.body, "status") === "1" ? "1" : "0",
        readIds(request.body.roleIds),
        readIds(request.body.postIds),
        {
          email: readString(request.body, "email"),
          phonenumber: readString(request.body, "phonenumber"),
          sex: request.body.sex === "1" || request.body.sex === "2" ? request.body.sex : "0",
          remark: readString(request.body, "remark"),
          password,
          createTime: now,
        },
      ),
    );
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/user") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const userId = readString(request.body, "userId");
    if (userId === ADMIN_ID) return fail("不允许操作超级管理员用户");
    const row = users.find((item) => item.userId === userId);
    if (!row) return fail("数据不存在");
    const nickName = readString(request.body, "nickName");
    if (!nickName) return fail("用户昵称不能为空");
    row.nickName = nickName;
    row.deptId = readString(request.body, "deptId") || row.deptId;
    row.email = readString(request.body, "email");
    row.phonenumber = readString(request.body, "phonenumber");
    row.sex = request.body.sex === "1" || request.body.sex === "2" ? request.body.sex : "0";
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    row.remark = readString(request.body, "remark");
    row.postIds = readIds(request.body.postIds);
    row.roleIds = readIds(request.body.roleIds);
    const password = readString(request.body, "password");
    if (password) {
      row.password = password;
    }
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/user");
  if (rest === null) {
    return null;
  }
  if (method === "GET" && rest === "") {
    return formOptions();
  }
  if (method === "GET") {
    const row = users.find((item) => item.userId === decodeURIComponent(rest));
    if (!row) return fail("数据不存在");
    return ok({
      code: 200,
      msg: "操作成功",
      data: publicUser(row),
      postIds: row.postIds,
      roleIds: row.roleIds,
      posts,
      roles,
    });
  }
  if (method === "DELETE") {
    if (rest === "") return fail("请选择要删除的数据");
    const ids = rest
      .split(",")
      .map((item) => decodeURIComponent(item))
      .filter(Boolean);
    if (ids.includes(ADMIN_ID)) return fail("不允许操作超级管理员用户");
    const before = users.length;
    users = users.filter((item) => !ids.includes(item.userId));
    if (users.length === before) return fail("数据不存在");
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}
