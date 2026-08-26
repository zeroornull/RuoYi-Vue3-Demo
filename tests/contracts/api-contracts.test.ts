import { describe, expect, test } from "bun:test";
import {
  ApiContractError,
  parseLoginResponse,
  parsePageResponse,
  parseRouterResponse,
  parseUserInfoResponse,
} from "../../src/api/contracts";
import { isRecord } from "../../src/utils/guard";

async function sample(name: string): Promise<unknown> {
  return Bun.file(new URL(`./samples/${name}.json`, import.meta.url)).json();
}

function parseUserPageRow(value: unknown): {
  userId: string;
  userName: string;
  createTime: string;
} {
  if (!isRecord(value)) throw new ApiContractError("page.row", "object");
  if (typeof value.userId !== "string" || typeof value.userName !== "string" || typeof value.createTime !== "string") {
    throw new ApiContractError("page.row", "typed user row");
  }
  return {
    userId: value.userId,
    userName: value.userName,
    createTime: value.createTime,
  };
}

describe("sanitized API contract samples", () => {
  test("parses login without exposing a real credential", async () => {
    const parsed = parseLoginResponse(await sample("login"));
    expect(parsed.token).toBe("sample-token-not-valid");
  });

  test("normalizes user IDs as strings and keeps backend date strings", async () => {
    const info = parseUserInfoResponse(await sample("get-info"));
    const page = parsePageResponse(await sample("user-page"), parseUserPageRow);
    expect(info.user.userId).toBe("9007199254740993");
    expect(page.rows[0]?.createTime).toBe("2026-08-25 09:30:00");
    expect(page.total).toBe(1);
  });

  test("parses nested route contracts", async () => {
    const parsed = parseRouterResponse(await sample("get-routers"));
    expect(parsed.data[0]?.children?.[0]?.path).toBe("user");
    expect(parsed.data[0]?.meta?.link).toBeNull();
  });

  test("rejects malformed envelopes and unsafe numeric IDs", () => {
    expect(() => parseLoginResponse({ code: 200 })).toThrow(ApiContractError);
    expect(() =>
      parseUserInfoResponse({
        code: 200,
        user: {
          userId: Number.MAX_SAFE_INTEGER + 1,
          userName: "sample",
          nickName: "sample",
          status: "0",
        },
        roles: [],
        permissions: [],
      }),
    ).toThrow("safe integer ID");
  });
});
