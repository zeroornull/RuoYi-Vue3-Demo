import { http } from "../../../http";
import type {
  DictData,
  DictDataPageResponse,
  DictDataQuery,
  DictDataUpsertRequest,
  EntityId,
  IdCollection,
} from "../../../types/api";
import type { ApiResponse, EmptyResponse } from "../../../types/http";
import { encodeIdCollection, encodePathSegment } from "../../shared";

export function listData(query: DictDataQuery): Promise<DictDataPageResponse> {
  return http.get<DictDataPageResponse>("/system/dict/data/list", { params: query });
}

export function getData(dictCode: EntityId): Promise<ApiResponse<DictData>> {
  return http.get<ApiResponse<DictData>>(
    `/system/dict/data/${encodePathSegment(dictCode)}`,
  );
}

export function getDicts(dictType: string): Promise<ApiResponse<DictData[]>> {
  return http.get<ApiResponse<DictData[]>>(
    `/system/dict/data/type/${encodePathSegment(dictType)}`,
  );
}

export function addData(data: DictDataUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/dict/data", data);
}

export function updateData(data: DictDataUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/dict/data", data);
}

export function delData(dictCodes: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/system/dict/data/${encodeIdCollection(dictCodes)}`,
  );
}
