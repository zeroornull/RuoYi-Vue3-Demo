import type { AxiosRequestConfig } from "axios";

export type RuoYiRequestOptions = {
  withToken?: boolean;
  preventDuplicateSubmit?: boolean;
  duplicateIntervalMs?: number;
};

export type RuoYiRequestConfig<D = unknown> = AxiosRequestConfig<D> & {
  ruoyi?: RuoYiRequestOptions;
};

export type ApiResponse<T> = {
  code: number;
  msg?: string;
  data: T;
};

export type PageResponse<T> = {
  code: number;
  msg?: string;
  rows: T[];
  total: number;
};

export type EmptyResponse = {
  code: number;
  msg?: string;
};

export type RepeatSubmitRecord = {
  url: string;
  data: string;
  time: number;
};
