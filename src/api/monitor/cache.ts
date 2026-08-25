import { http } from "../../http";
import type { CacheEntry, CacheOverview } from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodePathSegment } from "../shared";

export function getCache(): Promise<ApiResponse<CacheOverview>> {
  return http.get<ApiResponse<CacheOverview>>("/monitor/cache");
}

export function listCacheName(): Promise<ApiResponse<CacheEntry[]>> {
  return http.get<ApiResponse<CacheEntry[]>>("/monitor/cache/getNames");
}

export function listCacheKey(cacheName: string): Promise<ApiResponse<string[]>> {
  return http.get<ApiResponse<string[]>>(
    `/monitor/cache/getKeys/${encodePathSegment(cacheName)}`,
  );
}

export function getCacheValue(
  cacheName: string,
  cacheKey: string,
): Promise<ApiResponse<CacheEntry>> {
  return http.get<ApiResponse<CacheEntry>>(
    `/monitor/cache/getValue/${encodePathSegment(cacheName)}/${encodePathSegment(cacheKey)}`,
  );
}

export function clearCacheName(cacheName: string): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/monitor/cache/clearCacheName/${encodePathSegment(cacheName)}`,
  );
}

export function clearCacheKey(cacheKey: string): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/monitor/cache/clearCacheKey/${encodePathSegment(cacheKey)}`,
  );
}

export function clearCacheAll(): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>("/monitor/cache/clearCacheAll");
}
