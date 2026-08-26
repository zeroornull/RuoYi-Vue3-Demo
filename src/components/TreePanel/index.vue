<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  ArrowDown,
  ArrowUp,
  DArrowLeft,
  DArrowRight,
  Document,
  Folder,
  OfficeBuilding,
  Refresh,
  Search,
} from "@element-plus/icons-vue";
import type { ElTree } from "element-plus";
import {
  clampTreeWidth,
  defaultTreeFilter,
  emptyTreeData,
  readStoredWidth,
  type TreePanelNode,
  type TreePanelPropsMap,
} from "./model";

type TreeInstance = InstanceType<typeof ElTree>;
type LoadFn = (node: unknown, resolve: (data: TreePanelNode[]) => void) => void;

const props = withDefaults(
  defineProps<{
    treeData?: TreePanelNode[];
    title?: string;
    titleIcon?: string | object;
    showSearch?: boolean;
    searchPlaceholder?: string;
    defaultCollapsed?: boolean;
    treeProps?: TreePanelPropsMap;
    nodeKey?: string;
    expandOnClickNode?: boolean;
    showCheckbox?: boolean;
    checkStrictly?: boolean;
    defaultExpandAll?: boolean;
    defaultExpandedKeys?: Array<string | number>;
    defaultWidth?: number;
    collapsedWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    storageKey?: string;
    enableStorage?: boolean;
    lazy?: boolean;
    load?: LoadFn;
    filterMethod?: (value: string, data: Record<string, unknown>) => boolean;
  }>(),
  {
    treeData: () => [],
    title: "树形结构",
    titleIcon: () => OfficeBuilding,
    showSearch: true,
    searchPlaceholder: "请输入名称",
    defaultCollapsed: false,
    treeProps: () => ({ children: "children", label: "label" }),
    nodeKey: "id",
    expandOnClickNode: false,
    showCheckbox: false,
    checkStrictly: false,
    defaultExpandAll: false,
    defaultExpandedKeys: () => [],
    defaultWidth: 220,
    collapsedWidth: 20,
    minWidth: 180,
    maxWidth: 400,
    storageKey: "tree-sidebar-width",
    enableStorage: true,
    lazy: false,
  },
);

const emit = defineEmits<{
  "collapsed-change": [value: boolean];
  "expanded-all-change": [value: boolean];
  refresh: [];
  "node-click": [data: TreePanelNode, node: unknown, event: Event];
  check: [data: TreePanelNode, checked: unknown];
  "node-expand": [data: TreePanelNode, node: unknown, event: Event];
  "node-collapse": [data: TreePanelNode, node: unknown, event: Event];
  search: [value: string];
}>();

const treeRef = ref<TreeInstance>();
const searchKeyword = ref("");
const collapsed = ref(props.defaultCollapsed);
const sidebarWidth = ref(props.defaultCollapsed ? props.collapsedWidth : props.defaultWidth);
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const saveWidthTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const rafId = ref<number | null>(null);
const isLoadingFromStorage = ref(false);
const expandedAll = ref(props.defaultExpandAll);
const isEmpty = computed(() => emptyTreeData(props.treeData) && !props.lazy);

function filterNodeMethod(value: string, data: Record<string, unknown>): boolean {
  if (props.filterMethod) {
    return props.filterMethod(value, data);
  }
  return defaultTreeFilter(value, data, props.treeProps.label ?? "label");
}

function getSavedWidth(): number | null {
  if (!props.enableStorage || typeof localStorage === "undefined") {
    return null;
  }
  return readStoredWidth(localStorage.getItem(props.storageKey), props.minWidth, props.maxWidth);
}

