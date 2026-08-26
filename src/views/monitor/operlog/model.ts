import { FALLBACK_DICTS } from "../../../composables/dict-model";
import type { DictItem } from "../../../types/dict";
import type { OperationLog, OperationLogQuery } from "../../../types/api/monitor";

export const OPERLOG_PAGE_NAME = "Operlog";
export const OPERLOG_DETAIL_PAGE_NAME = "OperlogDetail";
export const OPERLOG_DEFAULT_SORT = {
  prop: "operTime",
  order: "descending",
} as const;

export type OperationLogListQuery = OperationLogQuery & {
  pageNum: number;
  pageSize: number;
};

export function emptyOperationLogQuery(): OperationLogListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    operIp: "",
    title: "",
    operName: "",
    orderByColumn: OPERLOG_DEFAULT_SORT.prop,
    isAsc: "desc",
  };
}

export function isFailedOperation(row: OperationLog | null | undefined): boolean {
  return row?.status === "1";
}

export function readDictItems(value: unknown): DictItem[] {
  if (Array.isArray(value)) {
    return value as DictItem[];
  }
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as { value: unknown }).value;
    if (Array.isArray(inner)) {
      return inner as DictItem[];
    }
  }
  return [];
}

export function operationTypeLabel(
  options: unknown,
  businessType: number | undefined,
): string {
  if (businessType === undefined) {
    return "-";
  }
  const list = readDictItems(options);
  const source = list.length > 0 ? list : (FALLBACK_DICTS.sys_oper_type ?? []);
  return source.find((item) => item.value === String(businessType))?.label ?? "-";
}

export function formatJsonBlock(value: string | null | undefined): string {
  if (!value) {
    return "（无数据）";
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
