import { isExternal } from "../../utils/validate";

export function toCssSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function resolveMediaUrl(src: string, baseApi: string): string {
  if (src.length === 0) {
    return src;
  }
  return isExternal(src) ? src : `${baseApi}${src}`;
}

export function previewSourceList(src: string, baseApi: string): string[] {
  if (src.length === 0) {
    return [];
  }
  return src
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => resolveMediaUrl(item, baseApi));
}

export function primaryPreviewSource(src: string, baseApi: string): string {
  return previewSourceList(src, baseApi)[0] ?? "";
}
