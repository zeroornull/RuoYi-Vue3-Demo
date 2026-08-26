import { http } from "../../../http";
import type {
  DictType,
  DictTypePageResponse,
  DictTypeQuery,
  DictTypeUpsertRequest,
  EntityId,
  IdCollection,
} from "../../../types/api";
import type { ApiResponse, EmptyResponse } from "../../../types/http";
import { encodeIdCollection, encodePathSegment } from "../../shared";

export function listType(query: DictTypeQuery): Promise<DictTypePageResponse> {
  return http.get<DictTypePageResponse>("/system/dict/type/list", { params: query });
}

export function getType(dictId: EntityId): Promise<ApiResponse<DictType>> {
  return http.get<ApiResponse<DictType>>(`/system/dict/type/${encodePathSegment(dictId)}`);
}

export function addType(data: DictTypeUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/dict/type", data);
}

export function updateType(data: DictTypeUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/dict/type", data);
}

export function delType(dictIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/dict/type/${encodeIdCollection(dictIds)}`);
}

export function refreshCache(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/system/dict/type/refreshCache");
}

export function optionselect(): Promise<ApiResponse<DictType[]>> {
  return http.get<ApiResponse<DictType[]>>("/system/dict/type/optionselect");
}
