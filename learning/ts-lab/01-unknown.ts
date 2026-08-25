export type User = {
  userId: string;
  userName: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new Error("user is not an object");
  }

  const userId = value.userId;
  const userName = value.userName;
  if (typeof userId !== "string" || typeof userName !== "string") {
    throw new Error("user fields are invalid");
  }

  return { userId, userName };
}

const payload: unknown = { userId: "1", userName: "admin" };
export const user = parseUser(payload);

export function unsafeCast(value: unknown): User {
  return value as User;
}

export function readUserName(value: unknown): string {
  // @ts-expect-error unknown 没有成员；必须先收窄或解析，不能直接读字段
  return value.userName;
}

export function assignUnknown(value: unknown): User {
  // @ts-expect-error unknown 不能直接赋给 User；as User 能编译过，但那不是验证
  return value;
}

export function assertNever(value: never): never {
  throw new Error(`unexpected value: ${String(value)}`);
}
