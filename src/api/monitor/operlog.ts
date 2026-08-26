import { http } from "../../http";
import type { IdCollection, OperationLogPageResponse, OperationLogQuery } from "../../types/api";
import type { EmptyResponse } from "../../types/http";
import { encodeIdCollection } from "../shared";

export function list(query: OperationLogQuery): Promise<OperationLogPageResponse> {
  return http.get<OperationLogPageResponse>("/monitor/operlog/list", {
    params: query,
  });
}

export function delOperlog(operIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/monitor/operlog/${encodeIdCollection(operIds)}`);
}

export function cleanOperlog(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/monitor/operlog/clean");
}
