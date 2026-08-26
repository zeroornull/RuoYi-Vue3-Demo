import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  LoginRequest,
  LoginResponse,
  SystemUser,
  UserInfoResponse,
} from "../../types/api";
import { isHttp } from "../../utils/validate";
import type { StoreStorage } from "../persistence";

export type UserOperationStatus = "idle" | "loading" | "error";
export type UserProfileStatus = "idle" | "loading" | "loaded" | "error";
export type PasswordNotice = "initial" | "expired" | null;
export type PasswordCharacterType = "0" | "1" | "2" | "3" | "4";

export type UserStoreDeps = {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  getInfo: () => Promise<UserInfoResponse>;
  logout: () => Promise<unknown>;
  readToken: () => string | undefined;
  writeToken: (token: string) => void;
  clearToken: () => void;
  clearAccess: () => void;
  unlockScreen: () => void;
  baseApi: string;
  sessionStorage: StoreStorage;
};

export const PASSWORD_CHARACTER_TYPE_KEY = "pwrChrtype";
export const DEFAULT_ROLE = "ROLE_DEFAULT";

function parsePasswordCharacterType(
  value: string | undefined | null,
): PasswordCharacterType | null {
  return value === "0" ||
    value === "1" ||
    value === "2" ||
    value === "3" ||
    value === "4"
    ? value
    : null;
}

export function resolveUserAvatar(
  avatar: string | null | undefined,
  baseApi: string,
): string {
  if (!avatar) return "";
  if (isHttp(avatar)) return avatar;
  return `${baseApi.replace(/\/$/, "")}/${avatar.replace(/^\//, "")}`;
}

export function createUseUserStore(deps: UserStoreDeps) {
  return defineStore("user", () => {
    const token = ref<string | null>(deps.readToken() ?? null);
    const profile = ref<SystemUser | null>(null);
    const roles = ref<string[]>([]);
    const permissions = ref<string[]>([]);
    const rolesLoaded = ref(false);
    const operationStatus = ref<UserOperationStatus>("idle");
    const profileStatus = ref<UserProfileStatus>("idle");
    const passwordCharacterType = ref<PasswordCharacterType | null>(
      parsePasswordCharacterType(
        deps.sessionStorage.get(PASSWORD_CHARACTER_TYPE_KEY),
      ),
    );
    const passwordNotice = ref<PasswordNotice>(null);

    const isAuthenticated = computed(() => token.value !== null);
    const id = computed(() => profile.value?.userId ?? "");
    const name = computed(() => profile.value?.userName ?? "");
    const nickName = computed(() => profile.value?.nickName ?? "");
    const avatar = computed(() =>
      resolveUserAvatar(profile.value?.avatar, deps.baseApi),
    );

    function setPasswordCharacterType(value: string | undefined): void {
      const parsed = parsePasswordCharacterType(value);
      passwordCharacterType.value = parsed;
      if (parsed === null) {
        deps.sessionStorage.remove(PASSWORD_CHARACTER_TYPE_KEY);
      } else {
        deps.sessionStorage.set(PASSWORD_CHARACTER_TYPE_KEY, parsed);
      }
    }

    function resetSession(): void {
      deps.clearAccess();
      deps.clearToken();
      deps.sessionStorage.remove(PASSWORD_CHARACTER_TYPE_KEY);
      token.value = null;
      profile.value = null;
      roles.value = [];
      permissions.value = [];
      rolesLoaded.value = false;
      operationStatus.value = "idle";
      profileStatus.value = "idle";
      passwordCharacterType.value = null;
      passwordNotice.value = null;
    }

    async function login(data: LoginRequest): Promise<void> {
      operationStatus.value = "loading";
      try {
        const response = await deps.login({
          ...data,
          username: data.username.trim(),
        });
        deps.writeToken(response.token);
        token.value = response.token;
        deps.unlockScreen();
        operationStatus.value = "idle";
      } catch (error) {
        operationStatus.value = "error";
        throw error;
      }
    }

    async function getInfo(): Promise<UserInfoResponse> {
      profileStatus.value = "loading";
      try {
        const response = await deps.getInfo();
        profile.value = response.user;
        roles.value =
          response.roles.length > 0 ? [...response.roles] : [DEFAULT_ROLE];
        permissions.value = [...response.permissions];
        rolesLoaded.value = true;
        setPasswordCharacterType(response.pwdChrtype);
        passwordNotice.value = response.isDefaultModifyPwd
          ? "initial"
          : response.isPasswordExpired
            ? "expired"
            : null;
        profileStatus.value = "loaded";
        return response;
      } catch (error) {
        profileStatus.value = "error";
        throw error;
      }
    }

    async function logOut(): Promise<void> {
      operationStatus.value = "loading";
      try {
        await deps.logout();
        resetSession();
      } catch (error) {
        operationStatus.value = "error";
        throw error;
      }
    }

    return {
      token,
      profile,
      roles,
      permissions,
      rolesLoaded,
      operationStatus,
      profileStatus,
      passwordCharacterType,
      passwordNotice,
      isAuthenticated,
      id,
      name,
      nickName,
      avatar,
      login,
      getInfo,
      logOut,
      resetSession,
    };
  });
}
