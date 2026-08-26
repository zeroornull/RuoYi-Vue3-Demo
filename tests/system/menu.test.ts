import { beforeEach, describe, expect, test } from "bun:test";
import {
  emptyMenuForm,
  emptyMenuQuery,
  menuToForm,
  menuTypeLabel,
  toMenuParentOptions,
  toMenuTree,
  withMenuRoot,
} from "../../src/views/system/menu/model";
import {
  dispatchMockRequest,
  MOCK_TOKEN,
  resetMockAuthState,
} from "../../vite/mock/auth.ts";
import { excludeSelfAndDescendants } from "../../src/utils/tree-edit";

function menu(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
) {
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

describe("menu Query/Create/Update/Row models", () => {
  test("keeps directory/menu/button forms distinct from the list query", () => {
    expect(emptyMenuQuery()).toEqual({ menuName: "" });
    expect("menuId" in emptyMenuForm()).toBe(false);
    expect(emptyMenuForm("1").parentId).toBe("1");
    expect(menuTypeLabel({ menuType: "M", isFrame: "1" })).toBe("目录");
    expect(menuTypeLabel({ menuType: "C", isFrame: "0" })).toBe("外链");
    expect(
      menuToForm({
        menuId: "100",
        parentId: "1",
        menuName: "用户管理",
        orderNum: 1,
        path: "user",
        component: "system/user/index",
        isFrame: "1",
        isCache: "0",
        menuType: "C",
        visible: "0",
        status: "0",
        icon: null,
      }).icon,
    ).toBe("");
    const options = withMenuRoot(
      toMenuParentOptions(
        toMenuTree([
          {
            menuId: "1",
            parentId: "0",
            menuName: "系统管理",
            orderNum: 1,
            path: "system",
            isFrame: "1",
            isCache: "0",
            menuType: "M",
            visible: "0",
            status: "0",
          },
          {
            menuId: "100",
            parentId: "1",
            menuName: "用户管理",
            orderNum: 1,
            path: "user",
            isFrame: "1",
            isCache: "0",
            menuType: "C",
            visible: "0",
            status: "0",
          },
        ]),
      ),
    );
    expect(options[0]?.menuName).toBe("主类目");
    expect(
      excludeSelfAndDescendants(
        options[0]?.children ?? [],
        "1",
        (row) => row.menuId,
        (row) => row.children,
      ),
    ).toEqual([]);
  });
});

describe("menu mock tree CRUD", () => {
  test("lists a flat menu, exposes treeselect and blocks deleting parents", () => {
    const listed = menu("GET", "/system/menu/list");
    const rows = listed.body.data as Array<{ menuId: string; parentId: string }>;
    expect(rows.some((row) => row.menuId === "100" && row.parentId === "1")).toBe(
      true,
    );
    const tree = menu("GET", "/system/menu/treeselect");
    expect((tree.body.data as Array<{ id: string }>)[0]?.id).toBe("1");
    expect(menu("DELETE", "/system/menu/1").body.msg).toBe("存在子菜单,不允许删除");
    expect(
      menu("PUT", "/system/menu", {
        menuId: "1",
        parentId: "100",
        menuName: "系统管理",
        menuType: "M",
        path: "system",
        orderNum: 1,
      }).body.msg,
    ).toBe("上级菜单不能选择自己或子菜单");
    expect(
      menu("POST", "/system/menu", {
        parentId: "1",
        menuName: "岗位管理",
        menuType: "C",
        path: "post",
        component: "system/post/index",
        orderNum: 5,
      }).body.code,
    ).toBe(200);
    expect(menu("DELETE", "/system/menu/1001").body.code).toBe(200);
    expect(
      menu("PUT", "/system/menu/updateSort", { ids: "102", orderNums: "8" }).body.code,
    ).toBe(200);
  });
});
