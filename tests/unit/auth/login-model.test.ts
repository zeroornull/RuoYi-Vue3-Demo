import { describe, expect, test } from "bun:test";
import {
  applyCaptcha,
  canSubmitAuth,
  captchaDataUrl,
  nextAuthStatus,
  passwordsMatch,
  readRememberMe,
  registerPasswordMessage,
  safeLoginRedirect,
  toLoginRequest,
  writeRememberMe,
  type CookieJar,
} from "../../../src/views/auth/model";
import { createRsaCipher } from "../../../src/utils/jsencrypt";

function memoryCookies(): CookieJar & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: (name) => data.get(name),
    set: (name, value) => {
      data.set(name, value);
    },
    remove: (name) => {
      data.delete(name);
    },
  };
}

describe("login and captcha boundaries", () => {
  test("builds captcha data URLs and disables when the backend says so", () => {
    expect(captchaDataUrl("abc")).toBe("data:image/gif;base64,abc");
    expect(captchaDataUrl("data:image/png;base64,xx")).toBe("data:image/png;base64,xx");
    const form = { uuid: "old" };
    expect(applyCaptcha(form, { captchaEnabled: false })).toEqual({
      captchaEnabled: false,
      codeUrl: "",
    });
    expect(form.uuid).toBe("");
    const enabled = applyCaptcha(form, { img: "xyz", uuid: "u-1", captchaEnabled: true });
    expect(enabled.captchaEnabled).toBe(true);
    expect(form.uuid).toBe("u-1");
  });

  test("blocks double submit and recovers after error", () => {
    expect(canSubmitAuth("idle")).toBe(true);
    expect(canSubmitAuth("submitting")).toBe(false);
    expect(nextAuthStatus("idle", "submit")).toBe("submitting");
    expect(nextAuthStatus("submitting", "success")).toBe("success");
    expect(nextAuthStatus("submitting", "error")).toBe("error");
    expect(nextAuthStatus("error", "reset")).toBe("idle");
  });

  test("only follows same-origin relative redirects", () => {
    expect(safeLoginRedirect({})).toEqual({ path: "/index" });
    expect(safeLoginRedirect({ redirect: "/user/profile" })).toEqual({
      path: "/user/profile",
    });
    expect(safeLoginRedirect({ redirect: "https://evil.example" })).toEqual({
      path: "/index",
    });
    expect(safeLoginRedirect({ redirect: "//evil.example" })).toEqual({
      path: "/index",
    });
    expect(safeLoginRedirect({ redirect: "/user/profile?source=notice", keep: "1" })).toEqual({
      path: "/user/profile",
      query: { keep: "1", source: "notice" },
    });
  });
});

describe("remember-me cookies", () => {
  test("stores an encrypted password and never writes plaintext", () => {
    const cookies = memoryCookies();
    const cipher = createRsaCipher();
    writeRememberMe(cookies, cipher, {
      username: "admin",
      password: "admin123",
      rememberMe: true,
    });
    expect(cookies.data.get("username")).toBe("admin");
    expect(cookies.data.get("rememberMe")).toBe("true");
    const stored = cookies.data.get("password") ?? "";
    expect(stored).not.toBe("admin123");
    expect(stored.length).toBeGreaterThan(20);
    const restored = readRememberMe(cookies, cipher);
    expect(restored.username).toBe("admin");
    expect(restored.password).toBe("admin123");
    expect(restored.rememberMe).toBe(true);
    writeRememberMe(cookies, cipher, {
      username: "admin",
      password: "admin123",
      rememberMe: false,
    });
    expect(cookies.data.size).toBe(0);
  });
});

describe("register helpers", () => {
  test("trims usernames and checks password confirmation", () => {
    expect(
      toLoginRequest({
        username: "  admin  ",
        password: "secret",
        rememberMe: false,
        code: "1",
        uuid: "u",
      }).username,
    ).toBe("admin");
    expect(passwordsMatch("a", "a")).toBe(true);
    expect(passwordsMatch("a", "b")).toBe(false);
    expect(registerPasswordMessage("123")).not.toBeNull();
    expect(registerPasswordMessage("admin123")).toBeNull();
  });
});
