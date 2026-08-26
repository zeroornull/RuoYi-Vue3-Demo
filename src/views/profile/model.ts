import type { SystemUser, UserProfileUpdateRequest } from "../../types/api/system";
import { checkPassword } from "../../utils/password-rule";

export const PROFILE_COMPONENT_NAME = "Profile";
export const PROFILE_PHONE_PATTERN = /^1[3-9]\d{9}$/;

export type ProfileInfoForm = {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: "0" | "1" | "2";
};

export type ProfilePasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AvatarValidationError = {
  code: "type" | "size";
  message: string;
};

export function profileInfoFromUser(user: Partial<SystemUser> | null | undefined): ProfileInfoForm {
  const sex = user?.sex;
  return {
    nickName: user?.nickName ?? "",
    phonenumber: user?.phonenumber ?? "",
    email: user?.email ?? "",
    sex: sex === "1" || sex === "2" ? sex : "0",
  };
}

export function toProfileUpdateRequest(form: ProfileInfoForm): UserProfileUpdateRequest {
  return {
    nickName: form.nickName,
    phonenumber: form.phonenumber,
    email: form.email,
    sex: form.sex,
  };
}

export function emptyPasswordForm(): ProfilePasswordForm {
  return { oldPassword: "", newPassword: "", confirmPassword: "" };
}

export function profilePasswordError(password: string, chrType: string): string | null {
  const result = checkPassword(password, chrType);
  return result.ok ? null : result.message;
}

export function validateAvatarFile(file: { type: string; size: number }, maxMb = 5): AvatarValidationError | null {
  if (!file.type.startsWith("image/")) {
    return {
      code: "type",
      message: "文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。",
    };
  }
  if (maxMb > 0 && file.size / 1024 / 1024 >= maxMb) {
    return {
      code: "size",
      message: `上传头像图片大小不能超过 ${maxMb} MB!`,
    };
  }
  return null;
}

export function avatarUploadFormData(blob: Blob, filename: string): FormData {
  const data = new FormData();
  data.append("avatarfile", blob, filename);
  return data;
}

export function isValidPhone(value: string): boolean {
  return PROFILE_PHONE_PATTERN.test(value);
}
