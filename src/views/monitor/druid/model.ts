export const DRUID_PAGE_NAME = "Druid";
export const DRUID_LOGIN_PATH = "/druid/login.html";

export function druidLoginUrl(baseApi: string): string {
  return `${baseApi.replace(/\/$/, "")}${DRUID_LOGIN_PATH}`;
}
