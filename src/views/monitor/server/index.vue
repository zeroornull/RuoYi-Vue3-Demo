<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { ElLoading } from "element-plus";
import { CoffeeCup, Cpu, MessageBox, Monitor, Refresh, Tickets } from "@element-plus/icons-vue";
import { getServer } from "../../../api/monitor/server";
import { createBoundChart } from "../../../charts/use-chart";
import { useSettingsStore } from "../../../stores/modules/settings";
import { createVisibilityPoll } from "../../../utils/visibility-poll";
import type { ServerOverview } from "../../../types/api/monitor";
import {
  SERVER_PAGE_NAME,
  SERVER_POLL_INTERVAL_MS,
  coalesceServer,
  emptyServerOverview,
  usageDanger,
  usageGaugeOption,
} from "./model";

defineOptions({ name: SERVER_PAGE_NAME });

const settings = useSettingsStore();
const server = ref<ServerOverview>(emptyServerOverview());
const firstLoad = ref(true);
const cpuEl = ref<HTMLDivElement>();
const memEl = ref<HTMLDivElement>();
const jvmEl = ref<HTMLDivElement>();
const cpuChart = createBoundChart();
const memChart = createBoundChart();
const jvmChart = createBoundChart();

function renderCharts(): void {
  cpuChart.render(cpuEl.value, settings.isDark, usageGaugeOption("CPU", server.value.cpu.used));
  memChart.render(memEl.value, settings.isDark, usageGaugeOption("内存", server.value.mem.usage));
  jvmChart.render(jvmEl.value, settings.isDark, usageGaugeOption("JVM", server.value.jvm.usage));
}

async function getList(): Promise<void> {
  const loading = firstLoad.value
    ? ElLoading.service({
        text: "正在加载服务监控数据，请稍候！",
        background: "rgba(0, 0, 0, 0.7)",
      })
    : null;
  try {
    const response = await getServer();
    server.value = coalesceServer(response.data);
    renderCharts();
  } finally {
    loading?.close();
    firstLoad.value = false;
  }
}

const poll = createVisibilityPoll({
  intervalMs: SERVER_POLL_INTERVAL_MS,
  run: getList,
  isVisible: () => typeof document === "undefined" || document.visibilityState === "visible",
});

watch(
  () => settings.isDark,
  () => {
    cpuChart.dispose();
    memChart.dispose();
    jvmChart.dispose();
    renderCharts();
  },
);

onMounted(() => {
  void getList().then(() => poll.start());
});

onUnmounted(() => {
  poll.stop();
  cpuChart.dispose();
  memChart.dispose();
  jvmChart.dispose();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" class="toolbar">
        <el-button v-hasPermi="['monitor:server:list']" type="primary" plain :icon="Refresh" @click="getList">刷新</el-button>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <template #header>CPU</template>
          <div ref="cpuEl" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <template #header>内存</template>
          <div ref="memEl" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <template #header>JVM</template>
          <div ref="jvmEl" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <el-icon><Cpu /></el-icon>
            <span>CPU</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="核心数">{{ server.cpu.cpuNum }}</el-descriptions-item>
            <el-descriptions-item label="用户使用率">{{ server.cpu.used }}%</el-descriptions-item>
            <el-descriptions-item label="系统使用率">{{ server.cpu.sys }}%</el-descriptions-item>
            <el-descriptions-item label="当前空闲率">{{ server.cpu.free }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <el-icon><Tickets /></el-icon>
            <span>内存</span>
          </template>
          <el-table :data="[{ key: '总内存', mem: `${server.mem.total}G`, jvm: `${server.jvm.total}M` }, { key: '已用内存', mem: `${server.mem.used}G`, jvm: `${server.jvm.used}M` }, { key: '剩余内存', mem: `${server.mem.free}G`, jvm: `${server.jvm.free}M` }, { key: '使用率', mem: `${server.mem.usage}%`, jvm: `${server.jvm.usage}%`, dangerMem: usageDanger(server.mem.usage), dangerJvm: usageDanger(server.jvm.usage) }]">
            <el-table-column prop="key" label="属性" />
            <el-table-column label="内存">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.dangerMem }">{{ row.mem }}</span>
              </template>
            </el-table-column>
            <el-table-column label="JVM">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.dangerJvm }">{{ row.jvm }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <el-icon><Monitor /></el-icon>
            <span>服务器信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="服务器名称">{{ server.sys.computerName }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ server.sys.osName }}</el-descriptions-item>
            <el-descriptions-item label="服务器IP">{{ server.sys.computerIp }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ server.sys.osArch }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <el-icon><CoffeeCup /></el-icon>
            <span>Java虚拟机信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Java名称">{{ server.jvm.name }}</el-descriptions-item>
            <el-descriptions-item label="Java版本">{{ server.jvm.version }}</el-descriptions-item>
            <el-descriptions-item label="启动时间">{{ server.jvm.startTime }}</el-descriptions-item>
            <el-descriptions-item label="运行时长">{{ server.jvm.runTime }}</el-descriptions-item>
            <el-descriptions-item label="安装路径" :span="2">{{ server.jvm.home }}</el-descriptions-item>
            <el-descriptions-item label="项目路径" :span="2">{{ server.sys.userDir }}</el-descriptions-item>
            <el-descriptions-item label="运行参数" :span="2">{{ server.jvm.inputArgs }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <el-icon><MessageBox /></el-icon>
            <span>磁盘状态</span>
          </template>
          <el-table :data="server.sysFiles">
            <el-table-column prop="dirName" label="盘符路径" />
            <el-table-column prop="sysTypeName" label="文件系统" />
            <el-table-column prop="typeName" label="盘符类型" />
            <el-table-column prop="total" label="总大小" />
            <el-table-column prop="free" label="可用大小" />
            <el-table-column prop="used" label="已用大小" />
            <el-table-column label="已用百分比">
              <template #default="{ row }">
                <span :class="{ 'text-danger': usageDanger(row.usage) }">{{ row.usage }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 10px;
}
.card-box {
  margin-bottom: 10px;
}
.el-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chart-box {
  height: 220px;
}
.text-danger {
  color: var(--el-color-danger);
}
</style>
