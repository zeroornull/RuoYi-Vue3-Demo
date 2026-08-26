import { describe, expect, test } from "bun:test";
import { formatLockDate, formatLockTime, unlockErrorMessage } from "../../../src/views/lock/model";
import {
  avatarUploadFormData,
  emptyPasswordForm,
  isValidPhone,
  profileInfoFromUser,
  profilePasswordError,
  toProfileUpdateRequest,
  validateAvatarFile,
} from "../../../src/views/profile/model";
import { shouldHistoryBack, unauthorizedBackTarget } from "../../../src/views/error/model";

describe("lock screen clock and errors", () => {
  test("formats time/date and surfaces unlock failures", () => {
    const now = new Date("2026-08-26T08:05:09");
    expect(formatLockTime(now)).toBe("08:05:09");
    expect(formatLockDate(now)).toContain("2026年8月26日");
    expect(unlockErrorMessage(new Error("密码错误"))).toBe("密码错误");
    expect(unlockErrorMessage({})).toBe("解锁失败，请重试");
  });
});

describe("profile forms and avatar", () => {
  test("maps profile fields and validates phone/password", () => {
    const form = profileInfoFromUser({
      nickName: "张三",
      phonenumber: "13800138000",
      email: "a@b.c",
      sex: "1",
    });
    expect(toProfileUpdateRequest(form)).toEqual({
      nickName: "张三",
      phonenumber: "13800138000",
      email: "a@b.c",
      sex: "1",
    });
    expect(isValidPhone("13800138000")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(profilePasswordError("123", "0")).not.toBeNull();
    expect(emptyPasswordForm().oldPassword).toBe("");
  });

  test("rejects non-image and oversized avatars and builds FormData", () => {
    expect(validateAvatarFile({ type: "application/pdf", size: 10 })?.code).toBe("type");
    expect(validateAvatarFile({ type: "image/png", size: 6 * 1024 * 1024 })?.code).toBe("size");
    expect(validateAvatarFile({ type: "image/jpeg", size: 1024 })).toBeNull();
    const data = avatarUploadFormData(new Blob(["x"]), "face.png");
    expect(data.get("avatarfile")).toBeInstanceOf(Blob);
  });
});

describe("401 back navigation", () => {
  test("returns home when noGoBack is set", () => {
    expect(unauthorizedBackTarget({ noGoBack: "true" })).toEqual({ path: "/" });
    expect(shouldHistoryBack(unauthorizedBackTarget({}))).toBe(true);
  });
});
