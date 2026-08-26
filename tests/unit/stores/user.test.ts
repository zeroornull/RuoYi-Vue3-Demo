import { beforeEach, describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryStore } from "../../../src/http/cache";
import type {
  LoginRequest,
  LoginResponse,
  UserInfoResponse,
} from "../../../src/types/api";
import {
  createUseUserStore,
  DEFAULT_ROLE,
  PASSWORD_CHARACTER_TYPE_KEY,
  resolveUserAvatar,
  type UserStoreDeps,
} from "../../../src/stores/modules/user-core";

beforeEach(() => {
  setActivePinia(createPinia());
});

function userInfo(overrides: Partial<UserInfoResponse> = {}): UserInfoResponse {
  return {
    code: 200,
    user: {
      userId: "9007199254740993",
      userName: "sample_user",
      nickName: "示例用户",
      avatar: "/profile/avatar.png",
      status: "0",
    },
    roles: ["admin"],
    permissions: ["system:user:list"],
    pwdChrtype: "3",
    isDefaultModifyPwd: false,
    isPasswordExpired: true,
    ...overrides,
  };
}

function createDeps(options: {
  initialToken?: string;
  login?: (data: LoginRequest) => Promise<LoginResponse>;
  getInfo?: () => Promise<UserInfoResponse>;
  logout?: () => Promise<unknown>;
} = {}): {
  deps: UserStoreDeps;
  token: { value: string | undefined };
  unlocks: { count: number };
  sessionStorage: ReturnType<typeof createMemoryStore>;
} {
  const token = { value: options.initialToken };
  const unlocks = { count: 0 };
  const sessionStorage = createMemoryStore();
  return {
    token,
    unlocks,
    sessionStorage,
    deps: {
      login: options.login ?? (async () => ({ code: 200, token: "token-1" })),
      getInfo: options.getInfo ?? (async () => userInfo()),
      logout: options.logout ?? (async () => ({ code: 200 })),
      readToken: () => token.value,
      writeToken: (value) => {
        token.value = value;
      },
      clearToken: () => {
        token.value = undefined;
      },
      clearAccess: () => undefined,
      unlockScreen: () => {
        unlocks.count += 1;
      },
      baseApi: "/dev-api",
      sessionStorage,
    },
  };
}

describe("user store lifecycle", () => {
  test("logs in, loads a nullable profile, then logs out consistently", async () => {
    let submittedUsername = "";
    const fixture = createDeps({
      login: async (data) => {
        submittedUsername = data.username;
        return { code: 200, token: "token-1" };
      },
    });
    const store = createUseUserStore(fixture.deps)();
    expect(store.profile).toBeNull();
    expect(store.rolesLoaded).toBe(false);
    expect(store.isAuthenticated).toBe(false);

    const loginPromise = store.login({
      username: " sample_user ",
      password: "not-a-real-password",
      code: "0000",
      uuid: "sample-uuid",
    });
    expect(loginPromise).toBeInstanceOf(Promise);
    await loginPromise;
    expect(submittedUsername).toBe("sample_user");
    expect(store.token).toBe("token-1");
    expect(fixture.token.value).toBe("token-1");
    expect(fixture.unlocks.count).toBe(1);

    await store.getInfo();
    expect(store.profile?.userId).toBe("9007199254740993");
    expect(store.name).toBe("sample_user");
    expect(store.avatar).toBe("/dev-api/profile/avatar.png");
    expect(store.roles).toEqual(["admin"]);
    expect(store.permissions).toEqual(["system:user:list"]);
    expect(store.rolesLoaded).toBe(true);
    expect(store.profileStatus).toBe("loaded");
    expect(store.passwordNotice).toBe("expired");
    expect(store.passwordCharacterType).toBe("3");
    expect(fixture.sessionStorage.get(PASSWORD_CHARACTER_TYPE_KEY)).toBe("3");

    await store.logOut();
    expect(store.token).toBeNull();
    expect(store.profile).toBeNull();
    expect(store.roles).toEqual([]);
    expect(store.permissions).toEqual([]);
    expect(fixture.token.value).toBeUndefined();
  });

  test("uses an explicit default role when the backend returns no roles", async () => {
    const fixture = createDeps({
      getInfo: async () => userInfo({ roles: [], permissions: [] }),
    });
    const store = createUseUserStore(fixture.deps)();
    await store.getInfo();
    expect(store.roles).toEqual([DEFAULT_ROLE]);
    expect(store.rolesLoaded).toBe(true);
  });

  test("does not drift token/profile state when API operations fail", async () => {
    const loginFailure = createDeps({
      login: async () => {
        throw new Error("login failed");
      },
    });
    const anonymous = createUseUserStore(loginFailure.deps)();
    await expect(
      anonymous.login({ username: "u", password: "p", code: "c", uuid: "id" }),
    ).rejects.toThrow("login failed");
    expect(anonymous.token).toBeNull();
    expect(loginFailure.token.value).toBeUndefined();
    expect(anonymous.operationStatus).toBe("error");

    setActivePinia(createPinia());
    const authenticatedFailure = createDeps({
      initialToken: "existing-token",
      getInfo: async () => {
        throw new Error("profile failed");
      },
      logout: async () => {
        throw new Error("logout failed");
      },
    });
    const authenticated = createUseUserStore(authenticatedFailure.deps)();
    await expect(authenticated.getInfo()).rejects.toThrow("profile failed");
    expect(authenticated.profile).toBeNull();
    expect(authenticated.profileStatus).toBe("error");
    await expect(authenticated.logOut()).rejects.toThrow("logout failed");
    expect(authenticated.token).toBe("existing-token");
    expect(authenticatedFailure.token.value).toBe("existing-token");
  });

  test("leaves absolute avatar URLs untouched", () => {
    expect(resolveUserAvatar("https://example.invalid/a.png", "/dev-api")).toBe(
      "https://example.invalid/a.png",
    );
  });

  test("patches profile and avatar without replacing the whole session", async () => {
    const fixture = createDeps();
    const store = createUseUserStore(fixture.deps)();
    await store.getInfo();
    store.applyProfile({ nickName: "新名字", email: "new@example.invalid" });
    expect(store.nickName).toBe("新名字");
    expect(store.profile?.email).toBe("new@example.invalid");
    expect(store.token).toBeNull();
    store.applyAvatar("/avatar/new.png");
    expect(store.avatar).toBe("/dev-api/avatar/new.png");
  });
});
