import type { DictItem } from "../../types/dict";

export type DictTagValue = number | string | boolean | readonly unknown[];

export type DictTagMatch = {
  matched: DictItem[];
  unmatched: string[];
};

function asTokens(
  value: DictTagValue | null | undefined,
  separator: string,
): string[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return String(value).split(separator);
}

function valuesEqual(left: unknown, right: unknown): boolean {
  return String(left) === String(right);
}

export function isPlainDictTag(item: DictItem): boolean {
  const type = item.elTagType ?? "";
  const klass = item.elTagClass ?? "";
  return (type === "default" || type === "") && klass === "";
}

export function matchDictTagValues(
  options: readonly DictItem[] | null | undefined,
  value: DictTagValue | null | undefined,
  separator = ",",
): DictTagMatch {
  const tokens = asTokens(value, separator);
  if (
    tokens.length === 0 ||
    !Array.isArray(options) ||
    options.length === 0
  ) {
    return { matched: [], unmatched: [] };
  }
  const matched = options.filter((item) =>
    tokens.some((token) => valuesEqual(token, item.value)),
  );
  const unmatched = tokens.filter(
    (token) => !options.some((item) => valuesEqual(token, item.value)),
  );
  return { matched, unmatched };
}

export function formatUnmatchedValues(values: readonly string[]): string {
  if (values.length === 0) {
    return "";
  }
  return values.reduce((previous, current) => `${previous} ${current}`);
}
