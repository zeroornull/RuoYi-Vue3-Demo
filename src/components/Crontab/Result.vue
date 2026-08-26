<script setup lang="ts">
import { ref, watch } from "vue";
import { previewCronRuns } from "./preview";

const props = withDefaults(
  defineProps<{
    ex?: string;
  }>(),
  { ex: "" },
);

const resultList = ref<string[]>([]);
const isShow = ref(false);

function expressionChange(): void {
  isShow.value = false;
  const runs = previewCronRuns(props.ex);
  resultList.value =
    runs.length === 0
      ? ["没有达到条件的结果！"]
      : runs.length === 5
        ? runs
        : [...runs, `最近100年内只有上面${runs.length}条结果！`];
  isShow.value = true;
}

watch(() => props.ex, () => expressionChange(), { immediate: true });
</script>

<template>
  <div class="popup-result">
    <p class="title">最近5次运行时间</p>
    <ul class="popup-result-scroll">
      <template v-if="isShow">
        <li v-for="item in resultList" :key="item">{{ item }}</li>
      </template>
      <li v-else>计算结果中...</li>
    </ul>
  </div>
</template>
