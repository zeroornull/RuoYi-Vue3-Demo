<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { UploadFile, UploadInstance, UploadRawFile } from "element-plus";
import { appEnv } from "@/config/env";
import { getToken } from "@/http/token";
import { elementComponentUi, type ComponentUi } from "../ui";
import {
  defaultFileTypes,
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
    fileType: () => [...defaultFileTypes("image")],
    isShowTip: true,
    disabled: false,
    drag: true,
    ui: () => elementComponentUi,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const imageUpload = ref<UploadInstance>();
const fileList = ref<UploadFileItem[]>([]);
const pending = ref(0);
const uploaded = ref<UploadFileItem[]>([]);
const dialogVisible = ref(false);
const dialogImageUrl = ref("");
const headers = computed(() => uploadHeaders(getToken()));
const uploadImgUrl = computed(() =>
  uploadActionUrl(appEnv.baseApi, props.action),
);
const showTip = computed(
  () => props.isShowTip && (props.fileType.length > 0 || props.fileSize > 0),
);
const hideAdder = computed(() => fileList.value.length >= props.limit);

let sortable: { destroy: () => void } | null = null;

watch(
  () => props.modelValue,
  (value) => {
    fileList.value = parseUploadValue(value, {
      baseUrl: appEnv.baseApi,
      prefixBase: true,
    });
  },
  { deep: true, immediate: true },
);

function commit(list = fileList.value): void {
  emit(
    "update:modelValue",
    stringifyUploadValue(list, { baseUrl: appEnv.baseApi, stripBlob: true }),
  );
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
    kind: "image",
    fileType: props.fileType,
    fileSizeMb: props.fileSize,
  });
  if (error) {
    props.ui.error(error.message);
    return false;
  }
  props.ui.loading("正在上传图片，请稍候...");
  pending.value += 1;
  return true;
}

function handleExceed(): void {
  props.ui.error(limitExceededMessage(props.limit));
}

function handleUploadSuccess(response: unknown, file: UploadFile): void {
  if (isUploadSuccess(response)) {
    uploaded.value.push(uploadSuccessItem(response));
    finishBatch();
    return;
  }
  pending.value -= 1;
  props.ui.loading("").close();
  props.ui.error(String((response as { msg?: string } | null)?.msg ?? "上传图片失败"));
  imageUpload.value?.handleRemove(file);
  finishBatch();
}

function handleDelete(file: UploadFile): boolean {
  const index = fileList.value.findIndex((item) => item.name === file.name);
  if (index > -1 && uploaded.value.length === pending.value) {
    const next = [...fileList.value];
    next.splice(index, 1);
    fileList.value = next;
    commit(next);
    return false;
  }
  return true;
}

function handleUploadError(): void {
  props.ui.error("上传图片失败");
  props.ui.loading("").close();
}

function handlePictureCardPreview(file: UploadFile): void {
  dialogImageUrl.value = file.url ?? "";
  dialogVisible.value = true;
}

onMounted(() => {
  if (props.drag && !props.disabled) {
    sortable = bindSortableList(
      imageUpload.value?.$el?.querySelector(".el-upload-list") ?? null,
      (from, to) => {
        fileList.value = moveUploadItem(fileList.value, from, to);
        commit();
      },
    );
  }
});

onBeforeUnmount(() => {
  sortable?.destroy();
});
</script>

<template>
  <div class="component-upload-image">
    <el-upload
      ref="imageUpload"
      multiple
      list-type="picture-card"
      :disabled="disabled"
      :action="uploadImgUrl"
      :data="data"
      :limit="limit"
      :headers="headers"
      :file-list="fileList"
      :show-file-list="true"
      :class="{ hide: hideAdder }"
      :before-upload="handleBeforeUpload"
      :before-remove="handleDelete"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-preview="handlePictureCardPreview"
    >
      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
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
    <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
      <img :src="dialogImageUrl" alt="" class="image-upload__preview" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.upload-file__limit {
  color: #f56c6c;
}

.image-upload__preview {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}

:deep(.hide .el-upload--picture-card) {
  display: none;
}

:deep(.el-upload.el-upload--picture-card.is-disabled) {
  display: none !important;
}
</style>
