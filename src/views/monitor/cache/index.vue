<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { ElLoading } from "element-plus";
import { Monitor, Odometer, PieChart, Refresh } from "@element-plus/icons-vue";
import { getCache } from "../../../api/monitor/cache";
import { createBoundChart } from "../../../charts/use-chart";
import { useSettingsStore } from "../../../stores/modules/settings";
import type { CacheOverview } from "../../../types/api/monitor";
import {
  CACHE_PAGE_NAME,
  cacheField,
  commandPieOption,
  emptyCacheOverview,
  formatCpuUsage,
  memoryGaugeOption,
  redisModeLabel,
} from "./model";

defineOptions({ name: CACHE_PAGE_NAME });

const settings = useSettingsStore();
const cache = ref<CacheOverview>(emptyCacheOverview());
const commandEl = ref<HTMLDivElement>();
const memoryEl = ref<HTMLDivElement>();
const commandChart = createBoundChart();
const memoryChart = createBoundChart();
const info = computed(() => cache.value.info);

function renderCharts(): void {
  commandChart.render(
    commandEl.value,
    settings.isDark,
    commandPieOption(cache.value.commandStats),
  );
  memoryChart.render(
    memoryEl.value,
    settings.isDark,
    memoryGaugeOption(info.value.used_memory_human),
  );
}

async function getList(): Promise<void> {
  const loading = ElLoading.service({
    text: "正在加载缓存监控数据，请稍候！",
    background: "rgba(0, 0, 0, 0.7)",
  });
  try {
    const response = await getCache();
    cache.value = response.data ?? emptyCacheOverview();
    renderCharts();
  } finally {
    loading.close();
  }
}

watch(
  () => settings.isDark,
  () => {
    commandChart.dispose();
    memoryChart.dispose();
    renderCharts();
  },
);

onMounted(() => {
  void getList();
});

onUnmounted(() => {
  commandChart.dispose();
  memoryChart.dispose();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <el-icon><Monitor /></el-icon>
            <span>基本信息</span>
            <el-button v-hasPermi="['monitor:cache:list']" link type="primary" :icon="Refresh" @click="getList">刷新</el-button>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="Redis版本">{{ cacheField(info, "redis_version") }}</el-descriptions-item>
            <el-descriptions-item label="运行模式">{{ redisModeLabel(info.redis_mode) }}</el-descriptions-item>
            <el-descriptions-item label="端口">{{ cacheField(info, "tcp_port") }}</el-descriptions-item>
            <el-descriptions-item label="客户端数">{{ cacheField(info, "connected_clients") }}</el-descriptions-item>
            <el-descriptions-item label="运行时间(天)">{{ cacheField(info, "uptime_in_days") }}</el-descriptions-item>
            <el-descriptions-item label="使用内存">{{ cacheField(info, "used_memory_human") }}</el-descriptions-item>
            <el-descriptions-item label="使用CPU">{{ formatCpuUsage(info.used_cpu_user_children) }}</el-descriptions-item>
            <el-descriptions-item label="内存配置">{{ cacheField(info, "maxmemory_human") }}</el-descriptions-item>
            <el-descriptions-item label="AOF是否开启">{{ info.aof_enabled === "0" ? "否" : info.aof_enabled ? "是" : "-" }}</el-descriptions-item>
            <el-descriptions-item label="RDB是否成功">{{ cacheField(info, "rdb_last_bgsave_status") }}</el-descriptions-item>
            <el-descriptions-item label="Key数量">{{ cache.dbSize }}</el-descriptions-item>
            <el-descriptions-item label="网络入口/出口">
              {{ cacheField(info, "instantaneous_input_kbps") }}kps/{{ cacheField(info, "instantaneous_output_kbps") }}kps
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <el-icon><PieChart /></el-icon>
            <span>命令统计</span>
          </template>
          <div ref="commandEl" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <el-icon><Odometer /></el-icon>
            <span>内存信息</span>
          </template>
          <div ref="memoryEl" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.card-box {
  margin-bottom: 10px;
}
.el-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  gap: 6px;
}
.el-card :deep(.el-card__header .el-button) {
  margin-left: auto;
}
.chart-box {
  height: 420px;
}
</style>
