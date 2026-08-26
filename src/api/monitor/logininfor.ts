import { http } from "../../http";
import type { IdCollection, LoginInfoPageResponse, LoginInfoQuery } from "../../types/api";
import type { EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function list(query: LoginInfoQuery): Promise<LoginInfoPageResponse> {
  return http.get<LoginInfoPageResponse>("/monitor/logininfor/list", {
    params: query,
  });
}

export function delLogininfor(infoIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/monitor/logininfor/${encodeIdCollection(infoIds)}`);
}

export function unlockLogininfor(userName: string): Promise<EmptyResponse> {
  return http.get<EmptyResponse>(`/monitor/logininfor/unlock/${encodePathSegment(userName)}`);
}

export function cleanLogininfor(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/monitor/logininfor/clean");
}
