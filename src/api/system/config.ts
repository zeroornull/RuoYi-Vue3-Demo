import { http } from "../../http";
import type {
  Config,
  ConfigPageResponse,
  ConfigQuery,
  ConfigUpsertRequest,
  EntityId,
  IdCollection,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listConfig(query: ConfigQuery): Promise<ConfigPageResponse> {
  return http.get<ConfigPageResponse>("/system/config/list", { params: query });
}

export function getConfig(configId: EntityId): Promise<ApiResponse<Config>> {
  return http.get<ApiResponse<Config>>(
    `/system/config/${encodePathSegment(configId)}`,
  );
}

export function getConfigKey(configKey: string): Promise<ApiResponse<string>> {
  return http.get<ApiResponse<string>>(
    `/system/config/configKey/${encodePathSegment(configKey)}`,
  );
}

export function addConfig(data: ConfigUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/config", data);
}

export function updateConfig(data: ConfigUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/config", data);
}

export function delConfig(configIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/system/config/${encodeIdCollection(configIds)}`,
  );
}

export function refreshCache(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/system/config/refreshCache");
}
