import type { MockJson, MockRequest, MockResponse } from "./auth.ts";

function tableNameToClassName(tableName: string): string {
  return tableName
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function parseCreateTableNames(sql: string): string[] {
  const names: string[] = [];
  const pattern = /create\s+table\s+(?:if\s+not\s+exists\s+)?[`"]?([a-zA-Z_][\w]*)[`"]?/gi;
  for (const match of sql.matchAll(pattern)) {
    const name = match[1];
    if (name) {
      names.push(name);
    }
  }
  return names;
}

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const now = "2026-08-26 12:00:00";

export const SWAGGER_UI_HTML =
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Swagger UI</title></head><body><h1>Swagger UI</h1><p>本地 Mock OpenAPI</p><ul><li>GET /getInfo</li><li>GET /monitor/cache</li></ul></body></html>';

type GenColumnRow = {
  columnId: string;
  tableId: string;
  columnName: string;
  columnComment: string;
  columnType: string;
  javaType: string;
  javaField: string;
  isPk: "0" | "1";
  isIncrement: "0" | "1";
  isRequired: "0" | "1";
  isInsert: "0" | "1";
  isEdit: "0" | "1";
  isList: "0" | "1";
  isQuery: "0" | "1";
  queryType: "EQ" | "NE" | "GT" | "GE" | "LT" | "LE" | "LIKE" | "BETWEEN";
  htmlType: string;
  dictType: string;
  sort: number;
};

type GenTableRow = {
  tableId: string;
  tableName: string;
  tableComment: string;
  className: string;
  tplCategory: "crud" | "tree" | "sub";
  tplWebType: "element-ui" | "element-plus" | "element-plus-typescript";
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  functionAuthor: string;
  genType: "0" | "1";
  genPath: string;
  remark: string;
  options: string;
  treeCode: string;
  treeParentCode: string;
  treeName: string;
  subTableName: string;
  subTableFkName: string;
  parentMenuId: string;
  createTime: string;
  updateTime: string;
  columns: GenColumnRow[];
};

type DbTableRow = {
  tableName: string;
  tableComment: string;
  createTime: string;
  updateTime: string;
};

let tables: GenTableRow[] = [];
let dbTables: DbTableRow[] = [];
let nextTableId = 3;
let nextColumnId = 10;

function column(
  columnId: string,
  tableId: string,
  columnName: string,
  columnComment: string,
  columnType: string,
  javaType: string,
  javaField: string,
  isPk: "0" | "1",
  sort: number,
): GenColumnRow {
  return {
    columnId,
    tableId,
    columnName,
    columnComment,
    columnType,
    javaType,
    javaField,
    isPk,
    isIncrement: isPk,
    isRequired: isPk,
    isInsert: "1",
    isEdit: isPk === "1" ? "0" : "1",
    isList: "1",
    isQuery: isPk === "1" ? "0" : "1",
    queryType: "EQ",
    htmlType: javaType === "Date" ? "datetime" : "input",
    dictType: "",
    sort,
  };
}

function makeTable(
  tableId: string,
  tableName: string,
  tableComment: string,
  createTime: string,
  columns: GenColumnRow[],
): GenTableRow {
  const className = tableNameToClassName(tableName);
  const parts = tableName.split("_").filter(Boolean);
  const businessName = parts[parts.length - 1] ?? tableName;
  return {
    tableId,
    tableName,
    tableComment,
    className,
    tplCategory: "crud",
    tplWebType: "element-plus",
    packageName: "com.ruoyi.system",
    moduleName: parts[0] === "sys" ? "system" : "tool",
    businessName,
    functionName: tableComment,
    functionAuthor: "ruoyi",
    genType: "0",
    genPath: "/",
    remark: "",
    options: "",
    treeCode: "",
    treeParentCode: "",
    treeName: "",
    subTableName: "",
    subTableFkName: "",
    parentMenuId: "",
    createTime,
    updateTime: createTime,
    columns,
  };
}

function seedTables(): GenTableRow[] {
  return [
    makeTable("1", "sys_user", "用户表", "2026-01-01 00:00:00", [
      column("1", "1", "user_id", "用户ID", "bigint", "Long", "userId", "1", 1),
      column("2", "1", "user_name", "用户账号", "varchar(30)", "String", "userName", "0", 2),
      column("3", "1", "nick_name", "用户昵称", "varchar(30)", "String", "nickName", "0", 3),
    ]),
    makeTable("2", "sys_role", "角色表", "2026-02-01 00:00:00", [
      column("4", "2", "role_id", "角色ID", "bigint", "Long", "roleId", "1", 1),
      column("5", "2", "role_name", "角色名称", "varchar(30)", "String", "roleName", "0", 2),
    ]),
  ];
}

function seedDbTables(): DbTableRow[] {
  return [
    {
      tableName: "sys_notice",
      tableComment: "通知公告表",
      createTime: "2026-03-01 00:00:00",
      updateTime: "2026-03-01 00:00:00",
    },
    {
      tableName: "sys_job",
      tableComment: "定时任务表",
      createTime: "2026-04-01 00:00:00",
      updateTime: "2026-04-01 00:00:00",
    },
    {
      tableName: "gen_demo",
      tableComment: "代码生成演示",
      createTime: "2026-05-01 00:00:00",
      updateTime: "2026-05-01 00:00:00",
    },
  ];
}

export function resetMockToolState(): void {
  tables = seedTables();
  dbTables = seedDbTables();
  nextTableId = 3;
  nextColumnId = 10;
}

resetMockToolState();

function queryOf(request: MockRequest): Record<string, string> {
  return request.query ?? {};
}

function includes(haystack: string, needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

function inDateRange(value: string, query: Record<string, string>): boolean {
  const day = value.slice(0, 10);
  const begin = query["params[beginTime]"];
  const end = query["params[endTime]"];
  if (begin && day < begin) {
    return false;
  }
  if (end && day > end) {
    return false;
  }
  return true;
}

function pageOf<T>(
  rows: readonly T[],
  query: Record<string, string>,
  map: (row: T) => MockJson,
): { rows: MockJson[]; total: number } {
  const pageNum = Number(query.pageNum ?? "1") || 1;
  const pageSize = Number(query.pageSize ?? "10") || 10;
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size).map(map),
    total: rows.length,
  };
}

function sortTables(rows: readonly GenTableRow[], query: Record<string, string>): GenTableRow[] {
  const column = query.orderByColumn ?? "createTime";
  const direction = query.isAsc === "asc" || query.isAsc === "ascending" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = String(left[column as keyof GenTableRow] ?? "");
    const b = String(right[column as keyof GenTableRow] ?? "");
    if (a < b) {
      return -1 * direction;
    }
    if (a > b) {
      return direction;
    }
    return 0;
  });
}

