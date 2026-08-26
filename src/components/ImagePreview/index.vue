<script setup lang="ts">
import { computed } from "vue";
import { PictureFilled } from "@element-plus/icons-vue";
import { appEnv } from "@/config/env";
import { previewSourceList, primaryPreviewSource, toCssSize } from "./model";

const props = withDefaults(
  defineProps<{
    src?: string;
    width?: number | string;
    height?: number | string;
  }>(),
  {
    src: "",
    width: "",
    height: "",
  },
);

const realSrc = computed(() => primaryPreviewSource(props.src, appEnv.baseApi));
const realSrcList = computed(() => previewSourceList(props.src, appEnv.baseApi));
const realWidth = computed(() => toCssSize(props.width));
const realHeight = computed(() => toCssSize(props.height));
</script>

<template>
  <el-image
    :src="realSrc"
    fit="cover"
    :style="{ width: realWidth, height: realHeight }"
    :preview-src-list="realSrcList"
    preview-teleported
  >
    <template #error>
      <div class="image-slot">
        <el-icon><PictureFilled /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  background-color: var(--el-fill-color-light, #ebeef5);
  box-shadow: 0 0 5px 1px #ccc;

  :deep(.el-image__inner) {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.2);
    }
  }

  :deep(.image-slot) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--el-text-color-secondary, #909399);
    font-size: 30px;
  }
}
</style>
