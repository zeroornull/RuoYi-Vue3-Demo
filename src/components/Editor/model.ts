export const EDITOR_EMPTY_HTML = "<p></p>";
export const EDITOR_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg",
  "image/svg+xml",
] as const;

export type EditorUploadMode = "url" | "base64";

export type EditorImageValidationError = {
  code: "type" | "size";
  message: string;
};

export type EditorToolbarItem =
  | string
  | Record<string, unknown>
  | Array<string | Record<string, unknown>>;

export const DEFAULT_EDITOR_TOOLBAR: EditorToolbarItem[] = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image", "video"],
];

export function normalizeEditorHtml(value: string | null | undefined): string {
  return value === undefined || value === null ? EDITOR_EMPTY_HTML : value;
}

export function validateEditorImage(
  file: { type: string; size: number },
  fileSizeMb: number,
): EditorImageValidationError | null {
  if (
    !EDITOR_IMAGE_MIME_TYPES.includes(
      file.type as (typeof EDITOR_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { code: "type", message: "图片格式错误!" };
  }
  if (fileSizeMb > 0 && file.size / 1024 / 1024 >= fileSizeMb) {
    return {
      code: "size",
      message: `上传文件大小不能超过 ${fileSizeMb} MB!`,
    };
  }
  return null;
}

export function editorImageUrl(baseApi: string, fileName: string): string {
  return `${baseApi}${fileName}`;
}

export function nextEditorIndex(
  selectionIndex: number | null | undefined,
): number {
  return typeof selectionIndex === "number" ? selectionIndex : 0;
}

export function isEditorImageClipboardItem(type: string): boolean {
  return type.includes("image");
}
