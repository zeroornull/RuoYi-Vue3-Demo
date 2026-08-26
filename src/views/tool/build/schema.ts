import { isRecord } from "../../../utils/guard";

export const BUILD_PAGE_NAME = "Build";
export const MAX_SCHEMA_DEPTH = 8;

export type DrawingKind = "input" | "textarea" | "select" | "radio" | "upload" | "tree" | "row";

export const DRAWING_KINDS: readonly DrawingKind[] = ["input", "textarea", "select", "radio", "upload", "tree", "row"];

export type SelectOption = {
  label: string;
  value: string | number;
};

export type TreeOption = {
  id: number;
  label: string;
  value: string | number;
  children?: TreeOption[];
};

export type FormConf = {
  formRef: string;
  formModel: string;
  size: "large" | "default" | "small";
  labelPosition: "left" | "right" | "top";
  labelWidth: number;
  gutter: number;
  disabled: boolean;
  span: number;
  formBtns: boolean;
};

type FieldBase = {
  formId: number;
  renderKey: string;
  vModel: string;
  label: string;
  span: number;
  required: boolean;
  disabled: boolean;
  document: string;
  tagIcon: string;
};

export type InputItem = FieldBase & {
  kind: "input";
  tag: "el-input";
  placeholder: string;
  clearable: boolean;
  maxlength: number | null;
  showWordLimit: boolean;
  prefixIcon: string;
};

export type TextareaItem = FieldBase & {
  kind: "textarea";
  tag: "el-input";
  placeholder: string;
  minRows: number;
  maxRows: number;
};

export type SelectItem = FieldBase & {
  kind: "select";
  tag: "el-select";
  placeholder: string;
  clearable: boolean;
  multiple: boolean;
  options: SelectOption[];
};

export type RadioItem = FieldBase & {
  kind: "radio";
  tag: "el-radio-group";
  options: SelectOption[];
};

export type UploadItem = FieldBase & {
  kind: "upload";
  tag: "el-upload";
  action: string;
  accept: string;
  buttonText: string;
  fileSize: number;
  sizeUnit: "KB" | "MB" | "GB";
};

export type TreeItem = FieldBase & {
  kind: "tree";
  tag: "el-tree";
  data: TreeOption[];
  showCheckbox: boolean;
};

export type RowItem = {
  kind: "row";
  formId: number;
  renderKey: string;
  tag: "el-row";
  tagIcon: "row";
  componentName: string;
  gutter: number;
  span: 24;
  children: DrawingItem[];
  document: string;
};

export type DrawingItem = InputItem | TextareaItem | SelectItem | RadioItem | UploadItem | TreeItem | RowItem;

export type FieldItem = Exclude<DrawingItem, RowItem>;

export function isDrawingKind(value: unknown): value is DrawingKind {
  return typeof value === "string" && (DRAWING_KINDS as readonly string[]).includes(value);
}

export function isRowItem(item: DrawingItem): item is RowItem {
  return item.kind === "row";
}

export function emptyFormConf(): FormConf {
  return {
    formRef: "formRef",
    formModel: "formData",
    size: "default",
    labelPosition: "right",
    labelWidth: 100,
    gutter: 15,
    disabled: false,
    span: 24,
    formBtns: true,
  };
}

export function createIdAllocator(start = 100): () => number {
  let current = start;
  return () => {
    current += 1;
    return current;
  };
}

