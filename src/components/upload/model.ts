import type { UploadFileResponse } from "../../types/api/common";
import { isRecord } from "../../utils/guard";
import { isExternal } from "../../utils/validate";

export type UploadFileItem = {
  name: string;
  url: string;
  uid: number;
};

export type UploadValue = string | UploadFileItem | readonly UploadFileItem[];

export type UploadValidationError = {
  code: "type" | "size" | "comma" | "limit";
  message: string;
};

export type UploadKind = "file" | "image";

const DEFAULT_FILE_TYPES = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "pdf"] as const;

const DEFAULT_IMAGE_TYPES = ["png", "jpg", "jpeg"] as const;

export function defaultFileTypes(kind: UploadKind): readonly string[] {
  return kind === "image" ? DEFAULT_IMAGE_TYPES : DEFAULT_FILE_TYPES;
}

export function fileExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index > -1 ? name.slice(index + 1).toLowerCase() : "";
}

export function uploadHeaders(token: string | undefined): {
  Authorization?: string;
} {
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function uploadActionUrl(baseApi: string, action: string): string {
  return `${baseApi}${action}`;
}

function asItem(value: string | UploadFileItem, uid: number): UploadFileItem {
  if (typeof value === "string") {
    return { name: value, url: value, uid };
  }
  return {
    name: value.name,
    url: value.url,
    uid: value.uid || uid,
  };
}

export function parseUploadValue(
  value: UploadValue | null | undefined,
  options: { baseUrl?: string; prefixBase?: boolean } = {},
): UploadFileItem[] {
  if (!value) {
    return [];
  }
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").filter((item) => item.length > 0)
      : [value];
  const baseUrl = options.baseUrl ?? "";
  return list.map((item, index) => {
    const parsed = asItem(item, Date.now() + index + 1);
    if (options.prefixBase && baseUrl.length > 0 && parsed.url.indexOf(baseUrl) === -1 && !isExternal(parsed.url)) {
      const prefixed = `${baseUrl}${parsed.url}`;
      return { ...parsed, name: prefixed, url: prefixed };
    }
    return parsed;
  });
}

export function stringifyUploadValue(
  list: readonly UploadFileItem[],
  options: { baseUrl?: string; stripBlob?: boolean } = {},
): string {
  const baseUrl = options.baseUrl ?? "";
  const names = list.flatMap((item) => {
    if (!item.url) {
      return [];
    }
    if (options.stripBlob && item.url.startsWith("blob:")) {
      return [];
    }
    return [baseUrl.length > 0 ? item.url.replace(baseUrl, "") : item.url];
  });
  return names.join(",");
}

export function moveUploadItem(list: readonly UploadFileItem[], from: number, to: number): UploadFileItem[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return [...list];
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (!moved) {
    return next;
  }
  next.splice(to, 0, moved);
  return next;
}

export function displayFileName(name: string): string {
  return name.lastIndexOf("/") > -1 ? name.slice(name.lastIndexOf("/") + 1) : name;
}

export function isUploadSuccess(response: unknown): response is UploadFileResponse {
  return isRecord(response) && response.code === 200 && typeof response.fileName === "string";
}

export function uploadSuccessItem(response: UploadFileResponse): UploadFileItem {
  return {
    name: response.fileName,
    url: response.fileName,
    uid: Date.now(),
  };
}

export function validateUploadFile(
  file: { name: string; size: number; type: string },
  options: {
    kind: UploadKind;
    fileType: readonly string[];
    fileSizeMb: number;
  },
): UploadValidationError | null {
  if (file.name.includes(",")) {
    return { code: "comma", message: "文件名不正确，不能包含英文逗号!" };
  }
  const extension = fileExtension(file.name);
  if (options.kind === "file") {
    if (options.fileType.length > 0 && !options.fileType.some((type) => type.toLowerCase() === extension)) {
      return {
        code: "type",
        message: `文件格式不正确，请上传${options.fileType.join("/")}格式文件!`,
      };
    }
  } else if (options.fileType.length > 0) {
    const matched = options.fileType.some((type) => {
      const normalized = type.toLowerCase();
      return file.type.toLowerCase().includes(normalized) || extension === normalized;
    });
    if (!matched) {
      return {
        code: "type",
        message: `文件格式不正确，请上传${options.fileType.join("/")}图片格式文件!`,
      };
    }
  } else if (!file.type.includes("image")) {
    return {
      code: "type",
      message: "文件格式不正确，请上传图片格式文件!",
    };
  }
  if (options.fileSizeMb > 0 && file.size / 1024 / 1024 >= options.fileSizeMb) {
    return {
      code: "size",
      message:
        options.kind === "image"
          ? `上传头像图片大小不能超过 ${options.fileSizeMb} MB!`
          : `上传文件大小不能超过 ${options.fileSizeMb} MB!`,
    };
  }
  return null;
}

export function limitExceededMessage(limit: number): string {
  return `上传文件数量不能超过 ${limit} 个!`;
}

export function isExcelFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".xls") || lower.endsWith(".xlsx");
}

export function excelUploadUrl(baseApi: string, action: string, updateSupport: boolean): string {
  return `${baseApi}${action}?updateSupport=${updateSupport ? 1 : 0}`;
}
