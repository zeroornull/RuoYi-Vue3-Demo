import type { LoginInfoQuery } from "../../../types/api/monitor";

export const LOGININFOR_PAGE_NAME = "Logininfor";
export const LOGININFOR_DEFAULT_SORT = {
  prop: "loginTime",
  order: "descending",
} as const;

export type LoginInfoListQuery = LoginInfoQuery & {
  pageNum: number;
  pageSize: number;
};

export function emptyLoginInfoQuery(): LoginInfoListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    ipaddr: "",
    userName: "",
    orderByColumn: LOGININFOR_DEFAULT_SORT.prop,
    isAsc: "desc",
  };
}