function saveWidthToStorage(): void {
  if (collapsed.value || !props.enableStorage || typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(props.storageKey, String(sidebarWidth.value));
}

function expandAllNodes(): void {
  const root = treeRef.value?.root as
    { childNodes?: Array<{ expanded?: boolean; childNodes?: unknown[] }> } | undefined;
  if (!root) {
    return;
  }
  const walk = (node: { expanded?: boolean; childNodes?: unknown[] }): void => {
    if (node.expanded !== undefined) {
      node.expanded = true;
    }
    for (const child of node.childNodes ?? []) {
      walk(child as { expanded?: boolean; childNodes?: unknown[] });
    }
  };
  walk(root);
}

function collapseAllNodes(): void {
  const root = treeRef.value?.root as
    { childNodes?: Array<{ expanded?: boolean; childNodes?: unknown[] }> } | undefined;
  if (!root) {
    return;
  }
  const walk = (node: { expanded?: boolean; childNodes?: unknown[] }): void => {
    if (node.expanded !== undefined) {
      node.expanded = false;
    }
    for (const child of node.childNodes ?? []) {
      walk(child as { expanded?: boolean; childNodes?: unknown[] });
    }
  };
  walk(root);
}

watch(collapsed, (value) => {
  sidebarWidth.value = value ? props.collapsedWidth : (getSavedWidth() ?? props.defaultWidth);
  emit("collapsed-change", value);
});

watch(expandedAll, (value) => {
  void nextTick(() => {
    if (value) {
      expandAllNodes();
    } else {
      collapseAllNodes();
    }
  });
  emit("expanded-all-change", value);
});

watch(searchKeyword, (value) => {
  treeRef.value?.filter(value);
  emit("search", value);
});

function toggleCollapsed(): void {
  if (!collapsed.value) {
    saveWidthToStorage();
  }
  collapsed.value = !collapsed.value;
}

function handleRefresh(): void {
  emit("refresh");
}

function setCurrentKey(key: string | number | null): void {
  treeRef.value?.setCurrentKey(key);
}

function getCurrentNode(): unknown {
  return treeRef.value?.getCurrentNode() ?? null;
}

function getCurrentKey(): string | number | undefined {
  return treeRef.value?.getCurrentKey() as string | number | undefined;
}

function setCheckedKeys(keys: Array<string | number>): void {
  if (props.showCheckbox) {
    treeRef.value?.setCheckedKeys(keys);
  }
}

function getCheckedKeys(leafOnly = false): Array<string | number> {
  if (!props.showCheckbox) {
    return [];
  }
  return (treeRef.value?.getCheckedKeys(leafOnly) ?? []) as Array<string | number>;
}

function getCheckedNodes(leafOnly = false): unknown[] {
  if (!props.showCheckbox) {
    return [];
  }
  return treeRef.value?.getCheckedNodes(leafOnly) ?? [];
}

function getHalfCheckedKeys(): Array<string | number> {
  if (!props.showCheckbox) {
    return [];
  }
  return (treeRef.value?.getHalfCheckedKeys() ?? []) as Array<string | number>;
}

function clearSearch(): void {
  searchKeyword.value = "";
  treeRef.value?.filter("");
}

function filter(value: string): void {
  searchKeyword.value = value;
}

function startResize(event: MouseEvent | TouchEvent): void {
  event.preventDefault();
  isResizing.value = true;
  startX.value = event instanceof MouseEvent ? event.clientX : (event.touches[0]?.clientX ?? 0);
  startWidth.value = sidebarWidth.value;
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleResizeMove, { passive: false });
  document.addEventListener("touchend", stopResize);
}

function handleResizeMove(event: MouseEvent | TouchEvent): void {
  if (!isResizing.value) {
    return;
  }
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value);
  }
  rafId.value = requestAnimationFrame(() => {
    const clientX = event instanceof MouseEvent ? event.clientX : (event.touches[0]?.clientX ?? startX.value);
    sidebarWidth.value = clampTreeWidth(startWidth.value + (clientX - startX.value), props.minWidth, props.maxWidth);
  });
}

function stopResize(): void {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleResizeMove);
  document.removeEventListener("touchend", stopResize);
  saveWidthToStorage();
}

onMounted(() => {
  isLoadingFromStorage.value = true;
  if (!collapsed.value && props.enableStorage) {
    const saved = getSavedWidth();
    if (saved !== null) {
      sidebarWidth.value = saved;
    }
  }
  void nextTick(() => {
    isLoadingFromStorage.value = false;
    if (expandedAll.value) {
      expandAllNodes();
    }
  });
});

onBeforeUnmount(() => {
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value);
  }
  if (saveWidthTimer.value) {
    clearTimeout(saveWidthTimer.value);
  }
  stopResize();
});

defineExpose({
  setCurrentKey,
  getCurrentNode,
  getCurrentKey,
  setCheckedKeys,
  getCheckedKeys,
  getCheckedNodes,
  getHalfCheckedKeys,
  clearSearch,
  filter,
  expandAllNodes,
  collapseAllNodes,
  toggleCollapsed,
  getCurrentWidth: () => sidebarWidth.value,
  setWidth: (width: number) => {
    sidebarWidth.value = clampTreeWidth(width, props.minWidth, props.maxWidth);
    saveWidthToStorage();
  },
});
</script>

