const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export function parseTime(
  time?: Date | string | number | null,
  pattern?: string,
): string | null {
  if (!time) {
    return null;
  }

  const format = pattern ?? "{y}-{m}-{d} {h}:{i}:{s}";
  let date: Date;

  if (typeof time === "object") {
    date = time;
  } else {
    let value: string | number = time;
    if (typeof value === "string" && /^[0-9]+$/.test(value)) {
      value = Number.parseInt(value, 10);
    } else if (typeof value === "string") {
      value = value
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d{3}/g, "");
    }
    if (typeof value === "number" && value.toString().length === 10) {
      value *= 1000;
    }
    date = new Date(value);
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };

  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key: keyof typeof formatObj) => {
    const raw = formatObj[key];
    if (key === "a") {
      return WEEKDAYS[raw] ?? "日";
    }
    let value: string | number = raw;
    if (result.length > 0 && raw < 10) {
      value = `0${raw}`;
    }
    return value === 0 ? "0" : String(value);
  });
}
