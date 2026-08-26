<script setup lang="ts">
import { computed } from "vue";
import { Calendar, Clock, Document, InfoFilled, Operation, Setting, Warning } from "@element-plus/icons-vue";
import { useDict } from "../../../composables/useDict";
import { parseTime } from "../../../utils/parse-time";
import type { Job, JobLog } from "../../../types/api/monitor";
import { JOB_DETAIL_PAGE_NAME, jobLogCostMs, misfirePolicyLabel, type JobDetailKind } from "./model";

defineOptions({ name: JOB_DETAIL_PAGE_NAME });

const props = defineProps<{
  visible: boolean;
  type: JobDetailKind;
  row: Job | JobLog | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const { sys_job_group } = useDict("sys_job_group");
const job = computed(() => (props.type === "job" ? (props.row as Job | null) : null));
const log = computed(() => (props.type === "log" ? (props.row as JobLog | null) : null));
const costTime = computed(() => jobLogCostMs(log.value));
</script>

<template>
  <el-dialog
    :title="type === 'log' ? '调度日志详细' : '任务详细'"
    :model-value="visible"
    width="780px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="log" class="detail-wrap">
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><InfoFilled /></el-icon> 基本信息
        </div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">日志编号</span><span class="detail-value">{{ log.jobLogId }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">执行状态</span>
              <el-tag v-if="log.status === '0'" type="success" size="small">正常</el-tag>
              <el-tag v-else type="danger" size="small">失败</el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">开始时间</span><span class="detail-value">{{ log.startTime ?? "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">结束时间</span><span class="detail-value">{{ log.endTime ?? "-" }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">记录时间</span><span class="detail-value">{{ log.createTime }}</span>
            </div>
          </el-col>
          <el-col v-if="costTime !== null" :span="12">
            <div class="detail-item">
              <span class="detail-label">执行耗时</span><span class="detail-value">{{ costTime }} 毫秒</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Clock /></el-icon> 任务信息
        </div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">任务名称</span><span class="detail-value">{{ log.jobName }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">任务分组</span>
              <DictTag :options="sys_job_group" :value="log.jobGroup" />
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">日志信息</span><span class="detail-value">{{ log.jobMessage }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Operation /></el-icon> 调用目标
        </div>
        <pre class="code-pre">{{ log.invokeTarget || "（无）" }}</pre>
      </div>
      <div v-if="log.status === '1'" class="detail-card">
        <div class="detail-card-title error-title">
          <el-icon><Warning /></el-icon> 异常信息
        </div>
        <div class="error-msg">{{ log.exceptionInfo }}</div>
      </div>
    </div>
    <div v-else-if="job" class="detail-wrap">
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Setting /></el-icon> 任务配置
        </div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">任务编号</span><span class="detail-value">{{ job.jobId }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">任务名称</span><span class="detail-value">{{ job.jobName }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">任务分组</span>
              <DictTag :options="sys_job_group" :value="job.jobGroup" />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">执行状态</span>
              <el-tag v-if="job.status === '0'" type="success" size="small">正常</el-tag>
              <el-tag v-else type="info" size="small">暂停</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Calendar /></el-icon> 调度信息
        </div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">cron 表达式</span
              ><span class="detail-value mono">{{ job.cronExpression }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">下次执行时间</span
              ><span class="detail-value">{{ parseTime(job.nextValidTime) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">执行策略</span>
              <el-tag
                :type="job.misfirePolicy === '1' ? 'warning' : job.misfirePolicy === '2' ? 'primary' : 'danger'"
                size="small"
              >
                {{ misfirePolicyLabel(job.misfirePolicy) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">并发执行</span>
              <el-tag v-if="job.concurrent === '0'" type="success" size="small">允许</el-tag>
              <el-tag v-else type="danger" size="small">禁止</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Operation /></el-icon> 执行方法
        </div>
        <pre class="code-pre">{{ job.invokeTarget || "（无）" }}</pre>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">
          <el-icon><Document /></el-icon> 元信息
        </div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">创建人</span><span class="detail-value">{{ job.createBy || "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">创建时间</span><span class="detail-value">{{ job.createTime }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">更新人</span><span class="detail-value">{{ job.updateBy || "-" }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">更新时间</span><span class="detail-value">{{ job.updateTime || "-" }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row v-if="job.remark" class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">备注</span><span class="detail-value">{{ job.remark }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('update:visible', false)">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 12px 16px;
}
.detail-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
}
.detail-item {
  display: flex;
  gap: 8px;
  margin: 6px 0;
  line-height: 1.5;
}
.detail-label {
  color: var(--el-text-color-secondary);
  min-width: 80px;
}
.detail-value {
  word-break: break-all;
}
.mono,
.code-pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}
.code-pre {
  margin: 8px 0 0;
  white-space: pre-wrap;
  word-break: break-all;
}
.error-title,
.error-msg {
  color: var(--el-color-danger);
}
</style>
