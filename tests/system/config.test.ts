import { beforeEach, describe, expect, test } from "bun:test";
import { configToForm, emptyConfigForm, emptyConfigQuery } from "../../src/views/system/config/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";
import { parseMockQuery } from "../../vite/mock/query.ts";

function config(method: string, path: string, body?: unknown, query?: Record<string, string>) {
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

describe("config Query/Create/Update/Row models", () => {
  test("keeps list filters separate from upsert and copies a row into a form", () => {
    expect(emptyConfigQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      configName: "",
      configKey: "",
    });
    expect(emptyConfigForm()).toEqual({
      configName: "",
      configKey: "",
      configValue: "",
      configType: "Y",
      remark: "",
    });
    expect("configId" in emptyConfigForm()).toBe(false);
    expect(
      configToForm({
        configId: "9",
        configName: "皮肤",
        configKey: "sys.index.skinName",
        configValue: "skin-blue",
        configType: "Y",
        remark: null,
      }),
    ).toEqual({
      configId: "9",
      configName: "皮肤",
      configKey: "sys.index.skinName",
      configValue: "skin-blue",
      configType: "Y",
      remark: "",
    });
  });
});

describe("config mock CRUD", () => {
  test("rejects anonymous access and paginates the seeded list", () => {
    expect(dispatchMockRequest({ method: "GET", path: "/system/config/list" }).body.code).toBe(401);
    const page1 = config("GET", "/system/config/list", undefined, {
      pageNum: "1",
      pageSize: "10",
    });
    expect(page1.body.code).toBe(200);
    expect(page1.body.total).toBe(12);
    expect((page1.body.rows as unknown[]).length).toBe(10);
    const page2 = config("GET", "/system/config/list", undefined, {
      pageNum: "2",
      pageSize: "10",
    });
    expect((page2.body.rows as unknown[]).length).toBe(2);
  });

  test("filters by name, built-in flag and date range from the query string", () => {
    const query = parseMockQuery(
      "/dev-api/system/config/list?configName=%E7%9A%AE%E8%82%A4&configType=Y&params%5BbeginTime%5D=2026-01-01&params%5BendTime%5D=2026-01-31",
    );
    expect(query.configName).toBe("皮肤");
    expect(query["params[beginTime]"]).toBe("2026-01-01");
    const result = config("GET", "/system/config/list", undefined, query);
    const rows = result.body.rows as Array<{ configKey: string }>;
    expect(rows.map((row) => row.configKey)).toEqual(["sys.index.skinName"]);
  });

  test("validates create, rejects duplicate keys, then updates and deletes", () => {
    expect(config("POST", "/system/config", { configName: "", configKey: "a", configValue: "1" }).body.msg).toBe(
      "参数名称不能为空",
    );
    expect(
      config("POST", "/system/config", {
        configName: "重复",
        configKey: "sys.user.initPassword",
        configValue: "x",
      }).body.msg,
    ).toBe("参数键名已存在");
    expect(
      config("POST", "/system/config", {
        configName: "站点名",
        configKey: "sys.index.name",
        configValue: "RuoYi",
        configType: "N",
      }).body.code,
    ).toBe(200);
    const created = config("GET", "/system/config/list", undefined, {
      configKey: "sys.index.name",
    });
    const row = (created.body.rows as Array<{ configId: string; configType: string }>)[0];
    expect(row?.configType).toBe("N");
    expect(
      config("PUT", "/system/config", {
        configId: row?.configId,
        configName: "站点名称",
        configKey: "sys.index.name",
        configValue: "RuoYi Vue3",
        configType: "N",
      }).body.code,
    ).toBe(200);
    expect((config("GET", `/system/config/${row?.configId}`).body.data as { configValue: string }).configValue).toBe(
      "RuoYi Vue3",
    );
    expect(config("DELETE", "/system/config/12,11").body.code).toBe(200);
    expect(config("GET", "/system/config/list").body.total).toBe(11);
    expect(config("DELETE", "/system/config").body.msg).toBe("请选择要删除的数据");
    expect(config("DELETE", "/system/config/refreshCache").body.code).toBe(200);
    expect(config("GET", "/system/config/configKey/sys.user.initPassword").body.data).toBe("123456");
  });

  test("export returns a spreadsheet blob instead of JSON", () => {
    const exported = config("POST", "/system/config/export", "configName=&pageNum=1");
    expect(exported.contentType).toContain("spreadsheetml");
    expect(exported.raw).toBe("mock-xlsx");
  });
});
