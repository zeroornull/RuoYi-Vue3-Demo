import { beforeEach, describe, expect, test } from "bun:test";
import {
  emptyNoticeForm,
  emptyNoticeQuery,
  emptyNoticeReadQuery,
  noticeToForm,
} from "../../src/views/system/notice/model";
import {
  dispatchMockRequest,
  MOCK_TOKEN,
  resetMockAuthState,
} from "../../vite/mock/auth.ts";

function notice(
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

describe("notice Query/Create/Update/Row models", () => {
  test("separates list query, upsert and read-user query", () => {
    expect(emptyNoticeQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      noticeTitle: "",
      createBy: "",
    });
    expect("noticeId" in emptyNoticeForm()).toBe(false);
    expect(emptyNoticeReadQuery("1").noticeId).toBe("1");
    expect(
      noticeToForm({
        noticeId: "1",
        noticeTitle: "标题",
        noticeType: "1",
        noticeContent: "<p>x</p>",
        status: "0",
        remark: null,
      }).noticeContent,
    ).toBe("<p>x</p>");
  });
});

describe("notice mock CRUD", () => {
  test("filters by type, creates, updates status and lists read users", () => {
    const typed = notice("GET", "/system/notice/list", undefined, { noticeType: "1" });
    expect((typed.body.rows as Array<{ noticeTitle: string }>)[0]?.noticeTitle).toBe(
      "维护通知",
    );
    const top = notice("GET", "/system/notice/listTop");
    expect(top.body.unreadCount).toBe(1);
    expect(
      notice("POST", "/system/notice", { noticeTitle: "新通知", noticeType: "1" }).body
        .code,
    ).toBe(200);
    expect(
      notice("POST", "/system/notice", { noticeTitle: "", noticeType: "1" }).body.msg,
    ).toBe("公告标题不能为空");
    expect(
      notice("PUT", "/system/notice", {
        noticeId: "3",
        noticeTitle: "关闭的公告",
        noticeType: "2",
        noticeContent: "<p>仍关闭</p>",
        status: "1",
      }).body.code,
    ).toBe(200);
    const readers = notice("GET", "/system/notice/readUsers/list", undefined, {
      noticeId: "1",
      searchValue: "admin",
    });
    expect(readers.body.total).toBe(1);
    expect(
      (readers.body.rows as Array<{ userName: string }>)[0]?.userName,
    ).toBe("admin");
    expect(notice("DELETE", "/system/notice/2").body.code).toBe(200);
    expect(notice("GET", "/system/notice/list").body.total).toBe(3);
  });
});
