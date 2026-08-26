import { beforeEach, describe, expect, test } from "bun:test";
import { protectedRoutes } from "../../src/router/protected-routes";
import { resolveBackendComponent } from "../../src/router/component-resolver";
import { migratedViewLoaders } from "../../src/router/view-registry";
import {
  emptyBasicInfo,
  emptyGenQuery,
  formToUpdateRequest,
  genEditPath,
  htmlTypeLabel,
  parseCreateTableNames,
  previewTabLabel,
  reorderColumns,
  tableInfoToForm,
  tableNameToClassName,
  tableToBasicInfo,
  tableSortToQuery,
  toPreviewFiles,
  zipDownloadName,
} from "../../src/views/tool/gen/model";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function gen(method: string, path: string, body?: unknown, query?: Record<string, string>) {
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

describe("generator Query/BasicInfo/Row models", () => {
  test("keeps list filters separate from basic info and maps a row", () => {
    expect(emptyGenQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      tableName: "",
      tableComment: "",
      orderByColumn: "createTime",
      isAsc: "desc",
    });
    expect("tableId" in emptyBasicInfo()).toBe(false);
    expect(tableNameToClassName("sys_user")).toBe("SysUser");
    expect(parseCreateTableNames("CREATE TABLE sys_demo (id bigint); CREATE TABLE `sys_foo` (id int);")).toEqual([
      "sys_demo",
      "sys_foo",
    ]);
    expect(parseCreateTableNames("select 1")).toEqual([]);
    expect(tableSortToQuery({ prop: "updateTime", order: "ascending" })).toEqual({
      orderByColumn: "updateTime",
      isAsc: "asc",
    });
    expect(genEditPath("9")).toBe("/tool/gen-edit/index/9");
    expect(
      tableToBasicInfo({
        tableId: "1",
        tableName: "sys_user",
        tableComment: "用户表",
        className: "SysUser",
        tplCategory: "crud",
        tplWebType: "element-plus",
        packageName: "com.ruoyi.system",
        moduleName: "system",
        businessName: "user",
        functionName: "用户",
        functionAuthor: "ruoyi",
        genType: "0",
        remark: null,
      }),
    ).toEqual({
      tableName: "sys_user",
      tableComment: "用户表",
      className: "SysUser",
      functionAuthor: "ruoyi",
      remark: "",
    });
  });
});

describe("generator mock list, import and create", () => {
  test("rejects anonymous generator access and lists seeded tables", () => {
    expect(dispatchMockRequest({ method: "GET", path: "/tool/gen/list" }).body.code).toBe(401);
    const listed = gen("GET", "/tool/gen/list", undefined, {
      pageNum: "1",
      pageSize: "10",
    });
    expect(listed.body.code).toBe(200);
    expect(listed.body.total).toBe(2);
    const rows = listed.body.rows as Array<{ tableName: string; className: string }>;
    expect(rows.map((row) => row.tableName)).toEqual(["sys_role", "sys_user"]);
    expect(rows[1]?.className).toBe("SysUser");
  });

  test("filters by name, comment and date range", () => {
    const named = gen("GET", "/tool/gen/list", undefined, { tableName: "user" });
    expect((named.body.rows as Array<{ tableName: string }>).map((row) => row.tableName)).toEqual(["sys_user"]);
    const ranged = gen("GET", "/tool/gen/list", undefined, {
      "params[beginTime]": "2026-02-01",
      "params[endTime]": "2026-02-28",
    });
    expect((ranged.body.rows as Array<{ tableName: string }>).map((row) => row.tableName)).toEqual(["sys_role"]);
  });

  test("imports a database table, then hides it from db list", () => {
    const db = gen("GET", "/tool/gen/db/list");
    const dbNames = (db.body.rows as Array<{ tableName: string }>).map((row) => row.tableName);
    expect(dbNames).toContain("sys_notice");
    expect(dbNames).not.toContain("sys_user");
    expect(gen("POST", "/tool/gen/importTable", undefined, { tables: "" }).body.msg).toBe("请选择要导入的表");
    const imported = gen("POST", "/tool/gen/importTable", undefined, {
      tables: "sys_notice",
      tplWebType: "element-plus",
    });
    expect(imported.body.msg).toBe("导入成功");
    const after = gen("GET", "/tool/gen/list");
    expect(after.body.total).toBe(3);
    const detail = gen("GET", "/tool/gen/3");
    const info = detail.body.data as {
      info: { tableName: string; className: string };
      rows: Array<{ columnName: string }>;
    };
    expect(info.info.tableName).toBe("sys_notice");
    expect(info.info.className).toBe("SysNotice");
    expect(info.rows.length).toBeGreaterThan(0);
    const dbAfter = gen("GET", "/tool/gen/db/list");
    expect((dbAfter.body.rows as Array<{ tableName: string }>).map((row) => row.tableName)).not.toContain("sys_notice");
  });

  test("creates tables from SQL, syncs, deletes and keeps gen-edit activeMenu", () => {
    expect(gen("POST", "/tool/gen/createTable", undefined, { sql: "select 1" }).body.msg).toBe("请输入建表语句");
    const created = gen("POST", "/tool/gen/createTable", undefined, {
      sql: "CREATE TABLE sys_demo (id bigint);",
      tplWebType: "element-plus",
    });
    expect(created.body.msg).toBe("创建表结构成功");
    const listed = gen("GET", "/tool/gen/list", undefined, { tableName: "sys_demo" });
    const row = (listed.body.rows as Array<{ tableId: string; tableName: string; updateTime: string }>)[0];
    expect(row?.tableName).toBe("sys_demo");
    const synced = gen("GET", `/tool/gen/synchDb/${row?.tableName ?? ""}`);
    expect(synced.body.msg).toBe("同步成功");
    expect(gen("DELETE", `/tool/gen/${row?.tableId ?? ""}`).body.msg).toBe("删除成功");
    expect(gen("GET", "/tool/gen/list", undefined, { tableName: "sys_demo" }).body.total).toBe(0);
    const editRoute = protectedRoutes.find((route) => route.path === "/tool/gen-edit")?.children?.[0];
    expect(editRoute?.name).toBe("GenEdit");
    expect(editRoute?.meta?.activeMenu).toBe("/tool/gen");
    expect(
      resolveBackendComponent({
        component: "tool/gen/index",
        hasChildren: false,
        link: undefined,
        hasRedirect: false,
      }).component,
    ).toBe(migratedViewLoaders["tool/gen/index"]);
  });
});

