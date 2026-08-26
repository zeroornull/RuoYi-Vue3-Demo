<script setup lang="ts">
import { computed } from "vue";
import {
  DEFAULT_PAGE_SIZES,
  defaultPagerCount,
  nextPageOnSizeChange,
  paginationChange,
} from "./model";

const props = withDefaults(
  defineProps<{
    total: number;
    page?: number;
    limit?: number;
    pageSizes?: number[];
    pagerCount?: number;
    layout?: string;
    background?: boolean;
    autoScroll?: boolean;
    hidden?: boolean;
  }>(),
  {
    page: 1,
    limit: 20,
    pageSizes: () => [...DEFAULT_PAGE_SIZES],
    pagerCount: () =>
      defaultPagerCount(
        typeof document === "undefined" ? 1440 : document.body.clientWidth,
      ),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
    autoScroll: true,
    hidden: false,
  },
);

const emit = defineEmits<{
  "update:page": [value: number];
  "update:limit": [value: number];
  pagination: [value: { page: number; limit: number }];
}>();

const currentPage = computed({
  get: () => props.page,
  set: (value: number) => {
    emit("update:page", value);
  },
});
const pageSize = computed({
  get: () => props.limit,
  set: (value: number) => {
    emit("update:limit", value);
  },
});

function scrollTop(): void {
  if (!props.autoScroll || typeof window === "undefined") {
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleSizeChange(limit: number): void {
  const page = nextPageOnSizeChange(currentPage.value, limit, props.total);
  if (page !== currentPage.value) {
    currentPage.value = page;
  }
  emit("pagination", paginationChange(page, limit));
  scrollTop();
}

function handleCurrentChange(page: number): void {
  emit("pagination", paginationChange(page, pageSize.value));
  scrollTop();
}
</script>

<template>
  <div class="pagination-container" :class="{ hidden }">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.pagination-container {
  background: var(--app-surface, #fff);
}

.pagination-container.hidden {
  display: none;
}
</style>
