import { beforeEach, describe, expect, test } from "bun:test";
import { parseBackendRoutes } from "../../../src/router/backend-dto";
import { staticRoutes } from "../../../src/router/routes";
import { transformBackendRoutes } from "../../../src/router/transform";
import { assertUniqueRouteNames } from "../../../src/router/types";
import {
  dispatchMockRequest,
  MOCK_PASSWORD,
  MOCK_TOKEN,
  MOCK_USERNAME,
  resetMockAuthState,
  tokenFromAuthorization,
} from "../../../vite/mock/auth.ts";

beforeEach(() => {
  resetMockAuthState();
});

describe("local auth mock", () => {
  test("serves a captcha image without a Java backend", () => {
    const result = dispatchMockRequest({
      method: "GET",
      path: "/captchaImage",
    });
    expect(result.body.code).toBe(200);
    expect(result.body.captchaEnabled).toBe(true);
    expect(String(result.body.img).length).toBeGreaterThan(10);
    expect(result.body.uuid).toBe("mock-captcha-uuid");
  });

  test("rejects a bad password and accepts the demo admin account", () => {
    expect(
      dispatchMockRequest({
        method: "POST",
        path: "/login",
        body: { username: MOCK_USERNAME, password: "nope", code: "1" },
      }).body.msg,
    ).toBe("用户不存在/密码错误");
    const login = dispatchMockRequest({
      method: "POST",
      path: "/login",
      body: {
        username: MOCK_USERNAME,
        password: MOCK_PASSWORD,
        code: "abcd",
      },
    });
    expect(login.body).toEqual({
      code: 200,
      msg: "操作成功",
      token: MOCK_TOKEN,
    });
  });

  test("protects getInfo/getRouters and patches profile locally", () => {
    expect(
      dispatchMockRequest({ method: "GET", path: "/getInfo" }).body.code,
    ).toBe(401);
    const info = dispatchMockRequest({
      method: "GET",
      path: "/getInfo",
      token: MOCK_TOKEN,
    });
    expect(info.body.code).toBe(200);
    const routers = dispatchMockRequest({
      method: "GET",
      path: "/getRouters",
      token: MOCK_TOKEN,
    });
    expect(Array.isArray(routers.body.data)).toBe(true);
    dispatchMockRequest({
      method: "PUT",
      path: "/system/user/profile",
      token: MOCK_TOKEN,
      body: { nickName: "本地管理员" },
    });
    const profile = dispatchMockRequest({
      method: "GET",
      path: "/system/user/profile",
      token: MOCK_TOKEN,
    });
    expect((profile.body.data as { nickName: string }).nickName).toBe(
      "本地管理员",
    );
    expect(tokenFromAuthorization("Bearer mock-admin-token")).toBe(MOCK_TOKEN);
    const dtos = parseBackendRoutes(routers.body.data);
    const transformed = transformBackendRoutes(dtos);
    expect(() =>
      assertUniqueRouteNames([...staticRoutes, ...transformed.routes]),
    ).not.toThrow();
  });
});
