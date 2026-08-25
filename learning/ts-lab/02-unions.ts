export type Success<T> = {
  ok: true;
  data: T;
};

export type Failure = {
  ok: false;
  error: string;
};

export type Result<T> = Success<T> | Failure;

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.data;
  }
  throw new Error(result.error);
}

export function dataOnFailure(result: Result<string>): string {
  if (result.ok) {
    return result.data;
  }
  // @ts-expect-error 判别联合收窄后，失败分支没有 data
  return result.data;
}

type NodeKind = "directory" | "file";

export function describeKind(kind: NodeKind): string {
  switch (kind) {
    case "directory":
      return "directory";
    case "file":
      return "file";
    default:
      return assertUnreachable(kind);
  }
}

function assertUnreachable(value: never): never {
  throw new Error(`unhandled kind: ${String(value)}`);
}

export function incompleteSwitch(kind: NodeKind): string {
  switch (kind) {
    case "directory":
      return "directory";
    default:
      // @ts-expect-error 未穷尽 "file"，剩余类型不是 never
      return assertUnreachable(kind);
  }
}

export type OptionalKeyword = {
  keyword?: string;
};

export const missingKeyword: OptionalKeyword = {};

// @ts-expect-error exactOptionalPropertyTypes：省略属性不等于显式 undefined
export const undefinedKeyword: OptionalKeyword = { keyword: undefined };

export type RequiredUndefinedKeyword = {
  keyword: string | undefined;
};

export const explicitUndefined: RequiredUndefinedKeyword = {
  keyword: undefined,
};

// @ts-expect-error keyword 是必填的 string | undefined，对象字面量不能省略该键
export const omittedRequired: RequiredUndefinedKeyword = {};
