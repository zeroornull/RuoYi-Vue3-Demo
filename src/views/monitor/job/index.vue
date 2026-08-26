<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CaretRight,
  Delete,
  Download,
  Edit,
  Operation,
  Plus,
  QuestionFilled,
  Refresh,
  Search,
} from "@element-plus/icons-vue";
import {
  addJob,
  changeJobStatus,
  delJob,
  getJob,
  listJob,
  runJob,
  updateJob,
} from "../../../api/monitor/job";
import { download } from "../../../http";
import Crontab from "../../../components/Crontab/index.vue";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { submitForm } from "../../../components/form";
import { useDict } from "../../../composables/useDict";
import {
  asSingleId,
  confirmDeleteMessage,
  emptySelection,
  firstPage,
  idsForAction,
  replaceObject,
  selectionFromRows,
} from "../../../composables/crud";
import type { Job, JobUpsertRequest } from "../../../types/api/monitor";
import JobDetail from "./detail.vue";
import {
  ALL_JOB_LOGS_ID,
  JOB_PAGE_NAME,
  MISFIRE_OPTIONS,
  emptyJobForm,
  emptyJobQuery,
  jobStatusChangeText,
  jobToForm,
} from "./model";

defineOptions({ name: JOB_PAGE_NAME });

const router = useRouter();
const { sys_job_group, sys_job_status } = useDict("sys_job_group", "sys_job_status");
const queryRef = ref<FormInstance>();
const jobFormRef = ref<FormInstance>();
const jobList = ref<Job[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const open = ref(false);
const openView = ref(false);
const openCron = ref(false);
const title = ref("");
const cronExpression = ref("");
const detailRow = ref<Job | null>(null);
const queryParams = reactive(emptyJobQuery());
const form = reactive<JobUpsertRequest>(emptyJobForm());
const selection = ref(emptySelection<string>());
const rules: FormRules<JobUpsertRequest> = {
  jobName: [{ required: true, message: "任务名称不能为空", trigger: "blur" }],
  invokeTarget: [{ required: true, message: "调用目标字符串不能为空", trigger: "blur" }],
  cronExpression: [{ required: true, message: "cron执行表达式不能为空", trigger: "change" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listJob({ ...queryParams });
    jobList.value = response.rows;
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
  replaceObject(queryParams, emptyJobQuery());
  handleQuery();
}

function resetFormModel(): void {
  replaceObject(form, emptyJobForm());
  jobFormRef.value?.resetFields();
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加任务";
  open.value = true;
}

async function handleUpdate(row?: Job): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.jobId, selection.value.ids));
  if (id === undefined) {
    return;
  }
  resetFormModel();
  const response = await getJob(id);
  replaceObject(form, jobToForm(response.data));
  title.value = "修改任务";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(jobFormRef.value))) {
    return;
  }
  if (form.jobId) {
    await updateJob(form);
    ElMessage.success("修改成功");
  } else {
    await addJob(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: Job): Promise<void> {
  const ids = idsForAction(row, (item) => item.jobId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("定时任务", ids), "警告", { type: "warning" });
  await delJob(ids);
  ElMessage.success("删除成功");
  await getList();
}

async function handleStatusChange(row: Job): Promise<void> {
  const text = jobStatusChangeText(row.status);
  try {
    await ElMessageBox.confirm(`确认要"${text}""${row.jobName}"任务吗?`, "警告", {
      type: "warning",
    });
    await changeJobStatus(row.jobId, row.status);
    ElMessage.success(`${text}成功`);
  } catch {
    row.status = row.status === "0" ? "1" : "0";
  }
}

async function handleRun(row: Job): Promise<void> {
  await ElMessageBox.confirm(`确认要立即执行一次"${row.jobName}"任务吗?`, "警告", {
    type: "warning",
  });
  await runJob(row.jobId, row.jobGroup);
  ElMessage.success("执行成功");
}

async function handleView(row: Job): Promise<void> {
  const response = await getJob(row.jobId);
  detailRow.value = response.data;
  openView.value = true;
}

function handleShowCron(): void {
  cronExpression.value = form.cronExpression;
  openCron.value = true;
}

function crontabFill(value: string): void {
  form.cronExpression = value;
}

function handleJobLog(row?: Job): void {
  const jobId = row?.jobId ?? ALL_JOB_LOGS_ID;
  void router.push(`/monitor/job-log/index/${jobId}`);
}

function handleExport(): void {
  void download("monitor/job/export", { ...queryParams }, `job_${Date.now()}.xlsx`);
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" placeholder="请输入任务名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable>
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable>
          <el-option v-for="dict in sys_job_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:add']" type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:edit']" type="success" plain :icon="Edit" :disabled="selection.single" @click="handleUpdate()">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:export']" type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:query']" type="info" plain :icon="Operation" @click="handleJobLog()">日志</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="jobList"
      @selection-change="(rows: Job[]) => (selection = selectionFromRows(rows, (row) => row.jobId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" width="100" align="center" prop="jobId" />
      <el-table-column label="任务名称" align="center" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <a class="link-type" @click="handleView(row)">{{ row.jobName }}</a>
        </template>
      </el-table-column>
      <el-table-column label="任务组名" align="center" prop="jobGroup">
        <template #default="{ row }">
          <DictTag :options="sys_job_group" :value="row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="cron执行表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['monitor:job:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['monitor:job:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)" />
          </el-tooltip>
          <el-tooltip content="执行一次" placement="top">
            <el-button v-hasPermi="['monitor:job:changeStatus']" link type="primary" :icon="CaretRight" @click="handleRun(row)" />
          </el-tooltip>
          <el-tooltip content="调度日志" placement="top">
            <el-button v-hasPermi="['monitor:job:query']" link type="primary" :icon="Operation" @click="handleJobLog(row)" />
          </el-tooltip>
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
    <el-dialog v-model="open" :title="title" width="820px" append-to-body>
      <el-form ref="jobFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择">
                <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                        <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">生成表达式</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="form.jobId" :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_job_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy">
                <el-radio-button v-for="item in MISFIRE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent">
                <el-radio-button value="0">允许</el-radio-button>
                <el-radio-button value="1">禁止</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="openCron" title="Cron表达式生成器" append-to-body destroy-on-close>
      <Crontab :expression="cronExpression" @hide="openCron = false" @fill="crontabFill" />
    </el-dialog>
    <JobDetail v-model:visible="openView" type="job" :row="detailRow" />
  </div>
</template>
