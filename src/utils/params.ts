import type { DateRange, SearchParams } from "@/types/query";

export function tansParams(params: Record<string, unknown>): string {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        const nested = value as Record<string, unknown>;
        for (const key of Object.keys(nested)) {
          const nestedValue = nested[key];
          if (
            nestedValue !== null &&
            nestedValue !== "" &&
            typeof nestedValue !== "undefined"
          ) {
            const nestedName = `${propName}[${key}]`;
            result += `${encodeURIComponent(nestedName)}=${encodeURIComponent(String(nestedValue))}&`;
          }
        }
      } else {
        result += `${part}${encodeURIComponent(String(value))}&`;
      }
    }
  }
  return result;
}

export function addDateRange<T extends SearchParams>(
  params: T,
  dateRange?: DateRange,
  propName?: string,
): T {
  const search = params;
  search.params =
    typeof search.params === "object" &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {};
  const range = Array.isArray(dateRange) ? dateRange : [];
  if (typeof propName === "undefined") {
    search.params.beginTime = range[0];
    search.params.endTime = range[1];
  } else {
    search.params[`begin${propName}`] = range[0];
    search.params[`end${propName}`] = range[1];
  }
  return search;
}
