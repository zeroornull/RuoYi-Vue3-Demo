<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { InputInstance } from "element-plus";
import Fuse from "fuse.js";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { usePermissionStore } from "@/stores/modules/permission";
import { useSettingsStore } from "@/stores/modules/settings";
import { isHttp } from "@/utils/validate";
import SvgIcon from "../SvgIcon.vue";
import {
  createHeaderSearchIndex,
  generateSearchRoutes,
  highlightText,
  nextActiveIndex,
  parseBackendQuery,
  searchHeaderItems,
  type HeaderSearchItem,
} from "./model";

const router = useRouter();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();
const search = ref("");
const options = ref<HeaderSearchItem[]>([]);
const searchPool = ref<HeaderSearchItem[]>([]);
const activeIndex = ref(-1);
const show = ref(false);
const fuse = ref<Fuse<HeaderSearchItem> | null>(null);
const inputRef = ref<InputInstance>();

watch(
  () => permissionStore.defaultRoutes,
  (routes) => {
    searchPool.value = generateSearchRoutes(routes);
    fuse.value = createHeaderSearchIndex(searchPool.value);
    if (search.value.length === 0) {
      options.value = searchPool.value;
    }
  },
  { immediate: true, deep: true },
);

function click(): void {
  show.value = !show.value;
  if (show.value) {
    options.value = searchPool.value;
  }
}

function onDialogOpened(): void {
  void nextTick(() => inputRef.value?.focus());
}

function close(): void {
  inputRef.value?.blur();
  search.value = "";
  options.value = searchPool.value;
  show.value = false;
  activeIndex.value = -1;
}

function change(item: HeaderSearchItem): void {
  if (isHttp(item.path)) {
    const index = item.path.indexOf("http");
    window.open(item.path.slice(index), "_blank");
  } else {
    const query = parseBackendQuery(item.query);
    void router.push(query ? { path: item.path, query } : item.path);
  }
  close();
}

function querySearch(value: string): void {
  activeIndex.value = -1;
  options.value = searchHeaderItems(searchPool.value, fuse.value, value);
}

function navigateResult(direction: "up" | "down"): void {
  activeIndex.value = nextActiveIndex(
    activeIndex.value,
    options.value.length,
    direction,
  );
}

function selectActiveResult(): void {
  const item = options.value[activeIndex.value];
  if (item) {
    change(item);
  }
}

const activeStyle = computed(() => (index: number) =>
  index === activeIndex.value
    ? { backgroundColor: settingsStore.theme, color: "#fff" }
    : {},
);
</script>

<template>
  <div class="header-search">
    <button class="header-search__trigger" type="button" aria-label="菜单搜索" @click.stop="click">
      <SvgIcon name="search" :size="18" />
    </button>
    <el-dialog
      v-model="show"
      width="600"
      append-to-body
      :show-close="false"
      @close="close"
      @opened="onDialogOpened"
    >
      <el-input
        ref="inputRef"
        v-model="search"
        size="large"
        clearable
        placeholder="菜单搜索，支持标题、URL模糊查询"
        :prefix-icon="Search"
        @input="querySearch"
        @keyup.enter="selectActiveResult"
        @keydown.up.prevent="navigateResult('up')"
        @keydown.down.prevent="navigateResult('down')"
      />
      <div v-if="search && options.length > 0" class="result-count">
        找到 <strong>{{ options.length }}</strong> 个结果
      </div>
      <div class="result-wrap">
        <el-scrollbar>
          <template v-if="options.length > 0">
            <div
              v-for="(item, index) in options"
              :key="item.path"
              class="search-item"
              :class="{ 'is-active': index === activeIndex }"
              :style="activeStyle(index)"
              @mouseenter="activeIndex = index"
              @mouseleave="activeIndex = -1"
              @click="change(item)"
            >
              <div class="left">
                <SvgIcon class="menu-icon" :name="item.icon || 'menu'" :size="18" />
              </div>
              <div class="search-info">
                <div class="menu-title" v-html="highlightText(item.title.join(' / '), search)" />
                <div class="menu-path" v-html="highlightText(item.path, search)" />
              </div>
              <SvgIcon v-show="index === activeIndex" name="enter" :size="14" />
            </div>
          </template>
          <div v-else-if="search && options.length === 0" class="empty-state">
            <el-icon class="empty-icon"><Search /></el-icon>
            <p class="empty-text">未找到 "<strong>{{ search }}</strong>" 相关菜单</p>
            <p class="empty-tip">试试其他关键词或路径</p>
          </div>
        </el-scrollbar>
      </div>
      <div class="search-footer">
        <span class="shortcut-item"><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
        <span class="shortcut-item"><kbd>↵</kbd> 选择</span>
        <span class="shortcut-item"><kbd>Esc</kbd> 关闭</span>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.header-search__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
}

:deep(.highlight) {
  color: red;
  font-weight: 600;
}

.result-count {
  padding: 6px 16px 0;
  color: #aaa;
  font-size: 12px;
}

.result-wrap {
  height: 280px;
  margin: 4px 0;
}

.search-item {
  display: flex;
  align-items: center;
  height: 48px;
  padding-right: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.left {
  flex-shrink: 0;
  width: 60px;
  text-align: center;
}

.search-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.menu-title,
.menu-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-path {
  color: #ccc;
  font-size: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon {
  margin-bottom: 14px;
  color: #e0e0e0;
  font-size: 42px;
}

.search-footer {
  display: flex;
  gap: 28px;
  padding: 10px 20px;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  color: #555;
  font-size: 11px;
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
