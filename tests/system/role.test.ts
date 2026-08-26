import { beforeEach, describe, expect, test } from "bun:test";
import { protectedRoutes } from "../../src/router/protected-routes";
import {
  collectCheckedTreeIds,
  DATA_SCOPE_OPTIONS,
  emptyRoleForm,
  emptyRoleQuery,
  isProtectedRole,
  roleToForm,
} from "../../src/views/system/role/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function role(method: string, path: string, body?: unknown, query?: Record<string, string>) {
  return dispatchMockRequest({
    method,
    path,
    body,
    token: MOCK_TOKEN,
    ...(query ? { query } : {}),
  });
}

beforeEach(() => {
  resetMockAuthState();
});

describe("role Query/Create/Update/Row models", () => {
  test("keeps list filters, upsert and admin protection distinct", () => {
    expect(emptyRoleQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      roleName: "",
      roleKey: "",
    });
    expect("roleId" in emptyRoleForm()).toBe(false);
    expect(isProtectedRole("1")).toBe(true);
    expect(isProtectedRole("2")).toBe(false);
    expect(DATA_SCOPE_OPTIONS.map((item) => item.value)).toEqual(["1", "2", "3", "4", "5"]);
    expect(
      roleToForm({
        roleId: "2",
        roleName: "普通角色",
        roleKey: "common",
        roleSort: 2,
        dataScope: "2",
        status: "0",
        remark: null,
      }).menuCheckStrictly,
    ).toBe(true);
    expect(
      collectCheckedTreeIds({
        getCheckedKeys: () => ["100"],
        getHalfCheckedKeys: () => ["1"],
      }),
    ).toEqual(["1", "100"]);
  });
});

describe("role mock CRUD and authorization", () => {
  test("lists roles, protects admin and saves menu/dept ids", () => {
    const listed = role("GET", "/system/role/list");
    expect(listed.body.total).toBe(4);
    expect(role("DELETE", "/system/role/1").body.msg).toBe("不允许操作超级管理员角色");
    const menuTree = role("GET", "/system/menu/roleMenuTreeselect/2");
    expect(menuTree.body.checkedKeys).toEqual(["1", "100"]);
    expect(Array.isArray(menuTree.body.menus)).toBe(true);
    expect(
      role("PUT", "/system/role", {
        roleId: "2",
        roleName: "普通角色",
        roleKey: "common",
        roleSort: 2,
        menuIds: ["1", "100", "1001"],
        menuCheckStrictly: true,
      }).body.code,
    ).toBe(200);
    expect((role("GET", "/system/role/2").body.data as { menuIds: string[]; deptIds: string[] }).menuIds).toEqual([
      "1",
      "100",
      "1001",
    ]);
    expect((role("GET", "/system/role/2").body.data as { deptIds: string[] }).deptIds).toEqual(["103"]);
    const deptTree = role("GET", "/system/role/deptTree/2");
    expect(deptTree.body.checkedKeys).toEqual(["103"]);
    expect(
      role("PUT", "/system/role/dataScope", {
        roleId: "2",
        roleName: "普通角色",
        roleKey: "common",
        roleSort: 2,
        dataScope: "2",
        deptIds: ["101", "103"],
      }).body.code,
    ).toBe(200);
    expect((role("GET", "/system/role/2").body.data as { menuIds: string[] }).menuIds).toEqual(["1", "100", "1001"]);
    expect(
      role("POST", "/system/role", {
        roleName: "测试角色",
        roleKey: "tester",
        roleSort: 9,
        menuIds: ["1"],
      }).body.code,
    ).toBe(200);
    expect(role("GET", "/system/role/list").body.total).toBe(5);
    expect(role("DELETE", "/system/role/5").body.code).toBe(200);
    expect(role("GET", "/system/role/list").body.total).toBe(4);
  });

  test("allocates and cancels users for a role", () => {
    const allocated = role("GET", "/system/role/authUser/allocatedList", undefined, {
      roleId: "2",
    });
    expect((allocated.body.total as number) > 0).toBe(true);
    const unallocated = role("GET", "/system/role/authUser/unallocatedList", undefined, { roleId: "2" });
    const names = (unallocated.body.rows as Array<{ userName: string }>).map((row) => row.userName);
    expect(names).toContain("admin");
    expect(
      role("PUT", "/system/role/authUser/selectAll", undefined, {
        roleId: "4",
        userIds: "2",
      }).body.code,
    ).toBe(200);
    expect(
      (
        role("GET", "/system/role/authUser/allocatedList", undefined, { roleId: "4" }).body.rows as Array<{
          userName: string;
        }>
      )[0]?.userName,
    ).toBe("ry");
    expect(
      role("PUT", "/system/role/authUser/cancel", {
        roleId: "4",
        userId: "2",
      }).body.code,
    ).toBe(200);
    expect(role("GET", "/system/role/authUser/allocatedList", undefined, { roleId: "4" }).body.total).toBe(0);
  });

  test("auth-user hidden route keeps activeMenu on the role list", () => {
    const authRoute = protectedRoutes.find((route) => route.path === "/system/role-auth")?.children?.[0];
    expect(authRoute?.name).toBe("AuthUser");
    expect(authRoute?.meta?.activeMenu).toBe("/system/role");
    expect(authRoute?.path).toBe("user/:roleId(\\d+)");
  });
});
