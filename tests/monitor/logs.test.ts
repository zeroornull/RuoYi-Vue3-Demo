import { beforeEach, describe, expect, test } from "bun:test";
import { tableSortToQuery } from "../../src/views/monitor/log-query";
import { emptyOnlineQuery, paginateOnline } from "../../src/views/monitor/online/model";
import { emptyLoginInfoQuery } from "../../src/views/monitor/logininfor/model";
import {
  emptyOperationLogQuery,
  formatJsonBlock,
  isFailedOperation,
  operationTypeLabel,
} from "../../src/views/monitor/operlog/model";
import { isUserLocked } from "../../vite/mock/monitor.ts";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function monitor(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
  token: string | undefined = MOCK_TOKEN,
) {
  return dispatchMockRequest({
    method,
    path,
    body,
    token,
    ...(query ? { query } : {}),
  });
}

beforeEach(() => {
  resetMockAuthState();
});

describe("monitor Query/Row models", () => {
  test("keeps online, login-info and operlog queries distinct from row details", () => {
    expect(emptyOnlineQuery()).toEqual({ ipaddr: "", userName: "" });
    expect(emptyLoginInfoQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      ipaddr: "",
      userName: "",
      orderByColumn: "loginTime",
      isAsc: "desc",
    });
    expect("operId" in emptyOperationLogQuery()).toBe(false);
    expect(tableSortToQuery({ prop: "costTime", order: "ascending" })).toEqual({
      orderByColumn: "costTime",
      isAsc: "asc",
    });
    expect(tableSortToQuery({ prop: "operTime", order: null })).toEqual({});
    expect(
      paginateOnline(
        [
          { tokenId: "a", userName: "a", ipaddr: "1", loginTime: 1 },
          { tokenId: "b", userName: "b", ipaddr: "2", loginTime: 2 },
        ],
        2,
        1,
      ).map((row) => row.tokenId),
    ).toEqual(["b"]);
    expect(formatJsonBlock('{"code":200}')).toBe('{\n  "code": 200\n}');
    expect(formatJsonBlock("not-json")).toBe("not-json");
    expect(formatJsonBlock("")).toBe("（无数据）");
    expect(
      isFailedOperation({
        operId: "3",
        title: "参数设置",
        businessType: 3,
        status: "1",
        operTime: "2026-08-24 11:00:00",
      }),
    ).toBe(true);
    expect(operationTypeLabel([{ label: "删除", value: "3" }], 3)).toBe("删除");
    expect(operationTypeLabel({ value: [] }, 3)).toBe("删除");
  });
});

describe("monitor mock online and logs", () => {
  test("rejects anonymous monitor access and force-logouts a session", () => {
    expect(monitor("GET", "/monitor/online/list", undefined, undefined, "").body.code).toBe(401);
    const listed = monitor("GET", "/monitor/online/list");
    expect(listed.body.total).toBe(3);
    expect(monitor("GET", "/monitor/online/list", undefined, { userName: "ry" }).body.total).toBe(1);
    expect(monitor("DELETE", "/monitor/online/token-ry").body.code).toBe(200);
    expect(monitor("GET", "/monitor/online/list").body.total).toBe(2);
    expect(monitor("DELETE", "/monitor/online/missing").body.msg).toBe("数据不存在");
  });

  test("filters, sorts, deletes, unlocks and cleans login logs", () => {
    const failed = monitor("GET", "/monitor/logininfor/list", undefined, { status: "1" });
    expect((failed.body.total as number) > 0).toBe(true);
    expect((failed.body.rows as Array<{ status: string }>).every((row) => row.status === "1")).toBe(true);
    const sorted = monitor("GET", "/monitor/logininfor/list", undefined, {
      orderByColumn: "loginTime",
      isAsc: "asc",
      pageSize: "20",
    });
    const times = (sorted.body.rows as Array<{ loginTime: string }>).map((row) => row.loginTime);
    expect(times[0] < (times[times.length - 1] ?? "")).toBe(true);
    expect(isUserLocked("ry")).toBe(true);
    expect(monitor("GET", "/monitor/logininfor/unlock/ry").body.code).toBe(200);
    expect(isUserLocked("ry")).toBe(false);
    expect(monitor("DELETE", "/monitor/logininfor/1,2").body.code).toBe(200);
    const afterDelete = monitor("GET", "/monitor/logininfor/list", undefined, { pageSize: "20" });
    expect(afterDelete.body.total).toBe(10);
    expect(monitor("POST", "/monitor/logininfor/export").contentType).toContain("spreadsheet");
    expect(monitor("DELETE", "/monitor/logininfor/clean").body.code).toBe(200);
    expect(monitor("GET", "/monitor/logininfor/list").body.total).toBe(0);
  });

  test("pages operation logs, exposes failure detail and cleans the table", () => {
    const added = monitor("GET", "/monitor/operlog/list", undefined, { businessType: "1" });
    expect((added.body.rows as Array<{ businessType: number }>).every((row) => row.businessType === 1)).toBe(true);
    const failed = monitor("GET", "/monitor/operlog/list", undefined, { status: "1" });
    const row = (failed.body.rows as Array<{ errorMsg: string; jsonResult: string }>)[0];
    expect(row?.errorMsg).toBe("不允许删除内置参数");
    expect(row?.jsonResult).toContain("操作失败");
    expect(monitor("DELETE", "/monitor/operlog/3").body.code).toBe(200);
    expect(monitor("GET", "/monitor/operlog/list", undefined, { status: "1" }).body.total).toBe(0);
    expect(monitor("POST", "/monitor/operlog/export").raw).toBe("mock-xlsx");
    expect(monitor("DELETE", "/monitor/operlog/clean").body.code).toBe(200);
    expect(monitor("GET", "/monitor/operlog/list").body.total).toBe(0);
  });
});