describe("generator edit, preview and download", () => {
  test("maps table info onto the edit form and update payload", () => {
    const form = tableInfoToForm(
      {
        tableId: "1",
        tableName: "sys_user",
        tableComment: "用户表",
        className: "SysUser",
        tplCategory: "crud",
        tplWebType: "element-plus",
        packageName: "com.ruoyi.system",
        moduleName: "system",
        businessName: "user",
        functionName: "用户",
        functionAuthor: "ruoyi",
        genType: "0",
        options: '{"genView":"1","formColNum":2}',
        remark: null,
      },
      [
        {
          columnId: "1",
          tableId: "1",
          columnName: "user_id",
          columnType: "bigint",
          javaType: "Long",
          javaField: "userId",
          isPk: "1",
          isIncrement: "1",
          isRequired: "1",
          isInsert: "1",
          isEdit: "0",
          isList: "1",
          isQuery: "0",
          queryType: "EQ",
          htmlType: "input",
          sort: 1,
        },
      ],
    );
    expect(form.genView).toBe(true);
    expect(form.formColNum).toBe(2);
    expect(htmlTypeLabel("datetime")).toBe("日期控件");
    const payload = formToUpdateRequest(form);
    expect(payload.params?.genView).toBe("1");
    expect(payload.columns?.[0]?.javaField).toBe("userId");
    const reordered = reorderColumns(form.columns, 0, 0);
    expect(reordered[0]?.sort).toBe(1);
    expect(previewTabLabel("vm/java/domain.java.vm")).toBe("domain.java");
    expect(zipDownloadName(["sys_user"])).toBe("sys_user.zip");
    expect(zipDownloadName(["sys_user", "sys_role"])).toBe("ruoyi.zip");
    expect(toPreviewFiles({ "vm/java/domain.java.vm": "class X {}" })[0]?.label).toBe("domain.java");
  });

  test("updates configuration, previews files and downloads a zip", () => {
    const detail = gen("GET", "/tool/gen/1");
    const data = detail.body.data as {
      info: { tableName: string };
      rows: Array<{ columnName: string }>;
    };
    expect(data.info.tableName).toBe("sys_user");
    expect(data.rows.some((row) => row.columnName === "user_name")).toBe(true);
    const updated = gen("PUT", "/tool/gen", {
      tableId: "1",
      tableName: "sys_user",
      tableComment: "用户信息",
      className: "SysUser",
      tplCategory: "crud",
      tplWebType: "element-plus-typescript",
      packageName: "com.ruoyi.system",
      moduleName: "system",
      businessName: "user",
      functionName: "用户",
      functionAuthor: "ruoyi",
      genType: "0",
      params: { genView: "1", parentMenuId: "1" },
      columns: [
        {
          columnId: "2",
          columnName: "user_name",
          columnComment: "账号",
          columnType: "varchar(30)",
          javaType: "String",
          javaField: "userName",
          isPk: "0",
          isInsert: "1",
          isEdit: "1",
          isList: "1",
          isQuery: "1",
          queryType: "LIKE",
          htmlType: "input",
          sort: 1,
        },
      ],
    });
    expect(updated.body.msg).toBe("修改成功");
    const after = gen("GET", "/tool/gen/1");
    const afterData = after.body.data as {
      info: { tableComment: string; tplWebType: string; options: string };
      rows: Array<{ queryType: string; javaField: string }>;
    };
    expect(afterData.info.tableComment).toBe("用户信息");
    expect(afterData.info.tplWebType).toBe("element-plus-typescript");
    expect(afterData.info.options).toContain("genView");
    expect(afterData.rows[0]?.queryType).toBe("LIKE");
    const preview = gen("GET", "/tool/gen/preview/1");
    const files = preview.body.data as Record<string, string>;
    expect(files["vm/java/domain.java.vm"]).toContain("SysUser");
    expect(files["vm/vue/index.vue.vm"]).toContain("用户");
    const zip = gen("GET", "/tool/gen/batchGenCode", undefined, { tables: "sys_user" });
    expect(zip.contentType).toContain("zip");
    expect(zip.raw).toContain("PK");
    expect(gen("GET", "/tool/gen/genCode/sys_role").body.msg).toBe("成功生成到自定义路径");
    expect(gen("PUT", "/tool/gen", { tableId: "1", tableName: "" }).body.msg).toBe("请输入表名称");
  });
});
