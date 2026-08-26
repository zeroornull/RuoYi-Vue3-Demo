import { http } from "../../http";
import type {
  CreateTableRequest,
  EntityId,
  GeneratorPageResponse,
  GeneratorPreview,
  GeneratorQuery,
  GeneratorTableInfo,
  GeneratorTableUpdateRequest,
  IdCollection,
  ImportTablesRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listTable(query: GeneratorQuery): Promise<GeneratorPageResponse> {
  return http.get<GeneratorPageResponse>("/tool/gen/list", { params: query });
}

export function listDbTable(query: GeneratorQuery): Promise<GeneratorPageResponse> {
  return http.get<GeneratorPageResponse>("/tool/gen/db/list", { params: query });
}

export function getGenTable(tableId: EntityId): Promise<ApiResponse<GeneratorTableInfo>> {
  return http.get<ApiResponse<GeneratorTableInfo>>(`/tool/gen/${encodePathSegment(tableId)}`);
}

export function updateGenTable(data: GeneratorTableUpdateRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/tool/gen", data);
}

export function importTable(data: ImportTablesRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/tool/gen/importTable", undefined, { params: data });
}

export function createTable(data: CreateTableRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/tool/gen/createTable", undefined, { params: data });
}

export function previewTable(tableId: EntityId): Promise<ApiResponse<GeneratorPreview>> {
  return http.get<ApiResponse<GeneratorPreview>>(`/tool/gen/preview/${encodePathSegment(tableId)}`);
}

export function delTable(tableIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/tool/gen/${encodeIdCollection(tableIds)}`);
}

export function genCode(tableName: string): Promise<EmptyResponse> {
  return http.get<EmptyResponse>(`/tool/gen/genCode/${encodePathSegment(tableName)}`);
}

export function synchDb(tableName: string): Promise<EmptyResponse> {
  return http.get<EmptyResponse>(`/tool/gen/synchDb/${encodePathSegment(tableName)}`);
}

export function downloadGeneratedCode(tableNames: readonly string[]): Promise<Blob> {
  return http.requestBlob({
    method: "get",
    url: "/tool/gen/batchGenCode",
    params: { tables: tableNames.join(",") },
  });
}
