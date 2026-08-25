import axios, { AxiosError } from "axios";
import type {
  AxiosAdapter,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, RepeatSubmitRecord, RuoYiRequestConfig } from "../types/http";
import { isRecord } from "../utils/guard";
import { tansParams } from "../utils/params";
import { resolveErrorMessage } from "../utils/error-code";
import { isRepeatSubmitRecord, type JsonCache } from "./cache";
import {
  duplicateIntervalMs,
  requestMethod,
  shouldAttachToken,
  shouldPreventDuplicateSubmit,
} from "./flags";
import type { HttpUi } from "./ui";

const REPEAT_CACHE_KEY = "sessionObj";
const REPEAT_LIMIT = 5 * 1024 * 1024;
const SESSION_EXPIRED_MESSAGE = "无效的会话，或者会话已过期，请重新登录。";

export type HttpDeps = {
  baseURL: string;
  timeout?: number;
  getToken: () => string | undefined;
  cache: JsonCache;
  ui: HttpUi;
  onSessionExpired: () => void | Promise<void>;
  now?: () => number;
  adapter?: AxiosAdapter;
  repeatLimit?: number;
};

export type HttpClient = {
  raw: AxiosInstance;
  get: <T>(url: string, config?: RuoYiRequestConfig) => Promise<ApiResponse<T>>;
  post: <T>(
    url: string,
    data?: unknown,
    config?: RuoYiRequestConfig,
  ) => Promise<ApiResponse<T>>;
  put: <T>(
    url: string,
    data?: unknown,
    config?: RuoYiRequestConfig,
  ) => Promise<ApiResponse<T>>;
  delete: <T>(
    url: string,
    config?: RuoYiRequestConfig,
  ) => Promise<ApiResponse<T>>;
  request: <T>(config: RuoYiRequestConfig) => Promise<ApiResponse<T>>;
  requestBlob: (config: RuoYiRequestConfig) => Promise<Blob>;
};

function isApiEnvelope(
  value: unknown,
): value is { code?: number; msg?: string; data?: unknown } {
  return isRecord(value);
}

function attachAuthorization(
  config: InternalAxiosRequestConfig,
  token: string,
): void {
  if (!config.headers) {
    return;
  }
  config.headers.Authorization = `Bearer ${token}`;
}

function applyGetParams(config: InternalAxiosRequestConfig): void {
  if (requestMethod(config) !== "get" || !config.params) {
    return;
  }
  const query = tansParams(config.params as Record<string, unknown>);
  const base = config.url ?? "";
  config.url = `${base}?${query}`.slice(0, -1);
  config.params = {};
}

function repeatRecordSize(record: RepeatSubmitRecord): number {
  return Object.keys(JSON.stringify(record)).length;
}

function guardRepeatSubmit(
  config: InternalAxiosRequestConfig,
  cache: JsonCache,
  now: number,
  repeatLimit: number,
): Error | undefined {
  if (
    !shouldPreventDuplicateSubmit(config) ||
    (requestMethod(config) !== "post" && requestMethod(config) !== "put")
  ) {
    return undefined;
  }
  const record: RepeatSubmitRecord = {
    url: config.url ?? "",
    data:
      typeof config.data === "object"
        ? JSON.stringify(config.data)
        : String(config.data ?? ""),
    time: now,
  };
  if (repeatRecordSize(record) >= repeatLimit) {
    console.warn(
      `[${config.url}]: 请求数据大小超出允许的5M限制，无法进行防重复提交验证。`,
    );
    return undefined;
  }
  const previous = cache.getJSON(REPEAT_CACHE_KEY);
  if (!isRepeatSubmitRecord(previous)) {
    cache.setJSON(REPEAT_CACHE_KEY, record);
    return undefined;
  }
  const interval = duplicateIntervalMs(config);
  if (
    previous.data === record.data &&
    record.time - previous.time < interval &&
    previous.url === record.url
  ) {
    const message = "数据正在处理，请勿重复提交";
    console.warn(`[${previous.url}]: ${message}`);
    return new Error(message);
  }
  cache.setJSON(REPEAT_CACHE_KEY, record);
  return undefined;
}

function mapNetworkError(error: Error): string {
  const message = error.message;
  if (message === "Network Error") {
    return "后端接口连接异常";
  }
  if (message.includes("timeout")) {
    return "系统接口请求超时";
  }
  if (message.includes("Request failed with status code")) {
    return `系统接口${message.slice(-3)}异常`;
  }
  return message;
}

export function createHttpClient(deps: HttpDeps): HttpClient {
  const relogin = { show: false };
  const now = deps.now ?? (() => Date.now());

  const instance = axios.create({
    baseURL: deps.baseURL,
    timeout: deps.timeout ?? 10000,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    ...(deps.adapter ? { adapter: deps.adapter } : {}),
  });

  instance.interceptors.request.use(
    (config) => {
      const token = deps.getToken();
      if (token && shouldAttachToken(config)) {
        attachAuthorization(config, token);
      }
      applyGetParams(config);
      const duplicate = guardRepeatSubmit(
        config,
        deps.cache,
        now(),
        deps.repeatLimit ?? REPEAT_LIMIT,
      );
      if (duplicate) {
        return Promise.reject(duplicate);
      }
      return config;
    },
    (error: unknown) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    ((res: AxiosResponse<unknown>) => {
      const responseType = res.config.responseType;
      if (responseType === "blob" || responseType === "arraybuffer") {
        return res.data;
      }
      const payload = res.data;
      const code = isApiEnvelope(payload) ? (payload.code ?? 200) : 200;
      const msg = isApiEnvelope(payload)
        ? resolveErrorMessage(code, payload.msg)
        : resolveErrorMessage(code);
      if (code === 401) {
        if (!relogin.show) {
          relogin.show = true;
          void deps.ui.confirmRelogin().then((confirmed) => {
            relogin.show = false;
            if (confirmed) {
              return deps.onSessionExpired();
            }
            return undefined;
          });
        }
        return Promise.reject(SESSION_EXPIRED_MESSAGE);
      }
      if (code === 500) {
        deps.ui.error(msg);
        return Promise.reject(new Error(msg));
      }
      if (code === 601) {
        deps.ui.warning(msg);
        return Promise.reject(new Error(msg));
      }
      if (code !== 200) {
        deps.ui.notifyError(msg);
        return Promise.reject("error");
      }
      return payload;
    }) as (res: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    (error: unknown) => {
      const raw =
        error instanceof AxiosError || error instanceof Error
          ? error
          : new Error(String(error));
      console.log(`err${raw}`);
      deps.ui.error(mapNetworkError(raw));
      return Promise.reject(error);
    },
  );

  async function request<T>(config: RuoYiRequestConfig): Promise<ApiResponse<T>> {
    const data = await instance.request<unknown, ApiResponse<T>>(config);
    return data;
  }

  async function requestBlob(config: RuoYiRequestConfig): Promise<Blob> {
    const data = await instance.request<unknown, Blob>({
      ...config,
      responseType: "blob",
    });
    return data;
  }

  return {
    raw: instance,
    request,
    requestBlob,
    get: (url, config) => request({ ...config, method: "get", url }),
    post: (url, data, config) =>
      request({ ...config, method: "post", url, data }),
    put: (url, data, config) =>
      request({ ...config, method: "put", url, data }),
    delete: (url, config) => request({ ...config, method: "delete", url }),
  };
}
