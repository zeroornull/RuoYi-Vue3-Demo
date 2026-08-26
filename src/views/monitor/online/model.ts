import type { OnlineQuery, OnlineUser } from "../../../types/api/monitor";

export const ONLINE_PAGE_NAME = "Online";

export type OnlineListQuery = OnlineQuery & {
  ipaddr: string;
  userName: string;
};

export function emptyOnlineQuery(): OnlineListQuery {
  return {
    ipaddr: "",
    userName: "",
  };
}

export function paginateOnline(rows: readonly OnlineUser[], pageNum: number, pageSize: number): OnlineUser[] {
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return rows.slice(start, start + size);
}
