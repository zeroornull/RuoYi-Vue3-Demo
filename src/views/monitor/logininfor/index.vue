<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, TableInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Refresh, Search, Unlock } from "@element-plus/icons-vue";
import {
  cleanLogininfor,
  delLogininfor,
  list as listLogininfor,
  unlockLogininfor,
} from "../../../api/monitor/logininfor";
import { download } from "../../../http";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { useDict } from "../../../composables/useDict";
import {
  emptySelection,
  firstPage,
  idsForAction,
  replaceObject,
  selectionFromRows,
} from "../../../composables/crud";
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import type { LoginInfoLog } from "../../../types/api/monitor";
import { tableSortToQuery, type TableSortEvent } from "../log-query";
import {
  LOGININFOR_DEFAULT_SORT,
  LOGININFOR_PAGE_NAME,
  emptyLoginInfoQuery,
} from "./model";

defineOptions({ name: LOGININFOR_PAGE_NAME });

const { sys_common_status } = useDict("sys_common_status");
const queryRef = ref<FormInstance>();
const tableRef = ref<TableInstance>();
const logininforList = ref<LoginInfoLog[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[string, string] | []>([]);
const queryParams = reactive(emptyLoginInfoQuery());
const selection = ref(emptySelection<string>());

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listLogininfor(addDateRange({ ...queryParams }, dateRange.value));
    logininforList.value = response.rows;
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
  replaceObject(queryParams, emptyLoginInfoQuery());
  tableRef.value?.sort(LOGININFOR_DEFAULT_SORT.prop, LOGININFOR_DEFAULT_SORT.order);
  handleQuery();
}

function handleSortChange(sort: TableSortEvent): void {
  const mapped = tableSortToQuery(sort);
  queryParams.orderByColumn = mapped.orderByColumn ?? LOGININFOR_DEFAULT_SORT.prop;
  queryParams.isAsc = mapped.isAsc ?? "desc";
  void getList();
}

async function handleDelete(): Promise<void> {
  const ids = idsForAction(undefined, (row: LoginInfoLog) => row.infoId, selection.value.ids);
  await ElMessageBox.confirm(`是否确认删除访问编号为"${String(ids)}"的数据项?`, "警告", {
    type: "warning",
  });
  await delLogininfor(ids);
  ElMessage.success("删除成功");
  await getList();
}

async function handleClean(): Promise<void> {
  await ElMessageBox.confirm("是否确认清空所有登录日志数据项?", "警告", { type: "warning" });
  await cleanLogininfor();
  ElMessage.success("清空成功");
  await getList();
}

async function handleUnlock(): Promise<void> {
  const selected = selection.value.rows[0] as LoginInfoLog | undefined;
  if (!selected) {
    return;
  }
  await ElMessageBox.confirm(`是否确认解锁用户"${selected.userName}"数据项?`, "警告", {
    type: "warning",
  });
  await unlockLogininfor(selected.userName);
  ElMessage.success(`用户${selected.userName}解锁成功`);
}

function handleExport(): void {
  void download("monitor/logininfor/export", { ...queryParams }, `logininfor_${Date.now()}.xlsx`);
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="登录状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
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
        <el-button v-hasPermi="['monitor:logininfor:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:logininfor:remove']" type="danger" plain :icon="Delete" @click="handleClean">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:logininfor:unlock']" type="primary" plain :icon="Unlock" :disabled="selection.single" @click="handleUnlock">解锁</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:logininfor:export']" type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="logininforList"
      :default-sort="LOGININFOR_DEFAULT_SORT"
      @selection-change="(rows: LoginInfoLog[]) => (selection = selectionFromRows(rows, (row) => row.infoId))"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="访问编号" align="center" prop="infoId" />
      <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录状态" align="center" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column label="访问时间" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template #default="{ row }">{{ parseTime(row.loginTime) }}</template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>
