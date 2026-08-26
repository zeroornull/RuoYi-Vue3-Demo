export type PasswordChrType = "0" | "1" | "2" | "3" | "4";

const PWD_RULES: Record<PasswordChrType, { pattern: RegExp; message: string }> = {
  "0": {
    pattern: /^[^<>"'|\\]+$/,
    message: "密码不能包含非法字符：< > \" ' \\ |",
  },
  "1": { pattern: /^[0-9]+$/, message: "密码只能为数字（0-9）" },
  "2": {
    pattern: /^[a-zA-Z]+$/,
    message: "密码只能为英文字母（a-z、A-Z）",
  },
  "3": {
    pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/,
    message: "密码必须同时包含字母和数字",
  },
  "4": {
    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()\-=_+])[A-Za-z\d~!@#$%^&*()\-=_+]+$/,
    message: "密码必须同时包含字母、数字和特殊字符（~!@#$%^&*()-=_+）",
  },
};

export function getPasswordRule(chrType: string): {
  pattern: RegExp;
  message: string;
} {
  if (chrType === "1" || chrType === "2" || chrType === "3" || chrType === "4") {
    return PWD_RULES[chrType];
  }
  return PWD_RULES["0"];
}

export type PasswordCheck = { ok: true } | { ok: false; message: string };

export function checkPassword(value: string, chrType: string = "0"): PasswordCheck {
  if (!value || value.length < 6 || value.length > 20) {
    return { ok: false, message: "密码长度必须介于 6 和 20 之间" };
  }
  const rule = getPasswordRule(chrType);
  if (!rule.pattern.test(value)) {
    return { ok: false, message: rule.message };
  }
  return { ok: true };
}
