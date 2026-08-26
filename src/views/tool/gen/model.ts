import type {
  GeneratorColumn,
  GeneratorPreview,
  GeneratorQuery,
  GeneratorTable,
  GeneratorTableUpdateRequest,
} from "../../../types/api/tool";
import { isRecord, parseJsonUnknown } from "../../../utils/guard";

export const GEN_PAGE_NAME = "Gen";
export const GEN_EDIT_PAGE_NAME = "GenEdit";
export const GEN_DEFAULT_SORT = {
  prop: "createTime",
  order: "descending",
} as const;

export type GenListQuery = GeneratorQuery & {
  pageNum: number;
  pageSize: number;
  tableName: string;
  tableComment: string;
  orderByColumn: string;
  isAsc: "asc" | "desc";
};

export type GenDbQuery = {
  pageNum: number;
  pageSize: number;
  tableName: string;
  tableComment: string;
};

export type GeneratorBasicInfo = {
  tableName: string;
  tableComment: string;
  className: string;
  functionAuthor: string;
  remark: string;
};

export type TableSortEvent = {
  prop?: string;
  order?: string | null;
};

export function emptyGenQuery(): GenListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    tableName: "",
    tableComment: "",
    orderByColumn: GEN_DEFAULT_SORT.prop,
    isAsc: "desc",
  };
}

export function emptyGenDbQuery(): GenDbQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    tableName: "",
    tableComment: "",
  };
}

export function emptyBasicInfo(): GeneratorBasicInfo {
  return {
    tableName: "",
    tableComment: "",
    className: "",
    functionAuthor: "",
    remark: "",
  };
}

export function tableToBasicInfo(row: GeneratorTable): GeneratorBasicInfo {
  return {
    tableName: row.tableName,
    tableComment: row.tableComment ?? "",
    className: row.className,
    functionAuthor: row.functionAuthor,
    remark: row.remark ?? "",
  };
}

export function tableSortToQuery(sort: TableSortEvent): {
  orderByColumn?: string;
  isAsc?: "asc" | "desc";
} {
  if (!sort.prop) {
    return {};
  }
  if (sort.order === "ascending") {
    return { orderByColumn: sort.prop, isAsc: "asc" };
  }
  if (sort.order === "descending") {
    return { orderByColumn: sort.prop, isAsc: "desc" };
  }
  return {};
}

export function tableNameToClassName(tableName: string): string {
  return tableName
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function parseCreateTableNames(sql: string): string[] {
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

export function genEditPath(tableId: string): string {
  return `/tool/gen-edit/index/${tableId}`;
}

export const JAVA_TYPE_OPTIONS = ["Long", "String", "Integer", "Double", "BigDecimal", "Date", "Boolean"] as const;

export const QUERY_TYPE_OPTIONS: ReadonlyArray<{
  label: string;
  value: GeneratorColumn["queryType"];
}> = [
  { label: "=", value: "EQ" },
  { label: "!=", value: "NE" },
  { label: ">", value: "GT" },
  { label: ">=", value: "GE" },
  { label: "<", value: "LT" },
  { label: "<=", value: "LE" },
  { label: "LIKE", value: "LIKE" },
  { label: "BETWEEN", value: "BETWEEN" },
];

export const HTML_TYPE_OPTIONS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "文本框", value: "input" },
  { label: "文本域", value: "textarea" },
  { label: "下拉框", value: "select" },
  { label: "单选框", value: "radio" },
  { label: "复选框", value: "checkbox" },
  { label: "日期控件", value: "datetime" },
  { label: "图片上传", value: "imageUpload" },
  { label: "文件上传", value: "fileUpload" },
  { label: "富文本控件", value: "editor" },
];

export type GenEditForm = {
  tableId: string;
  tableName: string;
  tableComment: string;
  className: string;
  functionAuthor: string;
  remark: string;
  tplCategory: GeneratorTable["tplCategory"];
  tplWebType: GeneratorTable["tplWebType"];
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  formColNum: 1 | 2 | 3;
  genView: boolean;
  genType: "0" | "1";
  genPath: string;
  parentMenuId: string;
  treeCode: string;
  treeParentCode: string;
  treeName: string;
  subTableName: string;
  subTableFkName: string;
  columns: GeneratorColumn[];
};

export type PreviewFile = {
  key: string;
  label: string;
  content: string;
};

export function emptyGenEditForm(): GenEditForm {
  return {
    tableId: "",
    tableName: "",
    tableComment: "",
    className: "",
    functionAuthor: "",
    remark: "",
    tplCategory: "crud",
    tplWebType: "element-plus",
    packageName: "",
    moduleName: "",
    businessName: "",
    functionName: "",
    formColNum: 1,
    genView: false,
    genType: "0",
    genPath: "/",
    parentMenuId: "",
    treeCode: "",
    treeParentCode: "",
    treeName: "",
    subTableName: "",
    subTableFkName: "",
    columns: [],
  };
}

