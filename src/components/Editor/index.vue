<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";
import type { UploadFile, UploadRawFile } from "element-plus";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { appEnv } from "@/config/env";
import { getToken } from "@/http/token";
import { isRecord } from "@/utils/guard";
import { elementComponentUi, type ComponentUi } from "../ui";
import { uploadActionUrl, uploadHeaders } from "../upload/model";
import {
  DEFAULT_EDITOR_TOOLBAR,
  editorImageUrl,
  isEditorImageClipboardItem,
  nextEditorIndex,
  normalizeEditorHtml,
  validateEditorImage,
  type EditorUploadMode,
} from "./model";

type QuillLike = {
  getModule: (name: string) => { addHandler: (name: string, handler: (value?: boolean) => void) => void } | undefined;
  root: HTMLElement;
  insertEmbed: (index: number, type: string, value: string) => void;
  setSelection: (index: number) => void;
  format: (name: string, value: unknown) => void;
  getSelection?: (focus?: boolean) => { index: number } | null;
  selection?: { savedRange?: { index: number } };
};

type QuillEditorExpose = {
  getQuill: () => QuillLike;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    height?: number | null;
    minHeight?: number | null;
    readOnly?: boolean;
    fileSize?: number;
    type?: EditorUploadMode;
    ui?: ComponentUi;
  }>(),
  {
    modelValue: "",
    height: null,
    minHeight: null,
    readOnly: false,
    fileSize: 5,
    type: "url",
    ui: () => elementComponentUi,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const quillEditorRef = ref<QuillEditorExpose>();
const uploadRef = ref<HTMLInputElement>();
const content = ref(normalizeEditorHtml(props.modelValue));
const uploadUrl = uploadActionUrl(appEnv.baseApi, "/common/upload");
const headers = computed(() => uploadHeaders(getToken()));
const options = computed(() => {
  const next = {
    theme: "snow" as const,
    debug: "warn" as const,
    modules: { toolbar: DEFAULT_EDITOR_TOOLBAR },
    placeholder: "请输入内容",
    readOnly: props.readOnly,
  };
  if (typeof document === "undefined") {
    return next;
  }
  return { ...next, bounds: document.body };
});
const styles = computed(() => {
  const style: Record<string, string> = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

watch(
  () => props.modelValue,
  (value) => {
    const next = normalizeEditorHtml(value);
    if (next !== content.value) {
      content.value = next;
    }
  },
);

function currentQuill(): QuillLike | null {
  const editor = quillEditorRef.value;
  if (!editor) {
    return null;
  }
  return toRaw(editor).getQuill();
}

function insertUploadedImage(fileName: string): void {
  const quill = currentQuill();
  if (!quill) {
    return;
  }
  const index = nextEditorIndex(quill.getSelection?.(true)?.index ?? quill.selection?.savedRange?.index);
  quill.insertEmbed(index, "image", editorImageUrl(appEnv.baseApi, fileName));
  quill.setSelection(index + 1);
}

function handleBeforeUpload(file: UploadRawFile): boolean {
  const error = validateEditorImage(file, props.fileSize);
  if (error) {
    props.ui.error(error.message);
    return false;
  }
  return true;
}

function handleUploadSuccess(response: unknown): void {
  if (isRecord(response) && response.code === 200 && typeof response.fileName === "string") {
    insertUploadedImage(response.fileName);
    return;
  }
  props.ui.error("图片插入失败");
}

function handleUploadError(): void {
  props.ui.error("图片插入失败");
}

async function insertImage(file: File): Promise<void> {
  const error = validateEditorImage(file, props.fileSize);
  if (error) {
    props.ui.error(error.message);
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: headers.value,
    body: formData,
  });
  const payload: unknown = await response.json();
  handleUploadSuccess(payload);
}

function handlePasteCapture(event: ClipboardEvent): void {
  const clipboard = event.clipboardData;
  if (!clipboard?.items) {
    return;
  }
  for (const item of Array.from(clipboard.items)) {
    if (isEditorImageClipboardItem(item.type)) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        void insertImage(file);
      }
    }
  }
}

function handleTextChange(): void {
  emit("update:modelValue", content.value);
}

onMounted(() => {
  if (props.type !== "url") {
    return;
  }
  const quill = currentQuill();
  if (!quill) {
    return;
  }
  quill.getModule("toolbar")?.addHandler("image", (value) => {
    if (value) {
      uploadRef.value?.click();
    } else {
      quill.format("image", false);
    }
  });
  quill.root.addEventListener("paste", handlePasteCapture, true);
});

onBeforeUnmount(() => {
  currentQuill()?.root.removeEventListener("paste", handlePasteCapture, true);
});
</script>

<template>
  <div>
    <el-upload
      v-if="type === 'url'"
      class="editor-img-uploader"
      name="file"
      :action="uploadUrl"
      :headers="headers"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="(response: unknown, _file: UploadFile) => handleUploadSuccess(response)"
      :on-error="handleUploadError"
    >
      <input ref="uploadRef" class="editor-img-uploader" />
    </el-upload>
    <div class="editor">
      <QuillEditor
        ref="quillEditorRef"
        v-model:content="content"
        content-type="html"
        :options="options"
        :style="styles"
        :read-only="readOnly"
        @text-change="handleTextChange"
      />
    </div>
  </div>
</template>

<style>
.editor-img-uploader {
  display: none;
}

.editor,
.ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}

.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}

.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  padding-right: 0;
  border-right: 0;
  content: "保存";
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题1";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题2";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题3";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题4";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题5";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "标题6";
}
</style>
