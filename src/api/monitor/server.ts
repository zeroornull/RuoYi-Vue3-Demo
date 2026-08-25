import { http } from "../../http";
import type { ServerOverview } from "../../types/api";
import type { ApiResponse } from "../../types/http";

export function getServer(): Promise<ApiResponse<ServerOverview>> {
  return http.get<ApiResponse<ServerOverview>>("/monitor/server");
}
