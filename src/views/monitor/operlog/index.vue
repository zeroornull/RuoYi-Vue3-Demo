<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, TableInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Refresh, Search, View } from "@element-plus/icons-vue";
import { cleanOperlog, delOperlog, list as listOperlog } from "../../../api/monitor/operlog";
import { download } from "../../../http";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { useDict } from "../../../composables/useDict";
import { emptySelection, firstPage, idsForAction, replaceObject, selectionFromRows } from "../../../composables/crud";
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import type { OperationLog } from "../../../types/api/monitor";
import { tableSortToQuery, type TableSortEvent } from "../log-query";
import OperlogDetail from "./detail.vue";
import { OPERLOG_DEFAULT_SORT, OPERLOG_PAGE_NAME, emptyOperationLogQuery } from "./model";

defineOptions({ name: OPERLOG_PAGE_NAME });

const { sys_oper_type, sys_common_status } = useDict("sys_oper_type", "sys_common_status");
const queryRef = ref<FormInstance>();
const tableRef = ref<TableInstance>();
const operlogList = ref<OperationLog[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const detailVisible = ref(false);
const detailRow = ref<OperationLog | null>(null);
const dateRange = ref<[string, string] | []>([]);
const queryParams = reactive(emptyOperationLogQuery());
const selection = ref(emptySelection<string>());

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listOperlog(addDateRange({ ...queryParams }, dateRange.value));
    operlogList.value = response.rows;
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
  dateRange.value = [];
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyOperationLogQuery());
  tableRef.value?.sort(OPERLOG_DEFAULT_SORT.prop, OPERLOG_DEFAULT_SORT.order);
  handleQuery();
}

function handleSortChange(sort: TableSortEvent): void {
  const mapped = tableSortToQuery(sort);
  queryParams.orderByColumn = mapped.orderByColumn ?? OPERLOG_DEFAULT_SORT.prop;
  queryParams.isAsc = mapped.isAsc ?? "desc";
  void getList();
}

function handleDetail(row: OperationLog): void {
  detailRow.value = row;
  detailVisible.value = true;
}

async function handleDelete(): Promise<void> {
  const ids = idsForAction(undefined, (row: OperationLog) => row.operId, selection.value.ids);
  await ElMessageBox.confirm(`是否确认删除日志编号为"${String(ids)}"的数据项?`, "警告", {
    type: "warning",
  });
  await delOperlog(ids);
  ElMessage.success("删除成功");
  await getList();
}

async function handleClean(): Promise<void> {
  await ElMessageBox.confirm("是否确认清空所有操作日志数据项?", "警告", { type: "warning" });
  await cleanOperlog();
  ElMessage.success("清空成功");
  await getList();
}

function handleExport(): void {
  void download("monitor/operlog/export", { ...queryParams }, `operlog_${Date.now()}.xlsx`);
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="操作地址" prop="operIp">
        <el-input v-model="queryParams.operIp" placeholder="请输入操作地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="系统模块" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入系统模块" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable>
          <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="操作状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['monitor:operlog:remove']"
          type="danger"
          plain
          :icon="Delete"
          :disabled="selection.multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:operlog:remove']" type="danger" plain :icon="Delete" @click="handleClean"
          >清空</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:operlog:export']" type="warning" plain :icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="operlogList"
      :default-sort="OPERLOG_DEFAULT_SORT"
      @selection-change="(rows: OperationLog[]) => (selection = selectionFromRows(rows, (row) => row.operId))"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="日志编号" align="center" prop="operId" />
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="操作类型" align="center" prop="businessType">
        <template #default="{ row }">
          <DictTag :options="sys_oper_type" :value="row.businessType" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作人员"
        align="center"
        width="110"
        prop="operName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="操作地址" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作日期"
        align="center"
        prop="operTime"
        width="180"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template #default="{ row }">{{ parseTime(row.operTime) }}</template>
      </el-table-column>
      <el-table-column
        label="消耗时间"
        align="center"
        prop="costTime"
        width="110"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template #default="{ row }">{{ row.costTime }}毫秒</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['monitor:operlog:query']" link type="primary" :icon="View" @click="handleDetail(row)"
            >详细</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <OperlogDetail v-model:visible="detailVisible" :row="detailRow" />
  </div>
</template>
