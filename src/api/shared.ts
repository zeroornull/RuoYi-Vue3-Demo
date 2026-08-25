import type { IdCollection } from "../types/api";

export function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function encodeIdCollection(ids: IdCollection): string {
  const values = Array.isArray(ids) ? ids : [ids];
  return values.map(encodePathSegment).join(",");
}

export function optionalPathId(id?: string): string {
  return id === undefined ? "" : encodePathSegment(id);
}
