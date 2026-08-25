export function parseStrEmpty(value: unknown): string {
  if (
    !value ||
    value === "undefined" ||
    value === "null"
  ) {
    return "";
  }
  return String(value);
}
