export const GLOBAL_SHARED_COMPONENT_NAMES = [
  "SvgIcon",
  "DictTag",
  "Pagination",
  "RightToolbar",
  "ImagePreview",
  "FileUpload",
  "ImageUpload",
  "Editor",
] as const;

export type GlobalSharedComponentName =
  (typeof GLOBAL_SHARED_COMPONENT_NAMES)[number];