<template>
  <div
    class="tree-sidebar"
    :class="{
      collapsed,
      resizing: isResizing,
      'no-initial-transition': isLoadingFromStorage,
    }"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <div
      v-if="!collapsed"
      class="resize-handle"
      :class="{ active: isResizing }"
      @mousedown="startResize"
      @touchstart="startResize"
    />
    <div class="tree-header">
      <span v-show="!collapsed" class="tree-title">
        <el-icon><component :is="titleIcon" /></el-icon>
        {{ title }}
      </span>
      <div v-show="!collapsed" class="tree-actions">
        <el-tooltip :content="expandedAll ? '收起全部' : '展开全部'" placement="right">
          <el-icon class="tree-action-icon" @click="expandedAll = !expandedAll">
            <ArrowDown v-if="expandedAll" />
            <ArrowUp v-else />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="刷新" placement="right">
          <el-icon class="tree-action-icon" @click="handleRefresh"><Refresh /></el-icon>
        </el-tooltip>
        <slot name="actions" />
      </div>
    </div>
    <div class="collapse-button-container">
      <el-tooltip :content="collapsed ? '展开' : '收起'" placement="right">
        <el-icon class="collapse-button" @click="toggleCollapsed">
          <DArrowRight v-if="collapsed" />
          <DArrowLeft v-else />
        </el-icon>
      </el-tooltip>
    </div>
    <div v-if="showSearch" v-show="!collapsed" class="tree-search">
      <el-input v-model="searchKeyword" :placeholder="searchPlaceholder" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div v-show="!collapsed" class="tree-wrap">
      <p v-if="isEmpty" class="tree-empty">暂无数据</p>
      <el-tree
        v-else
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :expand-on-click-node="expandOnClickNode"
        :filter-node-method="filterNodeMethod"
        :default-expand-all="defaultExpandAll"
        :default-expanded-keys="defaultExpandedKeys"
        :node-key="nodeKey"
        :check-strictly="checkStrictly"
        :show-checkbox="showCheckbox"
        :lazy="lazy"
        :load="load"
        @node-click="(data: TreePanelNode, node: unknown, event: Event) => emit('node-click', data, node, event)"
        @check="(data: TreePanelNode, checked: unknown) => emit('check', data, checked)"
        @node-expand="(data: TreePanelNode, node: unknown, event: Event) => emit('node-expand', data, node, event)"
        @node-collapse="(data: TreePanelNode, node: unknown, event: Event) => emit('node-collapse', data, node, event)"
      >
        <template #default="{ node, data }">
          <slot name="node" :node="node" :data="data">
            <span class="tree-node">
              <el-icon class="node-icon">
                <Folder v-if="Array.isArray(data.children) && data.children.length" />
                <Document v-else />
              </el-icon>
              <span class="node-label" :title="String(node.label)">{{ node.label }}</span>
            </span>
          </slot>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-sidebar {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--app-surface, #fff);
  border-right: 1px solid var(--app-border, #e8eaed);
  transition: width 0.25s ease;

  &.collapsed {
    width: 42px;
  }

  &.resizing {
    transition: none;
  }

  &.no-initial-transition {
    transition: none;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  width: 6px;
  height: 100%;
  cursor: col-resize;
}

.tree-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px;
  background: var(--app-surface-muted, #f7f8fa);
  border-bottom: 1px solid var(--app-border, #e8eaed);
}

.tree-title,
.tree-actions,
.tree-node {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tree-action-icon,
.collapse-button {
  padding: 4px;
  color: var(--app-text-muted, #909399);
  cursor: pointer;
}

.collapse-button-container {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 20px;
  background: var(--app-surface, #fff);
  border-radius: 0 4px 4px 0;
  transform: translateY(-50%);
}

.tree-search {
  flex-shrink: 0;
  padding: 10px 10px 4px;
}

.tree-wrap {
  flex: 1;
  padding: 6px 6px 12px;
  overflow-y: auto;
}

.tree-empty {
  margin: 24px 0;
  color: var(--app-text-muted, #909399);
  font-size: 13px;
  text-align: center;
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
