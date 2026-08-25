import type { RuoYiRequestOptions } from "./http";

declare module "axios" {
  interface AxiosRequestConfig {
    ruoyi?: RuoYiRequestOptions;
  }
}
