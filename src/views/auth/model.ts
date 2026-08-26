import type { LocationQuery, RouteLocationRaw } from "vue-router";
import type { LoginRequest } from "../../types/api/auth";
import { checkPassword } from "../../utils/password-rule";
import type { TextCipher } from "../../utils/jsencrypt";

export type AuthSubmitStatus = "idle" | "submitting" | "success" | "error";

export type LoginFormModel = LoginRequest & {
  rememberMe: boolean;
};

export type RegisterFormModel = LoginRequest & {
  confirmPassword: string;
};

export type CookieJar = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: { expires: number }) => void;
  remove: (name: string) => void;
};

export const REMEMBER_COOKIE = {
  username: "username",
  password: "password",
  rememberMe: "rememberMe",
} as const;

export const REMEMBER_ME_DAYS = 30;
export const DEFAULT_LOGIN_USERNAME = "admin";
export const DEFAULT_LOGIN_PASSWORD = "admin123";

export const LOGIN_REQUIRED_MESSAGES = {
  username: "请输入您的账号",
  password: "请输入您的密码",
  code: "请输入验证码",
} as const;

export function emptyLoginForm(): LoginFormModel {
  return {
    username: DEFAULT_LOGIN_USERNAME,
    password: DEFAULT_LOGIN_PASSWORD,
    rememberMe: false,
    code: "",
    uuid: "",
  };
}

export function emptyRegisterForm(): RegisterFormModel {
  return {
    username: "",
    password: "",
    confirmPassword: "",
    code: "",
    uuid: "",
  };
}

export function captchaDataUrl(img: string): string {
  if (img.length === 0) {
    return "";
  }
  return img.startsWith("data:") ? img : `data:image/gif;base64,${img}`;
}

export function applyCaptcha(
  form: { uuid: string },
  payload: { img?: string; uuid?: string; captchaEnabled?: boolean },
): { captchaEnabled: boolean; codeUrl: string } {
  const captchaEnabled = payload.captchaEnabled !== false;
  if (!captchaEnabled) {
    form.uuid = "";
    return { captchaEnabled: false, codeUrl: "" };
  }
  form.uuid = payload.uuid ?? "";
  return {
    captchaEnabled: true,
    codeUrl: captchaDataUrl(payload.img ?? ""),
  };
}

export function nextAuthStatus(
  current: AuthSubmitStatus,
  event: "submit" | "success" | "error" | "reset",
): AuthSubmitStatus {
  if (event === "reset") {
    return "idle";
  }
  if (event === "submit") {
    return current === "submitting" ? "submitting" : "submitting";
  }
  if (event === "success") {
    return "success";
  }
  return "error";
}

export function canSubmitAuth(status: AuthSubmitStatus): boolean {
  return status !== "submitting";
}

export function writeRememberMe(
  cookies: CookieJar,
  cipher: TextCipher,
  form: Pick<LoginFormModel, "username" | "password" | "rememberMe">,
): void {
  if (!form.rememberMe) {
    cookies.remove(REMEMBER_COOKIE.username);
    cookies.remove(REMEMBER_COOKIE.password);
    cookies.remove(REMEMBER_COOKIE.rememberMe);
    return;
  }
  const encrypted = cipher.encrypt(form.password);
  cookies.set(REMEMBER_COOKIE.username, form.username, {
    expires: REMEMBER_ME_DAYS,
  });
  cookies.set(REMEMBER_COOKIE.rememberMe, "true", { expires: REMEMBER_ME_DAYS });
  if (encrypted) {
    cookies.set(REMEMBER_COOKIE.password, encrypted, {
      expires: REMEMBER_ME_DAYS,
    });
  } else {
    cookies.remove(REMEMBER_COOKIE.password);
  }
}

export function readRememberMe(cookies: CookieJar, cipher: TextCipher, fallback = emptyLoginForm()): LoginFormModel {
  const username = cookies.get(REMEMBER_COOKIE.username);
  const encrypted = cookies.get(REMEMBER_COOKIE.password);
  const rememberMe = cookies.get(REMEMBER_COOKIE.rememberMe);
  const decrypted = encrypted ? cipher.decrypt(encrypted) : false;
  return {
    ...fallback,
    username: username ?? fallback.username,
    password: decrypted || fallback.password,
    rememberMe: rememberMe === "true",
    code: "",
    uuid: fallback.uuid,
  };
}

export function safeLoginRedirect(query: LocationQuery): RouteLocationRaw {
  const redirect = query.redirect;
  const path =
    typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("://")
      ? (redirect.split("?")[0] ?? "/index")
      : "/index";
  const rest: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(query)) {
    if (key === "redirect" || value === undefined || value === null) {
      continue;
    }
    rest[key] = Array.isArray(value) ? value.filter((item): item is string => item !== null) : value;
  }
  const search = typeof redirect === "string" ? redirect.split("?")[1] : undefined;
  if (search) {
    for (const pair of search.split("&")) {
      const [key, raw] = pair.split("=");
      if (key && !(key in rest)) {
        rest[key] = decodeURIComponent(raw ?? "");
      }
    }
  }
  return Object.keys(rest).length > 0 ? { path, query: rest } : { path };
}

export function toLoginRequest(form: LoginFormModel): LoginRequest {
  return {
    username: form.username.trim(),
    password: form.password,
    code: form.code,
    uuid: form.uuid,
  };
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm;
}

export function registerPasswordMessage(password: string): string | null {
  const result = checkPassword(password, "0");
  return result.ok ? null : result.message;
}
