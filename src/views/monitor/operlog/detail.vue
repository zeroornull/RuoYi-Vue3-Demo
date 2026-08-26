<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import {
  CopyDocument,
  Download,
  InfoFilled,
  Sort,
  Upload,
  User,
  Warning,
} from "@element-plus/icons-vue";
import { useDict } from "../../../composables/useDict";
import type { OperationLog } from "../../../types/api/monitor";
import {
  OPERLOG_DETAIL_PAGE_NAME,
  formatJsonBlock,
  isFailedOperation,
} from "./model";

defineOptions({ name: OPERLOG_DETAIL_PAGE_NAME });

const props = defineProps<{
  visible: boolean;
  row: OperationLog | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const { sys_oper_type } = useDict("sys_oper_type");
const form = computed(() => props.row);

async function copyText(value: string | null | undefined): Promise<void> {
  const text = formatJsonBlock(value);
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
  ElMessage.success("已复制");
}
</script>

<template>
  <el-dialog
    title="操作日志详细"
    :model-value="visible"
    width="780px"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="form" class="detail-wrap">
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><InfoFilled /></el-icon> 基本信息</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">操作模块</span><span class="detail-value">{{ form.title }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">业务类型</span><span class="detail-value"><DictTag :options="sys_oper_type" :value="form.businessType" /></span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">操作时间</span><span class="detail-value">{{ form.operTime }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">执行状态</span>
              <el-tag v-if="!isFailedOperation(form)" type="success" size="small">正常</el-tag>
              <el-tag v-else type="danger" size="small">异常</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><User /></el-icon> 操作人员</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">操作人员</span><span class="detail-value">{{ form.operName }}</span></div>
          </el-col>
          <el-col v-if="form.deptName" :span="12">
            <div class="detail-item"><span class="detail-label">所属部门</span><span class="detail-value">{{ form.deptName }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">操作地址</span>
              <span class="detail-value">{{ form.operIp }}&nbsp;&nbsp;<span class="detail-location">{{ form.operLocation }}</span></span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Sort /></el-icon> 请求信息</div>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">请求地址</span>
              <span class="detail-value">
                <span :class="'method-tag method-' + (form.requestMethod ?? '')">{{ form.requestMethod }}</span>
                {{ form.operUrl }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item"><span class="detail-label">操作方法</span><span class="detail-value mono">{{ form.method }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">消耗时间</span><span class="detail-value">{{ form.costTime }} 毫秒</span></div>
          </el-col>
        </el-row>
      </div>
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Upload /></el-icon> 请求参数</div>
        <div class="code-wrap">
          <el-button size="small" :icon="CopyDocument" @click="copyText(form.operParam)">复制</el-button>
          <pre class="code-pre">{{ formatJsonBlock(form.operParam) }}</pre>
        </div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Download /></el-icon> 返回参数</div>
        <div class="code-wrap">
          <el-button size="small" :icon="CopyDocument" @click="copyText(form.jsonResult)">复制</el-button>
          <pre class="code-pre">{{ formatJsonBlock(form.jsonResult) }}</pre>
        </div>
      </div>
      <div v-if="isFailedOperation(form)" class="detail-card">
        <div class="detail-card-title error-title"><el-icon><Warning /></el-icon> 异常信息</div>
        <div class="error-msg">{{ form.errorMsg }}</div>
      </div>
    </div>
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
  min-width: 72px;
}
.detail-value {
  word-break: break-all;
}
.detail-location {
  color: var(--el-text-color-secondary);
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
.method-tag {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.error-title,
.error-msg {
  color: var(--el-color-danger);
}
</style>
