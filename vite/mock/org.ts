import type { MockJson, MockRequest, MockResponse } from "./auth.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const now = "2026-08-26 00:00:00";

type DeptRow = {
  deptId: string;
  parentId: string;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: "0" | "1";
  createTime: string;
};

type MenuRow = {
  menuId: string;
  parentId: string;
  menuName: string;
  orderNum: number;
  path: string;
  component: string;
  query: string;
  routeName: string;
  perms: string;
  icon: string;
  isFrame: "0" | "1";
  isCache: "0" | "1";
  menuType: "M" | "C" | "F";
  visible: "0" | "1";
  status: "0" | "1";
  createTime: string;
};

let depts: DeptRow[] = [];
let menus: MenuRow[] = [];

function seedDepts(): DeptRow[] {
  return [
    dept("100", "0", "0", "若依科技", 0, "若依", "15888888888", "ry@ruoyi.local", "0"),
    dept("101", "100", "0,100", "深圳总公司", 1, "若依", "15888888888", "sz@ruoyi.local", "0"),
    dept("102", "100", "0,100", "长沙分公司", 2, "若依", "15888888888", "cs@ruoyi.local", "0"),
    dept("103", "101", "0,100,101", "研发部门", 1, "若依", "15888888888", "dev@ruoyi.local", "0"),
    dept("104", "101", "0,100,101", "市场部门", 2, "若依", "15888888888", "mkt@ruoyi.local", "0"),
    dept("105", "101", "0,100,101", "测试部门", 3, "若依", "15888888888", "qa@ruoyi.local", "0"),
    dept("106", "102", "0,100,102", "市场部门", 1, "若依", "15888888888", "csmkt@ruoyi.local", "1"),
  ];
}

function dept(
  deptId: string,
  parentId: string,
  ancestors: string,
  deptName: string,
  orderNum: number,
  leader: string,
  phone: string,
  email: string,
  status: "0" | "1",
): DeptRow {
  return {
    deptId,
    parentId,
    ancestors,
    deptName,
    orderNum,
    leader,
    phone,
    email,
    status,
    createTime: "2026-01-01 00:00:00",
  };
}

function seedMenus(): MenuRow[] {
  return [
    menu("1", "0", "系统管理", 1, "system", "", "System", "", "system", "M"),
    menu("100", "1", "用户管理", 1, "user", "system/user/index", "User", "system:user:list", "user", "C"),
    menu("1001", "100", "用户查询", 1, "", "", "", "system:user:query", "", "F"),
    menu("101", "1", "角色管理", 2, "role", "system/role/index", "Role", "system:role:list", "peoples", "C"),
    menu("102", "1", "菜单管理", 3, "menu", "system/menu/index", "Menu", "system:menu:list", "tree-table", "C"),
    menu("103", "1", "部门管理", 4, "dept", "system/dept/index", "Dept", "system:dept:list", "tree", "C"),
    menu("2", "0", "系统监控", 2, "monitor", "", "Monitor", "", "monitor", "M"),
    menu("200", "2", "在线用户", 1, "online", "monitor/online/index", "Online", "monitor:online:list", "online", "C"),
  ];
}

function menu(
  menuId: string,
  parentId: string,
  menuName: string,
  orderNum: number,
  path: string,
  component: string,
  routeName: string,
  perms: string,
  icon: string,
  menuType: "M" | "C" | "F",
  status: "0" | "1" = "0",
): MenuRow {
  return {
    menuId,
    parentId,
    menuName,
    orderNum,
    path,
    component,
    query: "",
    routeName,
    perms,
    icon,
    isFrame: "1",
    isCache: "0",
    menuType,
    visible: "0",
    status,
    createTime: "2026-01-01 00:00:00",
  };
}

export type MockDeptTreeNode = {
  id: string;
  label: string;
  disabled: boolean;
  children: MockDeptTreeNode[];
};

export function getMockDepts(): ReadonlyArray<{
  deptId: string;
  parentId: string;
  ancestors: string;
  deptName: string;
  orderNum: number;
  status: "0" | "1";
}> {
  return depts;
}

