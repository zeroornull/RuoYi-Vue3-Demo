import { http } from "../../http";
import type {
  EntityId,
  IdCollection,
  Job,
  JobPageResponse,
  JobQuery,
  JobUpsertRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listJob(query: JobQuery): Promise<JobPageResponse> {
  return http.get<JobPageResponse>("/monitor/job/list", { params: query });
}

export function getJob(jobId: EntityId): Promise<ApiResponse<Job>> {
  return http.get<ApiResponse<Job>>(`/monitor/job/${encodePathSegment(jobId)}`);
}

export function addJob(data: JobUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/monitor/job", data);
}

export function updateJob(data: JobUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/monitor/job", data);
}

export function delJob(jobIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/monitor/job/${encodeIdCollection(jobIds)}`);
}

export function changeJobStatus(jobId: EntityId, status: "0" | "1"): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/monitor/job/changeStatus", { jobId, status });
}

export function runJob(jobId: EntityId, jobGroup: string): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/monitor/job/run", { jobId, jobGroup });
}
