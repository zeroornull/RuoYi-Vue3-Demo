import { appEnv } from "../config/env";
import { saveFile } from "../utils/save-file";
import { sessionCache } from "./cache";
import { createHttpClient } from "./client";
import { downloadForm } from "./download";
import { getToken } from "./token";
import { elementHttpUi } from "./ui-element";

export { createHttpClient } from "./client";
export { getToken, removeToken, setToken, TOKEN_COOKIE_KEY } from "./token";
export { localCache, parseCacheJson, sessionCache } from "./cache";
export { downloadForm } from "./download";
export { elementHttpUi } from "./ui-element";

let sessionExpiredHandler: () => void | Promise<void> = () => {
  window.location.href = "/index";
};

export function setSessionExpiredHandler(handler: () => void | Promise<void>): void {
  sessionExpiredHandler = handler;
}

export const http = createHttpClient({
  baseURL: appEnv.baseApi,
  getToken,
  cache: sessionCache,
  ui: elementHttpUi,
  onSessionExpired: () => sessionExpiredHandler(),
});

export function download(url: string, params: Record<string, unknown>, filename: string): Promise<void> {
  return downloadForm(
    {
      client: http,
      ui: elementHttpUi,
      saveAs: saveFile,
    },
    url,
    params,
    filename,
  );
}
