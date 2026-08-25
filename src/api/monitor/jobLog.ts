import { http } from "../../http";
import type {
  IdCollection,
  JobLogPageResponse,
  JobLogQuery,
} from "../../types/api";
import type { EmptyResponse } from "../../types/http";
import { encodeIdCollection } from "../shared";

export function listJobLog(query: JobLogQuery): Promise<JobLogPageResponse> {
  return http.get<JobLogPageResponse>("/monitor/jobLog/list", { params: query });
}

export function delJobLog(jobLogIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/monitor/jobLog/${encodeIdCollection(jobLogIds)}`,
  );
}

export function cleanJobLog(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/monitor/jobLog/clean");
}
