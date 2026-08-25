import type {
  BaseEntity,
  DateRangeQuery,
  EntityId,
  PageQuery,
} from "./common";
import type { PageResponse } from "../http";

export type GeneratorQuery = PageQuery & {
  tableName?: string;
  tableComment?: string;
  params?: DateRangeQuery;
};

export type GeneratorColumn = BaseEntity & {
  columnId: EntityId;
  tableId: EntityId;
  columnName: string;
  columnComment?: string | null;
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
  dictType?: string | null;
  sort: number;
};

export type GeneratorTable = BaseEntity & {
  tableId: EntityId;
  tableName: string;
  tableComment?: string | null;
  subTableName?: string | null;
  subTableFkName?: string | null;
  className: string;
  tplCategory: "crud" | "tree" | "sub";
  tplWebType: "element-ui" | "element-plus";
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  functionAuthor: string;
  genType: "0" | "1";
  genPath?: string | null;
  options?: string | null;
  treeCode?: string | null;
  treeParentCode?: string | null;
  treeName?: string | null;
  parentMenuId?: EntityId | null;
  parentMenuName?: string | null;
  columns?: GeneratorColumn[];
};

export type GeneratorTableUpdateRequest = Omit<
  GeneratorTable,
  keyof BaseEntity
> & { remark?: string | null };
export type ImportTablesRequest = {
  tables: string;
  tplWebType: "element-plus";
};
export type CreateTableRequest = {
  sql: string;
  tplWebType: "element-plus";
};
export type GeneratorTableInfo = {
  info: GeneratorTable;
  rows: GeneratorColumn[];
  tables: GeneratorTable[];
};
export type GeneratorPreview = Record<string, string>;
export type GeneratorPageResponse = PageResponse<GeneratorTable>;