function renderKey(): string {
  return `rk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultOptions = (): SelectOption[] => [
  { label: "选项一", value: 1 },
  { label: "选项二", value: 2 },
];

export function paletteItems(): {
  inputs: DrawingItem[];
  selects: DrawingItem[];
  layouts: DrawingItem[];
} {
  return {
    inputs: [inputTemplate("单行文本", "请输入"), textareaTemplate()],
    selects: [selectTemplate(), radioTemplate(), uploadTemplate(), treeTemplate()],
    layouts: [rowTemplate()],
  };
}

function fieldBase(label: string, tagIcon: string, document: string): FieldBase {
  return {
    formId: 0,
    renderKey: tagIcon,
    vModel: "",
    label,
    span: 24,
    required: true,
    disabled: false,
    document,
    tagIcon,
  };
}

function inputTemplate(label: string, placeholder: string): InputItem {
  return {
    ...fieldBase(label, "input", "https://element-plus.org/zh-CN/component/input"),
    kind: "input",
    tag: "el-input",
    placeholder,
    clearable: true,
    maxlength: null,
    showWordLimit: false,
    prefixIcon: "",
  };
}

function textareaTemplate(): TextareaItem {
  return {
    ...fieldBase("多行文本", "textarea", "https://element-plus.org/zh-CN/component/input"),
    kind: "textarea",
    tag: "el-input",
    placeholder: "请输入",
    minRows: 4,
    maxRows: 4,
  };
}

function selectTemplate(): SelectItem {
  return {
    ...fieldBase("下拉选择", "select", "https://element-plus.org/zh-CN/component/select"),
    kind: "select",
    tag: "el-select",
    placeholder: "请选择",
    clearable: true,
    multiple: false,
    options: defaultOptions(),
  };
}

function radioTemplate(): RadioItem {
  return {
    ...fieldBase("单选框组", "radio", "https://element-plus.org/zh-CN/component/radio"),
    kind: "radio",
    tag: "el-radio-group",
    options: defaultOptions(),
  };
}

function uploadTemplate(): UploadItem {
  return {
    ...fieldBase("上传", "upload", "https://element-plus.org/zh-CN/component/upload"),
    kind: "upload",
    tag: "el-upload",
    action: "/dev-api/common/upload",
    accept: "",
    buttonText: "点击上传",
    fileSize: 2,
    sizeUnit: "MB",
  };
}

function treeTemplate(): TreeItem {
  return {
    ...fieldBase("树选择", "tree", "https://element-plus.org/zh-CN/component/tree"),
    kind: "tree",
    tag: "el-tree",
    showCheckbox: true,
    data: [{ id: 1, label: "一级", value: "one", children: [{ id: 2, label: "二级", value: "two" }] }],
  };
}

function rowTemplate(): RowItem {
  return {
    kind: "row",
    formId: 0,
    renderKey: "row",
    tag: "el-row",
    tagIcon: "row",
    componentName: "row",
    gutter: 15,
    span: 24,
    children: [],
    document: "https://element-plus.org/zh-CN/component/layout",
  };
}

export function defaultDrawingList(): DrawingItem[] {
  const item = instantiate(inputTemplate("手机号", "请输入手机号"), 6);
  if (item.kind === "input") {
    item.vModel = "mobile";
    item.maxlength = 11;
    item.showWordLimit = true;
    item.prefixIcon = "Iphone";
  }
  return [item];
}

export function instantiate(template: DrawingItem, formId: number): DrawingItem {
  let current = formId - 1;
  return cloneDrawing(template, () => {
    current += 1;
    return current;
  });
}

function withPlaceholder<T extends { placeholder: string; label: string }>(item: T): T {
  if (item.placeholder.endsWith(item.label)) {
    return item;
  }
  return { ...item, placeholder: `${item.placeholder}${item.label}` };
}

function assignIds(item: DrawingItem, allocate: () => number): DrawingItem {
  const formId = allocate();
  const key = renderKey();
  if (item.kind === "row") {
    return {
      ...item,
      formId,
      renderKey: key,
      componentName: `row${formId}`,
      children: item.children.map((child) => assignIds(child, allocate)),
    };
  }
  const labeled = {
    ...item,
    formId,
    renderKey: key,
    vModel: `field${formId}`,
  };
  if (labeled.kind === "input" || labeled.kind === "textarea" || labeled.kind === "select") {
    return withPlaceholder(labeled);
  }
  return labeled;
}

export function cloneDrawing(item: DrawingItem, allocate: () => number): DrawingItem {
  return assignIds(parseDrawingItem(JSON.parse(JSON.stringify(item)) as unknown), allocate);
}

export function replaceByFormId(list: DrawingItem[], formId: number, next: DrawingItem): DrawingItem[] {
  return list.map((item) => {
    if (item.formId === formId) {
      return next;
    }
    if (item.kind === "row") {
      return { ...item, children: replaceByFormId(item.children, formId, next) };
    }
    return item;
  });
}

export function findByFormId(list: readonly DrawingItem[], formId: number): DrawingItem | undefined {
  for (const item of list) {
    if (item.formId === formId) {
      return item;
    }
    if (item.kind === "row") {
      const nested = findByFormId(item.children, formId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

export function parseDrawingList(raw: unknown, depth = 0): DrawingItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("表单 schema 必须是数组");
  }
  return raw.map((item) => parseDrawingItem(item, depth));
}

export function parseDrawingItem(raw: unknown, depth = 0): DrawingItem {
  if (depth > MAX_SCHEMA_DEPTH) {
    throw new Error("表单 schema 嵌套过深");
  }
  if (!isRecord(raw)) {
    throw new Error("非法 schema 节点");
  }
  const kind = raw.kind;
  if (!isDrawingKind(kind)) {
    throw new Error(`未知组件类型: ${String(kind ?? raw.tag)}`);
  }
  const formId = Number(raw.formId) || 0;
  const render = typeof raw.renderKey === "string" ? raw.renderKey : renderKey();
  switch (kind) {
    case "input":
      return {
        kind,
        tag: "el-input",
        tagIcon: "input",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "单行文本"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        placeholder: String(raw.placeholder ?? "请输入"),
        clearable: raw.clearable !== false,
        maxlength: typeof raw.maxlength === "number" ? raw.maxlength : null,
        showWordLimit: raw.showWordLimit === true,
        prefixIcon: String(raw.prefixIcon ?? ""),
      };
    case "textarea":
      return {
        kind,
        tag: "el-input",
        tagIcon: "textarea",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "多行文本"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        placeholder: String(raw.placeholder ?? "请输入"),
        minRows: Number(raw.minRows) || 4,
        maxRows: Number(raw.maxRows) || 4,
      };
    case "select":
      return {
        kind,
        tag: "el-select",
        tagIcon: "select",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "下拉选择"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        placeholder: String(raw.placeholder ?? "请选择"),
        clearable: raw.clearable !== false,
        multiple: raw.multiple === true,
        options: parseOptions(raw.options),
      };
    case "radio":
      return {
        kind,
        tag: "el-radio-group",
        tagIcon: "radio",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "单选框组"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        options: parseOptions(raw.options),
      };
    case "upload":
      return {
        kind,
        tag: "el-upload",
        tagIcon: "upload",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "上传"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        action: String(raw.action ?? "/dev-api/common/upload"),
        accept: String(raw.accept ?? ""),
        buttonText: String(raw.buttonText ?? "点击上传"),
        fileSize: Number(raw.fileSize) || 2,
        sizeUnit: raw.sizeUnit === "KB" || raw.sizeUnit === "GB" ? raw.sizeUnit : "MB",
      };
    case "tree":
      return {
        kind,
        tag: "el-tree",
        tagIcon: "tree",
        formId,
        renderKey: render,
        vModel: String(raw.vModel ?? ""),
        label: String(raw.label ?? "树选择"),
        span: Number(raw.span) || 24,
        required: raw.required !== false,
        disabled: raw.disabled === true,
        document: String(raw.document ?? ""),
        showCheckbox: raw.showCheckbox !== false,
        data: parseTree(raw.data, depth + 1),
      };
    case "row":
      return {
        kind,
        tag: "el-row",
        tagIcon: "row",
        formId,
        renderKey: render,
        componentName: String(raw.componentName ?? `row${formId}`),
        gutter: Number(raw.gutter) || 15,
        span: 24,
        document: String(raw.document ?? ""),
        children: Array.isArray(raw.children) ? raw.children.map((child) => parseDrawingItem(child, depth + 1)) : [],
      };
    default: {
      const unexpected: never = kind;
      throw new Error(`未知组件类型: ${String(unexpected)}`);
    }
  }
}

function parseOptions(raw: unknown): SelectOption[] {
  if (!Array.isArray(raw)) {
    return defaultOptions();
  }
  return raw.filter(isRecord).map((item) => ({
    label: String(item.label ?? ""),
    value: typeof item.value === "number" ? item.value : String(item.value ?? ""),
  }));
}

function parseTree(raw: unknown, depth: number): TreeOption[] {
  if (depth > MAX_SCHEMA_DEPTH) {
    throw new Error("表单 schema 嵌套过深");
  }
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(isRecord).map((item) => {
    const node: TreeOption = {
      id: Number(item.id) || 0,
      label: String(item.label ?? ""),
      value: typeof item.value === "number" ? item.value : String(item.value ?? ""),
    };
    if (Array.isArray(item.children) && item.children.length > 0) {
      node.children = parseTree(item.children, depth + 1);
    }
    return node;
  });
}

export function serializeDrawingList(list: readonly DrawingItem[]): string {
  return JSON.stringify(list);
}

export function changeKind(current: DrawingItem, nextKind: DrawingKind, allocate: () => number): DrawingItem {
  const palette = [...paletteItems().inputs, ...paletteItems().selects, ...paletteItems().layouts];
  const template = palette.find((item) => item.kind === nextKind);
  if (!template) {
    throw new Error(`未知组件类型: ${nextKind}`);
  }
  const created = cloneDrawing(template, allocate);
  if (created.kind === "row" || current.kind === "row") {
    return { ...created, formId: current.formId, renderKey: current.renderKey };
  }
  return {
    ...created,
    formId: current.formId,
    renderKey: current.renderKey,
    vModel: current.vModel,
    label: current.label,
    span: current.span,
  };
}

export const ICON_CHOICES = ["Edit", "Search", "User", "Calendar", "Upload", "Share", "Iphone"] as const;
