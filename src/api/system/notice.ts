import { http } from "../../http";
import type {
  EntityId,
  IdCollection,
  Notice,
  NoticePageResponse,
  NoticeQuery,
  NoticeReadUserPageResponse,
  NoticeReadUserQuery,
  NoticeTopResponse,
  NoticeUpsertRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listNotice(query: NoticeQuery): Promise<NoticePageResponse> {
  return http.get<NoticePageResponse>("/system/notice/list", { params: query });
}

export function getNotice(noticeId: EntityId): Promise<ApiResponse<Notice>> {
  return http.get<ApiResponse<Notice>>(
    `/system/notice/${encodePathSegment(noticeId)}`,
  );
}

export function addNotice(data: NoticeUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/notice", data);
}

export function updateNotice(data: NoticeUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/notice", data);
}

export function delNotice(noticeIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/system/notice/${encodeIdCollection(noticeIds)}`,
  );
}

export function listNoticeTop(): Promise<NoticeTopResponse> {
  return http.get<NoticeTopResponse>("/system/notice/listTop");
}

export function markNoticeRead(noticeId: EntityId): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/notice/markRead", undefined, {
    params: { noticeId },
  });
}

export function markNoticeReadAll(ids: string): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/notice/markReadAll", undefined, {
    params: { ids },
  });
}

export function listNoticeReadUsers(
  query: NoticeReadUserQuery,
): Promise<NoticeReadUserPageResponse> {
  return http.get<NoticeReadUserPageResponse>("/system/notice/readUsers/list", {
    params: query,
  });
}