function listItem(row: GenTableRow): MockJson {
  return {
    tableId: row.tableId,
    tableName: row.tableName,
    tableComment: row.tableComment,
    className: row.className,
    tplCategory: row.tplCategory,
    tplWebType: row.tplWebType,
    packageName: row.packageName,
    moduleName: row.moduleName,
    businessName: row.businessName,
    functionName: row.functionName,
    functionAuthor: row.functionAuthor,
    genType: row.genType,
    genPath: row.genPath,
    remark: row.remark,
    options: row.options,
    treeCode: row.treeCode,
    treeParentCode: row.treeParentCode,
    treeName: row.treeName,
    subTableName: row.subTableName,
    subTableFkName: row.subTableFkName,
    parentMenuId: row.parentMenuId,
    createTime: row.createTime,
    updateTime: row.updateTime,
  };
}

function detailTables(): MockJson[] {
  return tables.map((row) => ({
    ...listItem(row),
    columns: row.columns.map((item) => ({ ...item })),
  }));
}

function previewFiles(row: GenTableRow): MockJson {
  return {
    "vm/java/domain.java.vm": `public class ${row.className} {\n    /** ${row.tableComment} */\n}\n`,
    "vm/xml/mapper.xml.vm": `<mapper namespace="${row.packageName}.mapper.${row.className}Mapper">\n</mapper>\n`,
    "vm/vue/index.vue.vm": `<template>\n  <div>${row.functionName}</div>\n</template>\n`,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function defaultColumns(tableId: string, tableName: string): GenColumnRow[] {
  const idName = `${tableName.split("_").filter(Boolean).at(-1) ?? tableName}_id`;
  const idField = tableNameToClassName(idName);
  const javaField = idField.charAt(0).toLowerCase() + idField.slice(1);
  const id = String(nextColumnId++);
  const nameId = String(nextColumnId++);
  return [
    column(id, tableId, idName, "主键", "bigint", "Long", javaField, "1", 1),
    column(nameId, tableId, "create_time", "创建时间", "datetime", "Date", "createTime", "0", 2),
  ];
}

function parseIds(rest: string): string[] {
  return rest
    .split(",")
    .map((item) => decodeURIComponent(item))
    .filter(Boolean);
}

function dbListItem(row: DbTableRow): MockJson {
  return {
    tableName: row.tableName,
    tableComment: row.tableComment,
    className: tableNameToClassName(row.tableName),
    createTime: row.createTime,
    updateTime: row.updateTime,
  };
}

export function dispatchPublicToolMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  if (method === "GET" && path === "/swagger-ui/index.html") {
    return {
      status: 200,
      body: { code: 200, msg: "ok" },
      contentType: "text/html;charset=utf-8",
      raw: SWAGGER_UI_HTML,
    };
  }
  return null;
}

export function dispatchToolMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  const query = queryOf(request);

  if (method === "GET" && path === "/tool/gen/list") {
    const filtered = sortTables(
      tables.filter(
        (row) =>
          includes(row.tableName, query.tableName) &&
          includes(row.tableComment, query.tableComment) &&
          inDateRange(row.createTime, query),
      ),
      query,
    );
    const page = pageOf(filtered, query, listItem);
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "GET" && path === "/tool/gen/db/list") {
    const imported = new Set(tables.map((row) => row.tableName));
    const filtered = dbTables.filter(
      (row) =>
        !imported.has(row.tableName) &&
        includes(row.tableName, query.tableName) &&
        includes(row.tableComment, query.tableComment),
    );
    const page = pageOf(filtered, query, dbListItem);
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "POST" && path === "/tool/gen/importTable") {
    const names = (query.tables ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (names.length === 0) {
      return fail("请选择要导入的表");
    }
    for (const tableName of names) {
      if (tables.some((row) => row.tableName === tableName)) {
        continue;
      }
      const db = dbTables.find((row) => row.tableName === tableName);
      if (!db) {
        return fail(`表 ${tableName} 不存在`);
      }
      const tableId = String(nextTableId++);
      tables.push(makeTable(tableId, db.tableName, db.tableComment, now, defaultColumns(tableId, db.tableName)));
    }
    return ok({ code: 200, msg: "导入成功" });
  }
  if (method === "POST" && path === "/tool/gen/createTable") {
    const sql = query.sql ?? "";
    const names = parseCreateTableNames(sql);
    if (names.length === 0) {
      return fail("请输入建表语句");
    }
    for (const tableName of names) {
      if (tables.some((row) => row.tableName === tableName)) {
        return fail(`表 ${tableName} 已存在`);
      }
      const tableId = String(nextTableId++);
      tables.push(makeTable(tableId, tableName, tableName, now, defaultColumns(tableId, tableName)));
    }
    return ok({ code: 200, msg: "创建表结构成功" });
  }
  const synchRest = restAfter(path, "/tool/gen/synchDb");
  if (method === "GET" && synchRest) {
    const tableName = decodeURIComponent(synchRest);
    const row = tables.find((item) => item.tableName === tableName);
    if (!row) {
      return fail("数据不存在");
    }
    row.updateTime = now;
    return ok({ code: 200, msg: "同步成功" });
  }
  const previewRest = restAfter(path, "/tool/gen/preview");
  if (method === "GET" && previewRest) {
    const row = tables.find((item) => item.tableId === decodeURIComponent(previewRest));
    if (!row) {
      return fail("数据不存在");
    }
    return ok({ code: 200, msg: "操作成功", data: previewFiles(row) });
  }
  const genCodeRest = restAfter(path, "/tool/gen/genCode");
  if (method === "GET" && genCodeRest) {
    const row = tables.find((item) => item.tableName === decodeURIComponent(genCodeRest));
    if (!row) {
      return fail("数据不存在");
    }
    return ok({ code: 200, msg: "成功生成到自定义路径" });
  }
  if (method === "GET" && path === "/tool/gen/batchGenCode") {
    const names = (query.tables ?? "").split(",").filter(Boolean);
    if (names.length === 0) {
      return fail("请选择要生成的数据");
    }
    const missing = names.some((name) => !tables.some((row) => row.tableName === name));
    if (missing) {
      return fail("数据不存在");
    }
    return {
      status: 200,
      body: { code: 200, msg: "ok" },
      contentType: "application/zip",
      raw: "PK-mock-zip",
    };
  }
  if (method === "PUT" && path === "/tool/gen") {
    if (!isRecord(request.body)) {
      return fail("请求参数错误");
    }
    const tableId = readString(request.body, "tableId");
    const tableName = readString(request.body, "tableName");
    const className = readString(request.body, "className");
    const packageName = readString(request.body, "packageName");
    if (!tableName) {
      return fail("请输入表名称");
    }
    if (!className) {
      return fail("请输入实体类名称");
    }
    if (!packageName) {
      return fail("请输入生成包路径");
    }
    const row = tables.find((item) => item.tableId === tableId);
    if (!row) {
      return fail("数据不存在");
    }
    row.tableName = tableName;
    row.tableComment = readString(request.body, "tableComment") || row.tableComment;
    row.className = className;
    row.functionAuthor = readString(request.body, "functionAuthor") || row.functionAuthor;
    row.remark = readString(request.body, "remark");
    const category = readString(request.body, "tplCategory");
    row.tplCategory = category === "tree" || category === "sub" ? category : "crud";
    const webType = readString(request.body, "tplWebType");
    row.tplWebType = webType === "element-ui" || webType === "element-plus-typescript" ? webType : "element-plus";
    row.packageName = packageName;
    row.moduleName = readString(request.body, "moduleName") || row.moduleName;
    row.businessName = readString(request.body, "businessName") || row.businessName;
    row.functionName = readString(request.body, "functionName") || row.functionName;
    row.genType = readString(request.body, "genType") === "1" ? "1" : "0";
    row.genPath = readString(request.body, "genPath") || "/";
    row.treeCode = readString(request.body, "treeCode");
    row.treeParentCode = readString(request.body, "treeParentCode");
    row.treeName = readString(request.body, "treeName");
    row.subTableName = readString(request.body, "subTableName");
    row.subTableFkName = readString(request.body, "subTableFkName");
    row.parentMenuId = readString(request.body, "parentMenuId");
    const params = request.body.params;
    if (isRecord(params)) {
      const genView = readString(params, "genView") === "1" ? "1" : "0";
      row.options = JSON.stringify({ genView, parentMenuId: row.parentMenuId });
      if (params.parentMenuId !== undefined) {
        row.parentMenuId = readString(params, "parentMenuId");
      }
    }
    const columns = request.body.columns;
    if (Array.isArray(columns)) {
      row.columns = columns.map((item, index) => {
        const col = isRecord(item) ? item : {};
        const existing = row.columns[index];
        return {
          columnId: readString(col, "columnId") || existing?.columnId || String(index + 1),
          tableId: row.tableId,
          columnName: readString(col, "columnName") || existing?.columnName || `col${index}`,
          columnComment: readString(col, "columnComment"),
          columnType: readString(col, "columnType") || existing?.columnType || "varchar(32)",
          javaType: readString(col, "javaType") || existing?.javaType || "String",
          javaField: readString(col, "javaField") || existing?.javaField || "field",
          isPk: readString(col, "isPk") === "1" ? "1" : "0",
          isIncrement: readString(col, "isIncrement") === "1" ? "1" : "0",
          isRequired: readString(col, "isRequired") === "1" ? "1" : "0",
          isInsert: readString(col, "isInsert") === "0" ? "0" : "1",
          isEdit: readString(col, "isEdit") === "0" ? "0" : "1",
          isList: readString(col, "isList") === "0" ? "0" : "1",
          isQuery: readString(col, "isQuery") === "1" ? "1" : "0",
          queryType: (readString(col, "queryType") || "EQ") as GenColumnRow["queryType"],
          htmlType: readString(col, "htmlType") || "input",
          dictType: readString(col, "dictType"),
          sort: Number(col.sort) || index + 1,
        };
      });
    }
    row.updateTime = now;
    return ok({ code: 200, msg: "修改成功" });
  }
  const genRest = restAfter(path, "/tool/gen");
  if (method === "GET" && genRest && !genRest.includes("/")) {
    const row = tables.find((item) => item.tableId === decodeURIComponent(genRest));
    if (!row) {
      return fail("数据不存在");
    }
    return ok({
      code: 200,
      msg: "操作成功",
      data: {
        info: listItem(row),
        rows: row.columns.map((item) => ({ ...item })),
        tables: detailTables(),
      },
    });
  }
  if (method === "DELETE" && genRest) {
    const ids = new Set(parseIds(genRest));
    const before = tables.length;
    tables = tables.filter((row) => !ids.has(row.tableId));
    return tables.length !== before ? ok({ code: 200, msg: "删除成功" }) : fail("数据不存在");
  }
  return null;
}
