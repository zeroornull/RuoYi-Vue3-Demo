<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { UploadInstance, UploadRawFile } from "element-plus";
import { appEnv } from "@/config/env";
import { getToken } from "@/http/token";
import { elementComponentUi, type ComponentUi } from "../ui";
import {
  defaultFileTypes,
  displayFileName,
  isUploadSuccess,
  limitExceededMessage,
  moveUploadItem,
  parseUploadValue,
  stringifyUploadValue,
  uploadActionUrl,
  uploadHeaders,
  uploadSuccessItem,
  validateUploadFile,
  type UploadFileItem,
  type UploadValue,
} from "../upload/model";
import { bindSortableList } from "../upload/sortable";

const props = withDefaults(
  defineProps<{
    modelValue?: UploadValue | null;
    action?: string;
    data?: Record<string, unknown>;
    limit?: number;
    fileSize?: number;
    fileType?: string[];
    isShowTip?: boolean;
    disabled?: boolean;
    drag?: boolean;
    ui?: ComponentUi;
  }>(),
  {
    modelValue: "",
    action: "/common/upload",
    limit: 5,
    fileSize: 5,
    fileType: () => [...defaultFileTypes("file")],
    isShowTip: true,
    disabled: false,
    drag: true,
    ui: () => elementComponentUi,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const fileUpload = ref<UploadInstance>();
const listRef = ref<HTMLElement | null>(null);
const fileList = ref<UploadFileItem[]>([]);
const pending = ref(0);
const uploaded = ref<UploadFileItem[]>([]);
const headers = computed(() => uploadHeaders(getToken()));
const uploadFileUrl = computed(() =>
  uploadActionUrl(appEnv.baseApi, props.action),
);
const showTip = computed(
  () => props.isShowTip && (props.fileType.length > 0 || props.fileSize > 0),
);

let sortable: { destroy: () => void } | null = null;

watch(
  () => props.modelValue,
  (value) => {
    fileList.value = parseUploadValue(value);
  },
  { deep: true, immediate: true },
);

function commit(): void {
  emit("update:modelValue", stringifyUploadValue(fileList.value));
}

function finishBatch(): void {
  if (pending.value > 0 && uploaded.value.length === pending.value) {
    fileList.value = fileList.value
      .filter((item) => item.url.length > 0)
      .concat(uploaded.value);
    uploaded.value = [];
    pending.value = 0;
    commit();
    props.ui.loading("").close();
  }
}

function handleBeforeUpload(file: UploadRawFile): boolean {
  const error = validateUploadFile(file, {
    kind: "file",
    fileType: props.fileType,
    fileSizeMb: props.fileSize,
  });
  if (error) {
    props.ui.error(error.message);
    return false;
  }
  props.ui.loading("正在上传文件，请稍候...");
  pending.value += 1;
  return true;
}

function handleExceed(): void {
  props.ui.error(limitExceededMessage(props.limit));
}

function handleUploadError(): void {
  props.ui.error("上传文件失败");
  props.ui.loading("").close();
}

function handleUploadSuccess(response: unknown, file: { uid?: number }): void {
  if (isUploadSuccess(response)) {
    uploaded.value.push(uploadSuccessItem(response));
    finishBatch();
    return;
  }
  pending.value -= 1;
  props.ui.loading("").close();
  props.ui.error(
    isUploadSuccess(response) ? "" : String(
      (response as { msg?: string } | null)?.msg ?? "上传文件失败",
    ),
  );
  if (file.uid !== undefined) {
    fileUpload.value?.handleRemove(file as never);
  }
  finishBatch();
}

function handleDelete(index: number): void {
  fileList.value.splice(index, 1);
  commit();
}

onMounted(() => {
  if (props.drag && !props.disabled) {
    sortable = bindSortableList(
      listRef.value,
      (from, to) => {
        fileList.value = moveUploadItem(fileList.value, from, to);
        commit();
      },
      "file-upload-darg",
    );
  }
});

onBeforeUnmount(() => {
  sortable?.destroy();
});
</script>

<template>
  <div class="upload-file">
    <el-upload
      v-if="!disabled"
      ref="fileUpload"
      class="upload-file-uploader"
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :data="data"
      :limit="limit"
      :headers="headers"
      :show-file-list="false"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
    >
      <el-button type="primary">选取文件</el-button>
    </el-upload>
    <div v-if="showTip && !disabled" class="el-upload__tip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b class="upload-file__limit">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType.length">
        格式为 <b class="upload-file__limit">{{ fileType.join("/") }}</b>
      </template>
      的文件
    </div>
    <ul ref="listRef" class="upload-file-list el-upload-list el-upload-list--text">
      <li
        v-for="(file, index) in fileList"
        :key="file.uid"
        class="el-upload-list__item ele-upload-list__item-content"
      >
        <el-link :href="`${appEnv.baseApi}${file.url}`" underline="never" target="_blank">
          <span class="el-icon-document">{{ displayFileName(file.name) }}</span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link
            v-if="!disabled"
            underline="never"
            type="danger"
            @click="handleDelete(index)"
          >
            删除
          </el-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.file-upload-darg {
  background: #c8ebfb;
  opacity: 0.5;
}

.upload-file-uploader {
  margin-bottom: 5px;
}

.upload-file__limit {
  color: #f56c6c;
}

.upload-file-list .el-upload-list__item {
  position: relative;
  margin-bottom: 10px;
  line-height: 2;
  border: 1px solid var(--el-border-color, #e4e7ed);
  transition: none !important;
}

.ele-upload-list__item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
}

.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
