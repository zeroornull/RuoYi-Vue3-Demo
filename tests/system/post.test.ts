import { beforeEach, describe, expect, test } from "bun:test";
import { emptyPostForm, emptyPostQuery, postToForm } from "../../src/views/system/post/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function post(method: string, path: string, body?: unknown, query?: Record<string, string>) {
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

describe("post Query/Create/Update/Row models", () => {
  test("does not mix list filters with upsert ids", () => {
    expect(emptyPostQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      postCode: "",
      postName: "",
    });
    expect("postId" in emptyPostForm()).toBe(false);
    expect(
      postToForm({
        postId: "1",
        postCode: "ceo",
        postName: "董事长",
        postSort: 1,
        status: "0",
        remark: null,
      }).postId,
    ).toBe("1");
  });
});

describe("post mock CRUD", () => {
  test("filters by status and supports enable/disable updates", () => {
    const disabled = post("GET", "/system/post/list", undefined, { status: "1" });
    expect((disabled.body.rows as Array<{ postCode: string }>).map((row) => row.postCode)).toEqual(["user"]);
    expect(
      post("PUT", "/system/post", {
        postId: "4",
        postName: "普通员工",
        postCode: "user",
        postSort: 4,
        status: "0",
      }).body.code,
    ).toBe(200);
    expect((post("GET", "/system/post/4").body.data as { status: string }).status).toBe("0");
  });

  test("creates, rejects duplicates, batch-deletes and exports", () => {
    expect(post("POST", "/system/post", { postName: "开发", postCode: "dev" }).body.msg).toBe("岗位顺序不能为空");
    expect(
      post("POST", "/system/post", {
        postName: "开发",
        postCode: "dev",
        postSort: 5,
        status: "0",
      }).body.code,
    ).toBe(200);
    expect(
      post("POST", "/system/post", {
        postName: "重复",
        postCode: "ceo",
        postSort: 9,
      }).body.msg,
    ).toBe("岗位编码已存在");
    expect(post("DELETE", "/system/post/2,3").body.code).toBe(200);
    expect(post("GET", "/system/post/list").body.total).toBe(3);
    expect(post("POST", "/system/post/export").contentType).toContain("spreadsheetml");
  });
});
