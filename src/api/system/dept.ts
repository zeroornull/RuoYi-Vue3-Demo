import { http } from "../../http";
import type {
  Department,
  DepartmentQuery,
  DepartmentUpsertRequest,
  EntityId,
  SortRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodePathSegment } from "../shared";

export function listDept(query?: DepartmentQuery): Promise<ApiResponse<Department[]>> {
  return http.get<ApiResponse<Department[]>>("/system/dept/list", { params: query });
}

export function listDeptExcludeChild(deptId: EntityId): Promise<ApiResponse<Department[]>> {
  return http.get<ApiResponse<Department[]>>(
    `/system/dept/list/exclude/${encodePathSegment(deptId)}`,
  );
}

export function getDept(deptId: EntityId): Promise<ApiResponse<Department>> {
  return http.get<ApiResponse<Department>>(`/system/dept/${encodePathSegment(deptId)}`);
}

export function addDept(data: DepartmentUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/dept", data);
}

export function updateDept(data: DepartmentUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/dept", data);
}

export function updateDeptSort(data: SortRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/dept/updateSort", data);
}

export function delDept(deptId: EntityId): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/dept/${encodePathSegment(deptId)}`);
}