export function parseGenOptions(raw: string | null | undefined): {
  formColNum: 1 | 2 | 3;
  genView: boolean;
} {
  if (!raw) {
    return { formColNum: 1, genView: false };
  }
  try {
    const parsed = parseJsonUnknown(raw);
    if (!isRecord(parsed)) {
      return { formColNum: 1, genView: false };
    }
    const col = parsed.formColNum;
    const formColNum = col === 2 || col === 3 ? col : 1;
    const view = parsed.genView;
    return {
      formColNum,
      genView: view === "1" || view === 1 || view === true,
    };
  } catch {
    return { formColNum: 1, genView: false };
  }
}

export function tableInfoToForm(info: GeneratorTable, rows: GeneratorColumn[]): GenEditForm {
  const options = parseGenOptions(info.options);
  const webType = info.tplWebType;
  return {
    tableId: String(info.tableId),
    tableName: info.tableName,
    tableComment: info.tableComment ?? "",
    className: info.className,
    functionAuthor: info.functionAuthor,
    remark: info.remark ?? "",
    tplCategory: info.tplCategory,
    tplWebType: webType === "element-ui" || webType === "element-plus-typescript" ? webType : "element-plus",
    packageName: info.packageName,
    moduleName: info.moduleName,
    businessName: info.businessName,
    functionName: info.functionName,
    formColNum: options.formColNum,
    genView: options.genView,
    genType: info.genType,
    genPath: info.genPath ?? "/",
    parentMenuId: info.parentMenuId == null ? "" : String(info.parentMenuId),
    treeCode: info.treeCode ?? "",
    treeParentCode: info.treeParentCode ?? "",
    treeName: info.treeName ?? "",
    subTableName: info.subTableName ?? "",
    subTableFkName: info.subTableFkName ?? "",
    columns: rows.map((row) => ({ ...row })),
  };
}

export function formToUpdateRequest(form: GenEditForm): GeneratorTableUpdateRequest {
  const params: NonNullable<GeneratorTableUpdateRequest["params"]> = {
    genView: form.genView ? "1" : "0",
  };
  if (form.treeCode) {
    params.treeCode = form.treeCode;
  }
  if (form.treeName) {
    params.treeName = form.treeName;
  }
  if (form.treeParentCode) {
    params.treeParentCode = form.treeParentCode;
  }
  if (form.parentMenuId) {
    params.parentMenuId = form.parentMenuId;
  }
  return {
    tableId: form.tableId,
    tableName: form.tableName,
    tableComment: form.tableComment,
    className: form.className,
    tplCategory: form.tplCategory,
    tplWebType: form.tplWebType,
    packageName: form.packageName,
    moduleName: form.moduleName,
    businessName: form.businessName,
    functionName: form.functionName,
    functionAuthor: form.functionAuthor,
    genType: form.genType,
    genPath: form.genPath,
    remark: form.remark,
    treeCode: form.treeCode || null,
    treeParentCode: form.treeParentCode || null,
    treeName: form.treeName || null,
    subTableName: form.tplCategory === "sub" ? form.subTableName || null : null,
    subTableFkName: form.tplCategory === "sub" ? form.subTableFkName || null : null,
    parentMenuId: form.parentMenuId || null,
    columns: form.columns,
    params,
  };
}

export function clearCategoryExtras(form: GenEditForm, category: GenEditForm["tplCategory"]): void {
  form.tplCategory = category;
  if (category !== "sub") {
    form.subTableName = "";
    form.subTableFkName = "";
  }
  if (category !== "tree") {
    form.treeCode = "";
    form.treeParentCode = "";
    form.treeName = "";
  }
}

export function subTableColumns(tables: readonly GeneratorTable[], tableName: string): GeneratorColumn[] {
  const match = tables.find((item) => item.tableName === tableName);
  return match?.columns ?? [];
}

export function reorderColumns(columns: readonly GeneratorColumn[], from: number, to: number): GeneratorColumn[] {
  const next = [...columns];
  if (from < 0 || to < 0 || from >= next.length || to >= next.length) {
    return next.map((row, index) => ({ ...row, sort: index + 1 }));
  }
  const moved = next.splice(from, 1)[0];
  if (!moved) {
    return columns.map((row, index) => ({ ...row, sort: index + 1 }));
  }
  next.splice(to, 0, moved);
  return next.map((row, index) => ({ ...row, sort: index + 1 }));
}

export function previewTabLabel(path: string): string {
  const slash = path.lastIndexOf("/");
  const file = slash >= 0 ? path.slice(slash + 1) : path;
  const vm = file.indexOf(".vm");
  return vm >= 0 ? file.slice(0, vm) : file;
}

export function toPreviewFiles(data: GeneratorPreview): PreviewFile[] {
  return Object.entries(data).map(([key, content]) => ({
    key,
    label: previewTabLabel(key),
    content,
  }));
}

export function zipDownloadName(tableNames: readonly string[]): string {
  return tableNames.length === 1 ? `${tableNames[0] ?? "ruoyi"}.zip` : "ruoyi.zip";
}

export function htmlTypeLabel(htmlType: string): string {
  return HTML_TYPE_OPTIONS.find((item) => item.value === htmlType)?.label ?? htmlType;
}
