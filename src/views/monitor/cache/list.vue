<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Collection, Delete, Document, Key, Refresh } from "@element-plus/icons-vue";
import {
  clearCacheAll,
  clearCacheKey,
  clearCacheName,
  getCacheValue,
  listCacheKey,
  listCacheName,
} from "../../../api/monitor/cache";
import { replaceObject } from "../../../composables/crud";
import type { CacheEntry } from "../../../types/api/monitor";
import { CACHE_LIST_PAGE_NAME, emptyCacheForm, stripCachePrefix, type CacheViewForm } from "./model";

defineOptions({ name: CACHE_LIST_PAGE_NAME });

const cacheNames = ref<CacheEntry[]>([]);
const cacheKeys = ref<string[]>([]);
const cacheForm = reactive<CacheViewForm>(emptyCacheForm());
const loading = ref(false);
const subLoading = ref(false);
const nowCacheName = ref("");
const tableHeight = ref(480);

function updateTableHeight(): void {
  tableHeight.value = Math.max(320, window.innerHeight - 200);
}

async function getCacheNames(): Promise<void> {
  loading.value = true;
  try {
    const response = await listCacheName();
    cacheNames.value = response.data ?? [];
  } finally {
    loading.value = false;
  }
}

async function refreshCacheNames(): Promise<void> {
  await getCacheNames();
  ElMessage.success("刷新缓存列表成功");
}

async function getCacheKeys(row?: CacheEntry): Promise<void> {
  const cacheName = row?.cacheName ?? nowCacheName.value;
  if (!cacheName) {
    return;
  }
  subLoading.value = true;
  try {
    const response = await listCacheKey(cacheName);
    cacheKeys.value = response.data ?? [];
    nowCacheName.value = cacheName;
  } finally {
    subLoading.value = false;
  }
}

async function refreshCacheKeys(): Promise<void> {
  await getCacheKeys();
  ElMessage.success("刷新键名列表成功");
}

async function handleClearCacheName(row: CacheEntry, event: Event): Promise<void> {
  event.stopPropagation();
  await clearCacheName(row.cacheName);
  ElMessage.success(`清理缓存名称[${row.cacheName}]成功`);
  if (nowCacheName.value === row.cacheName) {
    cacheKeys.value = [];
    replaceObject(cacheForm, emptyCacheForm());
    nowCacheName.value = "";
  }
  await getCacheNames();
}

async function handleClearCacheKey(cacheKey: string, event: Event): Promise<void> {
  event.stopPropagation();
  await clearCacheKey(cacheKey);
  ElMessage.success(`清理缓存键名[${cacheKey}]成功`);
  replaceObject(cacheForm, emptyCacheForm());
  await getCacheKeys();
}

async function handleCacheValue(cacheKey: string): Promise<void> {
  const response = await getCacheValue(nowCacheName.value, cacheKey);
  replaceObject(cacheForm, {
    cacheName: response.data.cacheName,
    cacheKey: response.data.cacheKey ?? cacheKey,
    cacheValue: response.data.cacheValue ?? "",
  });
}

async function handleClearCacheAll(): Promise<void> {
  await clearCacheAll();
  ElMessage.success("清理全部缓存成功");
  cacheKeys.value = [];
  replaceObject(cacheForm, emptyCacheForm());
  nowCacheName.value = "";
  await getCacheNames();
}

onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
  void getCacheNames();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateTableHeight);
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card class="cache-card">
          <template #header>
            <el-icon><Collection /></el-icon>
            <span>缓存列表</span>
            <el-button
              v-hasPermi="['monitor:cache:list']"
              link
              type="primary"
              :icon="Refresh"
              @click="refreshCacheNames"
            />
          </template>
          <el-table
            v-loading="loading"
            :data="cacheNames"
            :height="tableHeight"
            highlight-current-row
            @row-click="getCacheKeys"
          >
            <el-table-column label="序号" width="60" type="index" />
            <el-table-column label="缓存名称" align="center" :show-overflow-tooltip="true">
              <template #default="{ row }">{{ stripCachePrefix(row.cacheName, "") }}</template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row }">
                <el-button
                  v-hasPermi="['monitor:cache:list']"
                  link
                  type="primary"
                  :icon="Delete"
                  @click="handleClearCacheName(row, $event)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="cache-card">
          <template #header>
            <el-icon><Key /></el-icon>
            <span>键名列表</span>
            <el-button
              v-hasPermi="['monitor:cache:list']"
              link
              type="primary"
              :icon="Refresh"
              @click="refreshCacheKeys"
            />
          </template>
          <el-table
            v-loading="subLoading"
            :data="cacheKeys"
            :height="tableHeight"
            highlight-current-row
            @row-click="handleCacheValue"
          >
            <el-table-column label="序号" width="60" type="index" />
            <el-table-column label="缓存键名" align="center" :show-overflow-tooltip="true">
              <template #default="{ row }">{{ stripCachePrefix(row, nowCacheName) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row }">
                <el-button
                  v-hasPermi="['monitor:cache:list']"
                  link
                  type="primary"
                  :icon="Delete"
                  @click="handleClearCacheKey(row, $event)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="cache-card">
          <template #header>
            <el-icon><Document /></el-icon>
            <span>缓存内容</span>
            <el-button
              v-hasPermi="['monitor:cache:list']"
              link
              type="primary"
              :icon="Refresh"
              @click="handleClearCacheAll"
              >清理全部</el-button
            >
          </template>
          <el-form :model="cacheForm">
            <el-form-item label="缓存名称:">
              <el-input v-model="cacheForm.cacheName" readonly />
            </el-form-item>
            <el-form-item label="缓存键名:">
              <el-input v-model="cacheForm.cacheKey" readonly />
            </el-form-item>
            <el-form-item label="缓存内容:">
              <el-input v-model="cacheForm.cacheValue" type="textarea" :rows="8" readonly />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.cache-card {
  height: calc(100vh - 125px);
}
.el-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  gap: 6px;
}
.el-card :deep(.el-card__header .el-button) {
  margin-left: auto;
}
</style>
