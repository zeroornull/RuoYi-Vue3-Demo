<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Close, Delete, Download, Refresh, Search, View } from "@element-plus/icons-vue";
import { getJob } from "../../../api/monitor/job";
import { cleanJobLog, delJobLog, listJobLog } from "../../../api/monitor/jobLog";
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
import { parseSingleRouteParam } from "../../../router/params";
import { useTagsViewStore } from "../../../stores/modules/tags-view";
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import { closeCurrentPage } from "../../profile/close";
import type { JobLog } from "../../../types/api/monitor";
import JobDetail from "./detail.vue";
import {
  ALL_JOB_LOGS_ID,
  JOB_LOG_PAGE_NAME,
  emptyJobLogQuery,
} from "./model";

defineOptions({ name: JOB_LOG_PAGE_NAME });

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsViewStore();
const { sys_common_status, sys_job_group } = useDict("sys_common_status", "sys_job_group");
const queryRef = ref<FormInstance>();
const jobLogList = ref<JobLog[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const open = ref(false);
const detailRow = ref<JobLog | null>(null);
const dateRange = ref<[string, string] | []>([]);
const queryParams = reactive(emptyJobLogQuery());
const selection = ref(emptySelection<string>());

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listJobLog(addDateRange({ ...queryParams }, dateRange.value));
    jobLogList.value = response.rows;
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
  replaceObject(queryParams, emptyJobLogQuery());
  handleQuery();
}

function handleClose(): void {
  closeCurrentPage(router, route, tagsStore);
}

function handleView(row: JobLog): void {
  detailRow.value = row;
  open.value = true;
}

async function handleDelete(): Promise<void> {
  const ids = idsForAction(undefined, (row: JobLog) => row.jobLogId, selection.value.ids);
  await ElMessageBox.confirm(`是否确认删除调度日志编号为"${String(ids)}"的数据项?`, "警告", {
    type: "warning",
  });
  await delJobLog(ids);
  ElMessage.success("删除成功");
  await getList();
}

async function handleClean(): Promise<void> {
  await ElMessageBox.confirm("是否确认清空所有调度日志数据项?", "警告", { type: "warning" });
  await cleanJobLog();
  ElMessage.success("清空成功");
  await getList();
}

function handleExport(): void {
  void download("monitor/jobLog/export", { ...queryParams }, `job_log_${Date.now()}.xlsx`);
}

onMounted(() => {
  const jobId = parseSingleRouteParam(route.params.jobId);
  if (jobId && jobId !== ALL_JOB_LOGS_ID) {
    void getJob(jobId).then(async (response) => {
      queryParams.jobName = response.data.jobName;
      queryParams.jobGroup = response.data.jobGroup;
      await getList();
    });
    return;
  }
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" placeholder="请输入任务名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable>
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择执行状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain :icon="Delete" @click="handleClean">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:export']" type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain :icon="Close" @click="handleClose">关闭</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="jobLogList"
      @selection-change="(rows: JobLog[]) => (selection = selectionFromRows(rows, (row) => row.jobLogId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志编号" width="80" align="center" prop="jobLogId" />
      <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务组名" align="center" prop="jobGroup" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <DictTag :options="sys_job_group" :value="row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="日志信息" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="执行状态" align="center" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['monitor:job:query']" link type="primary" :icon="View" @click="handleView(row)">详细</el-button>
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
    <JobDetail v-model:visible="open" type="log" :row="detailRow" />
  </div>
</template>
