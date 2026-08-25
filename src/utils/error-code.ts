export const errorCode = {
  "401": "认证失败，无法访问系统资源",
  "403": "当前操作没有权限",
  "404": "访问资源不存在",
  default: "系统未知错误，请反馈给管理员",
} as const;

export type ErrorCodeKey = keyof typeof errorCode;

export function resolveErrorMessage(code: string): string {
  if (code === "401" || code === "403" || code === "404") {
    return errorCode[code];
  }
  return errorCode.default;
}
