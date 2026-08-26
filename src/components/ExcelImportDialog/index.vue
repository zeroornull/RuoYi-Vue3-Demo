<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import type { UploadFile, UploadInstance, UploadProgressEvent } from "element-plus";
import { appEnv } from "@/config/env";
import { download } from "@/http";
import { getToken } from "@/http/token";
import { isRecord } from "@/utils/guard";
import { elementComponentUi, type ComponentUi } from "../ui";
import {
  excelUploadUrl,
  isExcelFileName,
  uploadHeaders,
} from "../upload/model";

const props = withDefaults(
  defineProps<{
    title?: string;
    width?: string;
    action: string;
    templateAction?: string;
    templateFileName?: string;
    updateSupportLabel?: string;
    ui?: ComponentUi;
  }>(),
  {
    title: "数据导入",
    width: "400px",
    templateAction: "",
    templateFileName: "template",
    updateSupportLabel: "是否更新已经存在的数据",
    ui: () => elementComponentUi,
  },
);

const emit = defineEmits<{
  success: [];
}>();

const uploadRef = ref<UploadInstance>();
const visible = ref(false);
const selectedFile = ref<UploadFile | null>(null);
const isUploading = ref(false);
const updateSupport = ref(false);
const headers = computed(() => uploadHeaders(getToken()));
const uploadUrl = computed(() =>
  excelUploadUrl(appEnv.baseApi, props.action, updateSupport.value),
);

function open(): void {
  updateSupport.value = false;
  isUploading.value = false;
  visible.value = true;
  void nextTick(() => {
    selectedFile.value = null;
    uploadRef.value?.clearFiles();
  });
}

function handleClose(): void {
  isUploading.value = false;
  selectedFile.value = null;
  uploadRef.value?.clearFiles();
}

function handleDownloadTemplate(): void {
  if (!props.templateAction) {
    return;
  }
  void download(
    props.templateAction,
    {},
    `${props.templateFileName}_${Date.now()}.xlsx`,
  );
}

function handleProgress(_event: UploadProgressEvent): void {
  isUploading.value = true;
}

function handleFileChange(file: UploadFile): void {
  selectedFile.value = file;
}

function handleFileRemove(): void {
  selectedFile.value = null;
}

function handleSuccess(response: unknown): void {
  visible.value = false;
  isUploading.value = false;
  selectedFile.value = null;
  uploadRef.value?.clearFiles();
  const message = isRecord(response) && typeof response.msg === "string"
    ? response.msg
    : "导入完成";
  void props.ui.alertHtml(message, "导入结果");
  emit("success");
}

function handleSubmit(): void {
  const file = selectedFile.value;
  const name = file?.name ?? "";
  if (!file || !isExcelFileName(name)) {
    props.ui.error('请选择后缀为 “xls”或“xlsx”的文件。');
    return;
  }
  uploadRef.value?.submit();
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    append-to-body
    @close="handleClose"
  >
    <el-upload
      ref="uploadRef"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="headers"
      :action="uploadUrl"
      :disabled="isUploading"
      :auto-upload="false"
      drag
      :on-progress="handleProgress"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :on-success="handleSuccess"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <el-checkbox v-model="updateSupport">{{ updateSupportLabel }}</el-checkbox>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            v-if="templateAction"
            type="primary"
            underline="never"
            class="excel-import__template"
            @click="handleDownloadTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.excel-import__template {
  font-size: 12px;
  vertical-align: baseline;
}
</style>
