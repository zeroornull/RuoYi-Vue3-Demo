import { beforeEach, describe, expect, test } from "bun:test";
import {
  deptToForm,
  emptyDeptForm,
  emptyDeptQuery,
  isRootDept,
  toDeptTree,
} from "../../src/views/system/dept/model";
import {
  dispatchMockRequest,
  MOCK_TOKEN,
  resetMockAuthState,
} from "../../vite/mock/auth.ts";

function dept(
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

describe("dept Query/Create/Update/Row models", () => {
  test("keeps list filters separate from upsert and marks the root", () => {
    expect(emptyDeptQuery()).toEqual({ deptName: "" });
    expect("deptId" in emptyDeptForm()).toBe(false);
    expect(emptyDeptForm("101").parentId).toBe("101");
    expect(
      isRootDept({
        parentId: "0",
      }),
    ).toBe(true);
    expect(
      deptToForm({
        deptId: "103",
        parentId: "101",
        deptName: "研发部门",
        orderNum: 1,
        status: "0",
        leader: null,
        phone: null,
        email: null,
      }).leader,
    ).toBe("");
    const tree = toDeptTree([
      {
        deptId: "100",
        parentId: "0",
        deptName: "若依科技",
        orderNum: 0,
        status: "0",
      },
      {
        deptId: "101",
        parentId: "100",
        deptName: "深圳总公司",
        orderNum: 1,
        status: "0",
      },
    ]);
    expect(tree[0]?.children[0]?.deptName).toBe("深圳总公司");
  });
});

describe("dept mock tree CRUD", () => {
  test("returns a flat list that still encodes parent/child ids as strings", () => {
    const listed = dept("GET", "/system/dept/list");
    const rows = listed.body.data as Array<{ deptId: string; parentId: string }>;
    expect(rows.some((row) => row.deptId === "100" && row.parentId === "0")).toBe(
      true,
    );
    expect(rows.some((row) => row.deptId === "103" && row.parentId === "101")).toBe(
      true,
    );
    const excluded = dept("GET", "/system/dept/list/exclude/101");
    const ids = (excluded.body.data as Array<{ deptId: string }>).map((row) => row.deptId);
    expect(ids).not.toContain("101");
    expect(ids).not.toContain("103");
    expect(ids).toContain("100");
    expect(ids).toContain("102");
  });

  test("rejects cycles, root delete and parents that still have children", () => {
    expect(
      dept("PUT", "/system/dept", {
        deptId: "100",
        parentId: "103",
        deptName: "若依科技",
        orderNum: 0,
      }).body.msg,
    ).toBe("上级部门不能选择自己或子部门");
    expect(dept("DELETE", "/system/dept/100").body.msg).toBe("顶级部门不能删除");
    expect(dept("DELETE", "/system/dept/101").body.msg).toBe(
      "存在下级部门,不允许删除",
    );
    expect(
      dept("POST", "/system/dept", {
        parentId: "103",
        deptName: "前端组",
        orderNum: 4,
      }).body.code,
    ).toBe(200);
    expect(dept("PUT", "/system/dept/updateSort", { ids: "103", orderNums: "9" }).body.code).toBe(
      200,
    );
    expect(
      (dept("GET", "/system/dept/103").body.data as { orderNum: number }).orderNum,
    ).toBe(9);
    expect(
      dept("GET", "/system/dept/list", undefined, { status: "1" }).body.data as unknown[],
    ).toHaveLength(1);
  });
});
