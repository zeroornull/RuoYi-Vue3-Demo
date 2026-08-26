import { beforeEach, describe, expect, test } from "bun:test";
import { protectedRoutes } from "../../src/router/protected-routes";
import {
  assignedRoleIds,
  emptyUserForm,
  emptyUserQuery,
  filterEnabledDeptTree,
  isProtectedUser,
  joinOptionNames,
  passwordPromptError,
  userToForm,
} from "../../src/views/system/user/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function user(method: string, path: string, body?: unknown, query?: Record<string, string>) {
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

describe("user Query/Create/Update/Row models", () => {
  test("keeps list filters, upsert and admin protection distinct", () => {
    expect(emptyUserQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      userName: "",
      phonenumber: "",
    });
    expect("userId" in emptyUserForm()).toBe(false);
    expect(isProtectedUser("1")).toBe(true);
    expect(isProtectedUser("2")).toBe(false);
    expect(passwordPromptError("123")).not.toBe(true);
    expect(passwordPromptError("admin123")).toBe(true);
    expect(
      userToForm(
        {
          userId: "2",
          userName: "ry",
          nickName: "若依",
          status: "0",
          deptId: "105",
          remark: null,
        },
        ["2"],
        ["2"],
      ),
    ).toEqual({
      userId: "2",
      userName: "ry",
      nickName: "若依",
      password: "",
      phonenumber: "",
      email: "",
      sex: "0",
      status: "0",
      remark: "",
      postIds: ["2"],
      roleIds: ["2"],
      deptId: "105",
    });
    expect(
      joinOptionNames(
        [{ postId: "1", postName: "董事长" }],
        ["1"],
        (item) => item.postId,
        (item) => item.postName,
        "无岗位",
      ),
    ).toBe("董事长");
    expect(
      filterEnabledDeptTree([
        {
          id: "100",
          label: "若依",
          children: [{ id: "106", label: "停用", disabled: true }],
        },
      ]),
    ).toEqual([{ id: "100", label: "若依" }]);
  });
});

describe("user mock CRUD", () => {
  test("paginates, filters by department descendants and protects admin", () => {
    const page1 = user("GET", "/system/user/list", undefined, {
      pageNum: "1",
      pageSize: "10",
    });
    expect(page1.body.total).toBe(12);
    expect((page1.body.rows as unknown[]).length).toBe(10);
    const under105 = user("GET", "/system/user/list", undefined, { deptId: "105" });
    const names = (under105.body.rows as Array<{ userName: string }>).map((row) => row.userName);
    expect(names).toContain("ry");
    expect(names).not.toContain("admin");
    expect(user("DELETE", "/system/user/1").body.msg).toBe("不允许操作超级管理员用户");
    expect(user("PUT", "/system/user/changeStatus", { userId: "1", status: "1" }).body.msg).toBe(
      "不允许操作超级管理员用户",
    );
  });

  test("creates, updates, resets password and assigns roles", () => {
    expect(Array.isArray(user("GET", "/system/user").body.roles)).toBe(true);
    expect(
      user("POST", "/system/user", {
        userName: "qa",
        nickName: "测试员",
        password: "admin123",
        deptId: "105",
        roleIds: ["2"],
        postIds: ["3"],
      }).body.code,
    ).toBe(200);
    expect(
      user("POST", "/system/user", {
        userName: "admin",
        nickName: "重复",
        password: "admin123",
      }).body.msg,
    ).toBe("登录账号已存在");
    const detail = user("GET", "/system/user/2");
    expect((detail.body.data as { userName: string }).userName).toBe("ry");
    expect(detail.body.postIds).toEqual(["2"]);
    expect(
      user("PUT", "/system/user", {
        userId: "2",
        nickName: "若依编辑",
        deptId: "105",
        roleIds: ["2"],
        postIds: ["2"],
      }).body.code,
    ).toBe(200);
    expect(user("PUT", "/system/user/resetPwd", { userId: "2", password: "newpass1" }).body.code).toBe(200);
    const auth = user("GET", "/system/user/authRole/2");
    expect(assignedRoleIds(auth.body.roles as Array<{ roleId: string; flag?: boolean }>)).toEqual(["2"]);
    expect(
      user("PUT", "/system/user/authRole", undefined, {
        userId: "2",
        roleIds: "2,1",
      }).body.code,
    ).toBe(200);
    const tree = user("GET", "/system/user/deptTree");
    expect(Array.isArray(tree.body.data)).toBe(true);
    expect(user("POST", "/system/user/export").contentType).toContain("spreadsheetml");
  });

  test("auth-role hidden route keeps activeMenu on the user list", () => {
    const authRoute = protectedRoutes.find((route) => route.path === "/system/user-auth")?.children?.[0];
    expect(authRoute?.name).toBe("AuthRole");
    expect(authRoute?.meta?.activeMenu).toBe("/system/user");
    expect(authRoute?.path).toBe("role/:userId(\\d+)");
  });
});
