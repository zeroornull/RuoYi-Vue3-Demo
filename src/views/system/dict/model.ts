import type {
  DictData,
  DictDataQuery,
  DictDataUpsertRequest,
  DictType,
  DictTypeQuery,
  DictTypeUpsertRequest,
} from "../../../types/api/system";

export const DICT_PAGE_NAME = "Dict";
export const DICT_DATA_PAGE_NAME = "Data";

export type DictTypeListQuery = DictTypeQuery & {
  pageNum: number;
  pageSize: number;
};

export type DictDataListQuery = DictDataQuery & {
  pageNum: number;
  pageSize: number;
};

export function emptyDictTypeQuery(): DictTypeListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    dictName: "",
    dictType: "",
  };
}

export function emptyDictTypeForm(): DictTypeUpsertRequest {
  return {
    dictName: "",
    dictType: "",
    status: "0",
    remark: "",
  };
}

export function dictTypeToForm(row: DictType): DictTypeUpsertRequest {
  return {
    dictId: row.dictId,
    dictName: row.dictName,
    dictType: row.dictType,
    status: row.status,
    remark: row.remark ?? "",
  };
}

export function emptyDictDataQuery(dictType = ""): DictDataListQuery {
  const query: DictDataListQuery = {
    pageNum: 1,
    pageSize: 10,
    dictLabel: "",
  };
  if (dictType) {
    query.dictType = dictType;
  }
  return query;
}

export function emptyDictDataForm(dictType = ""): DictDataUpsertRequest {
  return {
    dictLabel: "",
    dictValue: "",
    dictType,
    dictSort: 0,
    isDefault: "N",
    status: "0",
    listClass: "default",
    cssClass: "",
    remark: "",
  };
}

export function dictDataToForm(row: DictData): DictDataUpsertRequest {
  return {
    dictCode: row.dictCode,
    dictLabel: row.dictLabel,
    dictValue: row.dictValue,
    dictType: row.dictType,
    dictSort: row.dictSort,
    isDefault: row.isDefault,
    status: row.status,
    listClass: row.listClass ?? "default",
    cssClass: row.cssClass ?? "",
    remark: row.remark ?? "",
  };
}
