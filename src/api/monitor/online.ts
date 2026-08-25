import { http } from "../../http";
import type { OnlinePageResponse, OnlineQuery } from "../../types/api";
import type { EmptyResponse } from "../../types/http";
import { encodePathSegment } from "../shared";

export function list(query: OnlineQuery): Promise<OnlinePageResponse> {
  return http.get<OnlinePageResponse>("/monitor/online/list", { params: query });
}

export function forceLogout(tokenId: string): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(
    `/monitor/online/${encodePathSegment(tokenId)}`,
  );
}
