import { parseUser, type User } from "./01-unknown.ts";

export type ApiOk<T> = {
  ok: true;
  code: 200;
  data: T;
};

export type ApiErr = {
  ok: false;
  code: number;
  msg: string;
};

export type ApiResult<T> = ApiOk<T> | ApiErr;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseApiResult<T>(
  value: unknown,
  parseData: (data: unknown) => T,
): ApiResult<T> {
  if (!isRecord(value) || typeof value.code !== "number") {
    return { ok: false, code: 500, msg: "invalid payload" };
  }

  if (value.code === 200) {
    return { ok: true, code: 200, data: parseData(value.data) };
  }

  const msg = typeof value.msg === "string" ? value.msg : "request failed";
  return { ok: false, code: value.code, msg };
}

export const userResult: ApiResult<User> = parseApiResult(
  { code: 200, data: { userId: "1", userName: "admin" } },
  parseUser,
);

export function resultData(result: ApiResult<User>): User {
  if (result.ok) {
    return result.data;
  }
  // @ts-expect-error 失败结果没有 data，不能把 {code,msg} 当成成功载荷
  return result.data;
}

export const businessCodes = {
  success: 200,
  warn: 601,
  error: 500,
  relogin: 401,
} as const satisfies Record<string, number>;

export type SuccessCode = typeof businessCodes.success;

export const annotatedCodes: Record<string, number> = {
  success: 200,
};

export const assertedCodes = {
  success: "200",
} as unknown as Record<string, number>;

export const invalidCodes = {
  // @ts-expect-error satisfies 检查值类型；as unknown as 才会把错误字符串硬转成 number
  success: "200",
} satisfies Record<string, number>;

export const successCode: SuccessCode = 200;
export type AnnotatedSuccess = (typeof annotatedCodes)["success"];
export type AssertedSuccess = (typeof assertedCodes)["success"];
