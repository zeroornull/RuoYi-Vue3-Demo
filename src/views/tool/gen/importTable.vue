<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance, TableInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { Refresh, Search } from "@element-plus/icons-vue";
import { importTable, listDbTable } from "../../../api/tool/gen";
import Pagination from "../../../components/Pagination/index.vue";
import { firstPage, replaceObject } from "../../../composables/crud";
import type { GeneratorTable } from "../../../types/api/tool";
import { emptyGenDbQuery } from "./model";

const emit = defineEmits<{
  ok: [];
}>();

const visible = ref(false);
const loading = ref(false);
const total = ref(0);
const dbTableList = ref<GeneratorTable[]>([]);
const selectedNames = ref<string[]>([]);
const tableRef = ref<TableInstance>();
const queryRef = ref<FormInstance>();
const queryParams = reactive(emptyGenDbQuery());

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listDbTable({ ...queryParams });
    dbTableList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyGenDbQuery());
  handleQuery();
}

function clickRow(row: GeneratorTable): void {
  tableRef.value?.toggleRowSelection(row);
}

function handleSelectionChange(rows: GeneratorTable[]): void {
  selectedNames.value = rows.map((row) => row.tableName);
}

async function handleImportTable(): Promise<void> {
  if (selectedNames.value.length === 0) {
    ElMessage.error("请选择要导入的表");
    return;
  }
  const response = await importTable({
    tables: selectedNames.value.join(","),
    tplWebType: "element-plus",
  });
  ElMessage.success(response.msg ?? "导入成功");
  visible.value = false;
  emit("ok");
}

function show(): void {
  selectedNames.value = [];
  replaceObject(queryParams, emptyGenDbQuery());
  visible.value = true;
  void getList();
}

defineExpose({ show });
</script>

<template>
  <el-dialog v-model="visible" title="导入表" width="800px" top="5vh" append-to-body>
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名称"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="请输入表描述"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="dbTableList"
      height="260px"
      @row-click="clickRow"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="tableName" label="表名称" show-overflow-tooltip />
      <el-table-column prop="tableComment" label="表描述" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="updateTime" label="更新时间" />
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <template #footer>
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>
