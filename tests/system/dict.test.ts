import { beforeEach, describe, expect, test } from "bun:test";
import { protectedRoutes } from "../../src/router/protected-routes";
import {
  dictDataToForm,
  dictTypeToForm,
  emptyDictDataForm,
  emptyDictDataQuery,
  emptyDictTypeForm,
  emptyDictTypeQuery,
} from "../../src/views/system/dict/model";
import {
  dispatchMockRequest,
  MOCK_TOKEN,
  resetMockAuthState,
} from "../../vite/mock/auth.ts";

function dict(
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

describe("dict Query/Create/Update/Row models", () => {
  test("keeps type/data queries and forms distinct", () => {
    expect(emptyDictTypeQuery().pageNum).toBe(1);
    expect("dictId" in emptyDictTypeForm()).toBe(false);
    expect(emptyDictDataQuery("sys_yes_no").dictType).toBe("sys_yes_no");
    expect(emptyDictDataForm("sys_yes_no").dictType).toBe("sys_yes_no");
    expect(
      dictTypeToForm({
        dictId: "1",
        dictName: "系统是否",
        dictType: "sys_yes_no",
        status: "0",
        remark: null,
      }).dictId,
    ).toBe("1");
    expect(
      dictDataToForm({
        dictCode: "1",
        dictSort: 1,
        dictLabel: "是",
        dictValue: "Y",
        dictType: "sys_yes_no",
        isDefault: "Y",
        status: "0",
        listClass: "success",
        cssClass: null,
      }).listClass,
    ).toBe("success");
  });
});

describe("dict mock CRUD", () => {
  test("lists types, option-selects and returns dict values by type", () => {
    const listed = dict("GET", "/system/dict/type/list", undefined, { status: "1" });
    expect((listed.body.rows as Array<{ dictType: string }>)[0]?.dictType).toBe(
      "sys_unused",
    );
    const options = dict("GET", "/system/dict/type/optionselect");
    expect((options.body.data as unknown[]).length).toBe(5);
    const values = dict("GET", "/system/dict/data/type/sys_yes_no");
    expect(
      (values.body.data as Array<{ dictValue: string }>).map((row) => row.dictValue),
    ).toEqual(["Y", "N"]);
  });

  test("creates type/data, navigates by dictId and batch-deletes", () => {
    expect(
      dict("POST", "/system/dict/type", {
        dictName: "任务状态",
        dictType: "sys_job_status",
        status: "0",
      }).body.code,
    ).toBe(200);
    expect(
      dict("POST", "/system/dict/type", {
        dictName: "重复",
        dictType: "sys_yes_no",
      }).body.msg,
    ).toBe("字典类型已存在");
    const created = dict("GET", "/system/dict/type/list", undefined, {
      dictType: "sys_job_status",
    });
    const typeRow = (created.body.rows as Array<{ dictId: string }>)[0];
    expect(
      (dict("GET", `/system/dict/type/${typeRow?.dictId}`).body.data as { dictType: string })
        .dictType,
    ).toBe("sys_job_status");
    expect(
      dict("POST", "/system/dict/data", {
        dictType: "sys_job_status",
        dictLabel: "运行",
        dictValue: "0",
        dictSort: 1,
      }).body.code,
    ).toBe(200);
    const dataList = dict("GET", "/system/dict/data/list", undefined, {
      dictType: "sys_job_status",
    });
    expect(dataList.body.total).toBe(1);
    expect(dict("DELETE", "/system/dict/type/5").body.code).toBe(200);
    expect(
      dict("GET", "/system/dict/data/list", undefined, { dictType: "sys_unused" }).body
        .total,
    ).toBe(0);
    expect(dict("DELETE", "/system/dict/type/refreshCache").body.code).toBe(200);
  });

  test("dict-data hidden route keeps activeMenu on the type list", () => {
    const dataRoute = protectedRoutes
      .find((route) => route.path === "/system/dict-data")
      ?.children?.[0];
    expect(dataRoute?.name).toBe("Data");
    expect(dataRoute?.meta?.activeMenu).toBe("/system/dict");
    expect(dataRoute?.path).toBe("index/:dictId(\\d+)");
  });
});
