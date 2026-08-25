import type { DictMap } from "@/types/dict";

export function selectDictLabel(
  datas: DictMap,
  value: unknown,
): string {
  if (value === undefined) {
    return "";
  }
  const matched: string[] = [];
  for (const key of Object.keys(datas)) {
    const item = datas[key];
    if (item && item.value == `${value}`) {
      matched.push(item.label);
      break;
    }
  }
  if (matched.length === 0) {
    matched.push(String(value));
  }
  return matched.join("");
}

export function selectDictLabels(
  datas: DictMap,
  value: unknown,
  separator?: string,
): string {
  if (
    value === undefined ||
    (typeof value === "string" && value.length === 0) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return "";
  }
  const normalized = Array.isArray(value) ? value.join(",") : String(value);
  const currentSeparator = separator === undefined ? "," : separator;
  const actions: string[] = [];
  const temp = normalized.split(currentSeparator);
  for (const token of temp) {
    let match = false;
    for (const key of Object.keys(datas)) {
      const item = datas[key];
      if (item && item.value == `${token}`) {
        actions.push(item.label + currentSeparator);
        match = true;
      }
    }
    if (!match) {
      actions.push(token + currentSeparator);
    }
  }
  const joined = actions.join("");
  return joined.substring(0, joined.length - 1);
}