export function listMockDeptTree(): MockDeptTreeNode[] {
  const nodes: MockDeptTreeNode[] = depts.map((row) => ({
    id: row.deptId,
    label: row.deptName,
    disabled: row.status === "1",
    children: [],
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: MockDeptTreeNode[] = [];
  for (const row of depts) {
    const node = byId.get(row.deptId);
    if (!node) {
      continue;
    }
    const parent = byId.get(row.parentId);
    if (!parent) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }
  return roots;
}

export function resetMockOrgState(): void {
  depts = seedDepts();
  menus = seedMenus();
}

resetMockOrgState();

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

function nextId(ids: string[]): string {
  return String(ids.reduce((max, id) => Math.max(max, Number(id) || 0), 0) + 1);
}

function childIds(rows: readonly { id: string; parentId: string }[], parentId: string): Set<string> {
  const ids = new Set<string>([parentId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of rows) {
      if (!ids.has(row.id) && ids.has(row.parentId)) {
        ids.add(row.id);
        grew = true;
      }
    }
  }
  return ids;
}

function ancestorsOf(parentId: string): string {
  if (parentId === "0" || parentId === "") {
    return "0";
  }
  const parent = depts.find((item) => item.deptId === parentId);
  if (!parent) {
    return `0,${parentId}`;
  }
  return `${parent.ancestors},${parent.deptId}`;
}

function wouldCycle(
  rows: readonly { id: string; parentId: string }[],
  nodeId: string,
  nextParentId: string,
): boolean {
  if (nextParentId === "" || nextParentId === "0") {
    return false;
  }
  if (nextParentId === nodeId) {
    return true;
  }
  return childIds(rows, nodeId).has(nextParentId);
}

function applySort<T extends { orderNum: number }>(
  items: T[],
  idOf: (item: T) => string,
  body: Record<string, unknown>,
): MockResponse {
  const ids = readString(body, "ids");
  const orderNums = readString(body, "orderNums");
  if (!ids || !orderNums) {
    return fail("未检测到排序修改");
  }
  const idList = ids.split(",").filter(Boolean);
  const orderList = orderNums.split(",");
  if (idList.length !== orderList.length) {
    return fail("排序参数不完整");
  }
  for (const [index, id] of idList.entries()) {
    const row = items.find((item) => idOf(item) === id);
    if (row) {
      row.orderNum = Number(orderList[index]) || 0;
    }
  }
  return ok({ code: 200, msg: "操作成功" });
}

export function listMockMenuTree(): Array<{
  id: string;
  label: string;
  children: unknown[];
}> {
  return toMenuTreeSelect(menus);
}

function toMenuTreeSelect(
  rows: MenuRow[],
): Array<{ id: string; label: string; children: unknown[] }> {
  const nodes = rows.map((row) => ({
    id: row.menuId,
    label: row.menuName,
    parentId: row.parentId,
    children: [] as unknown[],
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: typeof nodes = [];
  for (const node of nodes) {
    const parent = byId.get(node.parentId);
    if (!parent) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }
  return roots;
}

function dispatchDept(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/dept/list") {
    const rows = depts.filter(
      (row) =>
        includes(row.deptName, query.deptName) &&
        (!query.status || row.status === query.status),
    );
    return ok({ code: 200, msg: "查询成功", data: rows });
  }
  const excludeRest = restAfter(path, "/system/dept/list/exclude");
  if (method === "GET" && excludeRest) {
    const blocked = childIds(
      depts.map((row) => ({ id: row.deptId, parentId: row.parentId })),
      decodeURIComponent(excludeRest),
    );
    return ok({
      code: 200,
      msg: "查询成功",
      data: depts.filter((row) => !blocked.has(row.deptId)),
    });
  }
  if (method === "PUT" && path === "/system/dept/updateSort") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    return applySort(depts, (row) => row.deptId, request.body);
  }
  if (method === "POST" && path === "/system/dept") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const deptName = readString(request.body, "deptName");
    const parentId = readString(request.body, "parentId") || "0";
    const orderNum = readNumber(request.body, "orderNum");
    if (!deptName) return fail("部门名称不能为空");
    if (orderNum === undefined) return fail("显示排序不能为空");
    depts.push({
      deptId: nextId(depts.map((item) => item.deptId)),
      parentId,
      ancestors: ancestorsOf(parentId),
      deptName,
      orderNum,
      leader: readString(request.body, "leader"),
      phone: readString(request.body, "phone"),
      email: readString(request.body, "email"),
      status: readString(request.body, "status") === "1" ? "1" : "0",
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/dept") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const deptId = readString(request.body, "deptId");
    const row = depts.find((item) => item.deptId === deptId);
    if (!row) return fail("数据不存在");
    const deptName = readString(request.body, "deptName");
    const parentId = readString(request.body, "parentId") || "0";
    const orderNum = readNumber(request.body, "orderNum");
    if (!deptName) return fail("部门名称不能为空");
    if (orderNum === undefined) return fail("显示排序不能为空");
    if (
      wouldCycle(
        depts.map((item) => ({ id: item.deptId, parentId: item.parentId })),
        deptId,
        parentId,
      )
    ) {
      return fail("上级部门不能选择自己或子部门");
    }
    row.deptName = deptName;
    row.parentId = parentId;
    row.ancestors = ancestorsOf(parentId);
    row.orderNum = orderNum;
    row.leader = readString(request.body, "leader");
    row.phone = readString(request.body, "phone");
    row.email = readString(request.body, "email");
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/dept");
  if (rest === null || rest === "" || rest.startsWith("list")) {
    return null;
  }
  if (method === "GET") {
    const row = depts.find((item) => item.deptId === decodeURIComponent(rest));
    return row ? ok({ code: 200, msg: "操作成功", data: row }) : fail("数据不存在");
  }
  if (method === "DELETE") {
    const deptId = decodeURIComponent(rest);
    const row = depts.find((item) => item.deptId === deptId);
    if (!row) return fail("数据不存在");
    if (row.parentId === "0") return fail("顶级部门不能删除");
    if (depts.some((item) => item.parentId === deptId)) {
      return fail("存在下级部门,不允许删除");
    }
    depts = depts.filter((item) => item.deptId !== deptId);
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}

function dispatchMenu(method: string, path: string, request: MockRequest): MockResponse | null {
  const query = queryOf(request);
  if (method === "GET" && path === "/system/menu/list") {
    const rows = menus.filter(
      (row) =>
        includes(row.menuName, query.menuName) &&
        (!query.status || row.status === query.status),
    );
    return ok({ code: 200, msg: "查询成功", data: rows });
  }
  if (method === "GET" && path === "/system/menu/treeselect") {
    return ok({ code: 200, msg: "操作成功", data: listMockMenuTree() });
  }
  if (method === "PUT" && path === "/system/menu/updateSort") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    return applySort(menus, (row) => row.menuId, request.body);
  }
  if (method === "POST" && path === "/system/menu") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const menuName = readString(request.body, "menuName");
    const menuType = readString(request.body, "menuType");
    const pathValue = readString(request.body, "path");
    const orderNum = readNumber(request.body, "orderNum");
    if (!menuName) return fail("菜单名称不能为空");
    if (menuType !== "M" && menuType !== "C" && menuType !== "F") {
      return fail("菜单类型不能为空");
    }
    if (menuType !== "F" && !pathValue) return fail("路由地址不能为空");
    if (orderNum === undefined) return fail("菜单顺序不能为空");
    menus.push({
      menuId: nextId(menus.map((item) => item.menuId)),
      parentId: readString(request.body, "parentId") || "0",
      menuName,
      orderNum,
      path: pathValue,
      component: readString(request.body, "component"),
      query: readString(request.body, "query"),
      routeName: readString(request.body, "routeName"),
      perms: readString(request.body, "perms"),
      icon: readString(request.body, "icon"),
      isFrame: readString(request.body, "isFrame") === "0" ? "0" : "1",
      isCache: readString(request.body, "isCache") === "1" ? "1" : "0",
      menuType,
      visible: readString(request.body, "visible") === "1" ? "1" : "0",
      status: readString(request.body, "status") === "1" ? "1" : "0",
      createTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/system/menu") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const menuId = readString(request.body, "menuId");
    const row = menus.find((item) => item.menuId === menuId);
    if (!row) return fail("数据不存在");
    const menuName = readString(request.body, "menuName");
    const parentId = readString(request.body, "parentId") || "0";
    const menuType = readString(request.body, "menuType");
    const pathValue = readString(request.body, "path");
    const orderNum = readNumber(request.body, "orderNum");
    if (!menuName) return fail("菜单名称不能为空");
    if (menuType !== "M" && menuType !== "C" && menuType !== "F") {
      return fail("菜单类型不能为空");
    }
    if (menuType !== "F" && !pathValue) return fail("路由地址不能为空");
    if (orderNum === undefined) return fail("菜单顺序不能为空");
    if (
      wouldCycle(
        menus.map((item) => ({ id: item.menuId, parentId: item.parentId })),
        menuId,
        parentId,
      )
    ) {
      return fail("上级菜单不能选择自己或子菜单");
    }
    row.menuName = menuName;
    row.parentId = parentId;
    row.menuType = menuType;
    row.path = pathValue;
    row.orderNum = orderNum;
    row.component = readString(request.body, "component");
    row.query = readString(request.body, "query");
    row.routeName = readString(request.body, "routeName");
    row.perms = readString(request.body, "perms");
    row.icon = readString(request.body, "icon");
    row.isFrame = readString(request.body, "isFrame") === "0" ? "0" : "1";
    row.isCache = readString(request.body, "isCache") === "1" ? "1" : "0";
    row.visible = readString(request.body, "visible") === "1" ? "1" : "0";
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    return ok({ code: 200, msg: "操作成功" });
  }
  const rest = restAfter(path, "/system/menu");
  if (
    rest === null ||
    rest === "" ||
    rest === "list" ||
    rest === "treeselect" ||
    rest.startsWith("roleMenuTreeselect")
  ) {
    return null;
  }
  if (method === "GET") {
    const row = menus.find((item) => item.menuId === decodeURIComponent(rest));
    return row ? ok({ code: 200, msg: "操作成功", data: row }) : fail("数据不存在");
  }
  if (method === "DELETE") {
    const menuId = decodeURIComponent(rest);
    const row = menus.find((item) => item.menuId === menuId);
    if (!row) return fail("数据不存在");
    if (menus.some((item) => item.parentId === menuId)) {
      return fail("存在子菜单,不允许删除");
    }
    menus = menus.filter((item) => item.menuId !== menuId);
    return ok({ code: 200, msg: "操作成功" });
  }
  return null;
}

export function dispatchOrgMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  return dispatchDept(method, path, request) ?? dispatchMenu(method, path, request);
}