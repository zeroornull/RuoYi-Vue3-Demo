import type { Notice, NoticeQuery, NoticeReadUserQuery, NoticeUpsertRequest } from "../../../types/api/system";

export const NOTICE_PAGE_NAME = "Notice";

export type NoticeListQuery = NoticeQuery & {
  pageNum: number;
  pageSize: number;
};

export type NoticeReadListQuery = NoticeReadUserQuery & {
  pageNum: number;
  pageSize: number;
};

export function emptyNoticeQuery(): NoticeListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: "",
    createBy: "",
  };
}

export function emptyNoticeForm(): NoticeUpsertRequest {
  return {
    noticeTitle: "",
    noticeType: "1",
    noticeContent: "",
    status: "0",
  };
}

export function noticeToForm(row: Notice): NoticeUpsertRequest {
  return {
    noticeId: row.noticeId,
    noticeTitle: row.noticeTitle,
    noticeType: row.noticeType,
    noticeContent: row.noticeContent,
    status: row.status,
    remark: row.remark ?? "",
  };
}

export function emptyNoticeReadQuery(noticeId: string): NoticeReadListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    noticeId,
    searchValue: "",
  };
}
