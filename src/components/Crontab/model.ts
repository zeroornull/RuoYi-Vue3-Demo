export type CrontabField = "second" | "min" | "hour" | "day" | "month" | "week" | "year";

export type CrontabValue = Record<CrontabField, string>;

export const CRONTAB_FIELDS: readonly CrontabField[] = ["second", "min", "hour", "day", "month", "week", "year"];

export const DEFAULT_CRONTAB: CrontabValue = {
  second: "*",
  min: "*",
  hour: "*",
  day: "*",
  month: "*",
  week: "?",
  year: "",
};

export function clampCronNumber(value: number, minLimit: number, maxLimit: number): number {
  const integer = Math.floor(value);
  if (integer < minLimit) {
    return minLimit;
  }
  if (integer > maxLimit) {
    return maxLimit;
  }
  return integer;
}

export function stringifyCrontab(value: CrontabValue): string {
  const base = `${value.second} ${value.min} ${value.hour} ${value.day} ${value.month} ${value.week}`;
  return value.year === "" ? base : `${base} ${value.year}`;
}

export function parseCrontab(expression: string): CrontabValue {
  const tokens = expression
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  if (tokens.length < 6) {
    return { ...DEFAULT_CRONTAB };
  }
  return {
    second: tokens[0] ?? DEFAULT_CRONTAB.second,
    min: tokens[1] ?? DEFAULT_CRONTAB.min,
    hour: tokens[2] ?? DEFAULT_CRONTAB.hour,
    day: tokens[3] ?? DEFAULT_CRONTAB.day,
    month: tokens[4] ?? DEFAULT_CRONTAB.month,
    week: tokens[5] ?? DEFAULT_CRONTAB.week,
    year: tokens[6] ?? "",
  };
}

export function cronRange(start: number, end: number): string {
  return `${start}-${end}`;
}

export function cronStep(start: number, step: number): string {
  return `${start}/${step}`;
}

export function cronList(values: readonly number[]): string {
  return values.join(",");
}

export function shouldShowCrontabField(hideComponent: readonly string[], field: CrontabField): boolean {
  return !hideComponent.includes(field);
}

export type CronRadioKind = "every" | "unspecified" | "range" | "step" | "list" | "workday" | "last" | "nth" | "empty";

export function classifyCronToken(value: string): CronRadioKind {
  if (value === "") {
    return "empty";
  }
  if (value === "*") {
    return "every";
  }
  if (value === "?") {
    return "unspecified";
  }
  if (value.includes("-")) {
    return "range";
  }
  if (value.includes("/")) {
    return "step";
  }
  if (value.includes("W")) {
    return "workday";
  }
  if (value.includes("#")) {
    return "nth";
  }
  if (value.includes("L")) {
    return "last";
  }
  return "list";
}
