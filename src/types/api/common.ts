import type { EntityId } from "../id";

export type { EntityId } from "../id";

export type Nullable<T> = T | null;
export type EnabledStatus = "0" | "1";
export type YesNo = "Y" | "N";
export type ApiDateTime = string;

export type DateRangeQuery = {
  beginTime?: string;
  endTime?: string;
};

export type PageQuery = {
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: "asc" | "desc";
  reasonable?: boolean;
};

export type BaseEntity = {
  searchValue?: Nullable<string>;
  createBy?: Nullable<string>;
  createTime?: Nullable<ApiDateTime>;
  updateBy?: Nullable<string>;
  updateTime?: Nullable<ApiDateTime>;
  remark?: Nullable<string>;
};

export type TreeSelectNode = {
  id: EntityId;
  label: string;
  disabled?: boolean;
  children?: TreeSelectNode[];
};

export type IdCollection = EntityId | readonly EntityId[];

export type UploadFileResponse = {
  code: number;
  msg?: string;
  fileName: string;
  newFileName: string;
  originalFilename: string;
  url: string;
};
