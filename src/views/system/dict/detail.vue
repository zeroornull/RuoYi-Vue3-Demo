<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Document, List, Loading } from "@element-plus/icons-vue";
import { listData } from "../../../api/system/dict/data";
import type { DictData, DictType } from "../../../types/api/system";

const props = defineProps<{
  visible: boolean;
  row: Partial<DictType>;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const loading = ref(false);
const dataList = ref<DictData[]>([]);
const normalCount = computed(() => dataList.value.filter((item) => item.status === "0").length);
const disabledCount = computed(() => dataList.value.filter((item) => item.status === "1").length);

watch(
  () => [props.visible, props.row.dictType] as const,
  async ([visible, dictType]) => {
    if (!visible || !dictType) {
      return;
    }
    loading.value = true;
    try {
      const response = await listData({
        pageNum: 1,
        pageSize: 200,
        dictType,
      });
      dataList.value = response.rows;
    } finally {
      loading.value = false;
    }
  },
);
</script>

<template>
  <el-drawer
    :model-value="visible"
    direction="rtl"
    size="700px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div class="drawer-head">
        <el-icon><List /></el-icon>
        <span>{{ row.dictName }}</span>
        <span class="drawer-head-type">{{ row.dictType }}</span>
      </div>
    </template>
    <div v-if="loading" class="drawer-empty">
      <el-icon class="is-loading"><Loading /></el-icon> 加载中...
    </div>
    <div v-else-if="dataList.length === 0" class="drawer-empty">
      <el-icon :size="36"><Document /></el-icon>
      <div>暂无字典数据</div>
    </div>
    <template v-else>
      <p>共计 {{ dataList.length }}，正常 {{ normalCount }}，停用 {{ disabledCount }}</p>
      <div v-for="item in dataList" :key="item.dictCode" class="dict-item">
        <div>标签：{{ item.dictLabel }}</div>
        <div>键值：{{ item.dictValue }}</div>
        <div>状态：{{ item.status === "0" ? "正常" : "停用" }}</div>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.drawer-head,
.drawer-empty,
.dict-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.drawer-head-type {
  color: var(--el-text-color-secondary);
}

.dict-item {
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
