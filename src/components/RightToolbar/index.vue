<script setup lang="ts">
import { computed, ref } from "vue";
import { Menu, Refresh, Search } from "@element-plus/icons-vue";
import { localCache } from "@/http/cache";
import {
  applyTransferHiddenKeys,
  hiddenTransferKeys,
  isAllColumnsVisible,
  isSomeColumnsVisible,
  restoreColumnVisibility,
  setAllColumnsVisible,
  snapshotColumnVisibility,
  transferData,
  type ColumnCollection,
} from "./model";

const props = withDefaults(
  defineProps<{
    showSearch?: boolean;
    columns?: ColumnCollection;
    search?: boolean;
    showColumnsType?: "transfer" | "checkbox";
    gutter?: number;
    storageKey?: string;
  }>(),
  {
    showSearch: true,
    columns: () => ({}),
    search: true,
    showColumnsType: "checkbox",
    gutter: 10,
    storageKey: "",
  },
);

const emit = defineEmits<{
  "update:showSearch": [value: boolean];
  queryTable: [];
}>();

const hiddenKeys = ref<number[]>([]);
const open = ref(false);
const style = computed(() => (props.gutter ? { marginRight: `${props.gutter / 2}px` } : {}));
const isChecked = computed({
  get: () => isAllColumnsVisible(props.columns),
  set: () => undefined,
});
const isIndeterminate = computed(() => isSomeColumnsVisible(props.columns) && !isChecked.value);

if (props.storageKey) {
  restoreColumnVisibility(props.columns, localCache.getJSON(props.storageKey));
}
if (props.showColumnsType === "transfer") {
  hiddenKeys.value = hiddenTransferKeys(props.columns);
}

function persist(): void {
  if (!props.storageKey) {
    return;
  }
  localCache.setJSON(props.storageKey, snapshotColumnVisibility(props.columns));
}

function toggleSearch(): void {
  emit("update:showSearch", !props.showSearch);
}

function refresh(): void {
  emit("queryTable");
}

function dataChange(keys: number[] | string[]): void {
  applyTransferHiddenKeys(
    props.columns,
    keys.map((key) => Number(key)),
  );
  persist();
}

function checkboxChange(visible: boolean | string | number, key: string | number): void {
  const next = Boolean(visible);
  if (Array.isArray(props.columns)) {
    const column = props.columns.find((item) => item.key === key);
    if (column) {
      column.visible = next;
    }
  } else {
    const column = props.columns[String(key)];
    if (column) {
      column.visible = next;
    }
  }
  persist();
}

function toggleCheckAll(): void {
  setAllColumnsVisible(props.columns, !isChecked.value);
  persist();
}
</script>

<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip v-if="search" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
        <el-button circle :icon="Search" @click="toggleSearch" />
      </el-tooltip>
      <el-tooltip content="刷新" placement="top">
        <el-button circle :icon="Refresh" @click="refresh" />
      </el-tooltip>
      <el-tooltip v-if="Object.keys(columns).length > 0" content="显隐列" placement="top">
        <el-button v-if="showColumnsType === 'transfer'" circle :icon="Menu" @click="open = true" />
        <el-dropdown v-else trigger="click" :hide-on-click="false" style="padding-left: 12px">
          <el-button circle :icon="Menu" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox :indeterminate="isIndeterminate" :model-value="isChecked" @change="toggleCheckAll">
                  列展示
                </el-checkbox>
              </el-dropdown-item>
              <div class="check-line" />
              <template v-if="Array.isArray(columns)">
                <el-dropdown-item v-for="item in columns" :key="String(item.key ?? item.label)">
                  <el-checkbox
                    :model-value="item.visible"
                    :label="item.label"
                    @change="(value: string | number | boolean) => checkboxChange(value, item.key ?? item.label)"
                  />
                </el-dropdown-item>
              </template>
              <template v-else>
                <el-dropdown-item v-for="(item, key) in columns" :key="key">
                  <el-checkbox
                    :model-value="item.visible"
                    :label="item.label"
                    @change="(value: string | number | boolean) => checkboxChange(value, key)"
                  />
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </el-row>
    <el-dialog v-model="open" title="显示/隐藏" append-to-body>
      <el-transfer v-model="hiddenKeys" :titles="['显示', '隐藏']" :data="transferData(columns)" @change="dataChange" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-transfer__button) {
  display: block;
  margin-left: 0;
  border-radius: 50%;
}

:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

.check-line {
  width: 90%;
  height: 1px;
  margin: 3px auto;
  background-color: var(--el-border-color, #ccc);
}
</style>
