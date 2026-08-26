import { beforeEach, describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { createMemoryStore } from "../../../src/http/cache";
import { staticRoutes } from "../../../src/router/routes";
import { ROUTE_NAMES } from "../../../src/router/types";
import { createUseLockStore } from "../../../src/stores/modules/lock";
import { createUseUserStore, type UserStoreDeps } from "../../../src/stores/modules/user-core";
import type { LoginRequest, UserInfoResponse } from "../../../src/types/api";
import { nextAuthStatus } from "../../../src/views/auth/model";

beforeEach(() => {
  setActivePinia(createPinia());
});

function info(): UserInfoResponse {
  return {
    code: 200,
    user: {
      userId: "1",
      userName: "admin",
      nickName: "管理员",
      avatar: "/avatar.png",
      email: "a@b.c",
      phonenumber: "13800138000",
      status: "0",
    },
    roles: ["admin"],
    permissions: ["*:*:*"],
  };
}

function userDeps(
  options: {
    login?: UserStoreDeps["login"];
  } = {},
): UserStoreDeps {
  const token = { value: undefined as string | undefined };
  return {
    login: options.login ?? (async (_data: LoginRequest) => ({ code: 200, token: "token-1" })),
    getInfo: async () => info(),
    logout: async () => ({ code: 200 }),
    readToken: () => token.value,
    writeToken: (value) => {
      token.value = value;
    },
    clearToken: () => {
      token.value = undefined;
    },
    clearAccess: () => undefined,
    unlockScreen: () => undefined,
    baseApi: "/dev-api",
    sessionStorage: createMemoryStore(),
  };
}

describe("authentication and profile session loop", () => {
  test("login writes token then profile patches stay after a failed refresh", async () => {
    const store = createUseUserStore(userDeps())();
    expect(nextAuthStatus("idle", "submit")).toBe("submitting");
    await store.login({
      username: "admin",
      password: "admin123",
      code: "1",
      uuid: "u",
    });
    expect(store.token).toBe("token-1");
    await store.getInfo();
    store.applyProfile({ nickName: "新昵称", email: "new@x.com" });
    expect(store.nickName).toBe("新昵称");
    expect(store.profile?.email).toBe("new@x.com");
  });

  test("lock then unlock restores the saved path; logout lands on login", async () => {
    const lock = createUseLockStore(createMemoryStore())();
    lock.lockScreen("/user/profile");
    expect(lock.isLock).toBe(true);
    expect(lock.lockPath).toBe("/user/profile");
    lock.unlockScreen();
    expect(lock.isLock).toBe(false);

    const store = createUseUserStore(userDeps())();
    await store.login({
      username: "admin",
      password: "admin123",
      code: "1",
      uuid: "u",
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: staticRoutes,
    });
    await router.push("/lock");
    await store.logOut();
    await router.replace({ name: ROUTE_NAMES.login });
    expect(store.token).toBeNull();
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.login);
  });

  test("failed login does not write a token", async () => {
    const store = createUseUserStore(
      userDeps({
        login: async () => {
          throw new Error("验证码错误");
        },
      }),
    )();
    await expect(
      store.login({
        username: "admin",
        password: "bad",
        code: "0000",
        uuid: "u",
      }),
    ).rejects.toThrow("验证码错误");
    expect(store.token).toBeNull();
    expect(store.operationStatus).toBe("error");
  });
});
