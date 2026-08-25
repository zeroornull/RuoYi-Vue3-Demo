import { http } from "../http";
import type { RouterResponse } from "../types/api";
import { parseRouterResponse } from "./contracts";

export async function getRouters(): Promise<RouterResponse> {
  return parseRouterResponse(await http.get<unknown>("/getRouters"));
}
