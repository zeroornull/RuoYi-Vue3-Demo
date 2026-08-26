import type { CacheCommandStat, CacheInfo, CacheOverview } from "../../../types/api/monitor";
import type { ChartOption } from "../../../charts/use-chart";

export const CACHE_PAGE_NAME = "Cache";
export const CACHE_LIST_PAGE_NAME = "CacheList";

export function emptyCacheOverview(): CacheOverview {
  return {
    info: {},
    dbSize: 0,
    commandStats: [],
  };
}

export function cacheField(info: CacheInfo | undefined, key: keyof CacheInfo): string {
  return info?.[key] ?? "-";
}

export function redisModeLabel(mode: string | undefined): string {
  if (!mode) {
    return "-";
  }
  return mode === "standalone" ? "单机" : "集群";
}

export function formatCpuUsage(value: string | undefined): string {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "-";
}

export function parseMemoryNumber(human: string | undefined): number {
  if (!human) {
    return 0;
  }
  const parsed = Number.parseFloat(human);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function stripCachePrefix(value: string, prefix: string): string {
  return prefix.length > 0 ? value.replace(prefix, "") : value.replace(":", "");
}

export type CacheViewForm = {
  cacheName: string;
  cacheKey: string;
  cacheValue: string;
};

export function emptyCacheForm(): CacheViewForm {
  return {
    cacheName: "",
    cacheKey: "",
    cacheValue: "",
  };
}

export function commandPieOption(stats: readonly CacheCommandStat[]): ChartOption {
  return {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)",
    },
    series: [
      {
        name: "命令",
        type: "pie",
        roseType: "radius",
        radius: [15, 95],
        center: ["50%", "50%"],
        data: stats.map((item) => ({ name: item.name, value: item.value })),
        animationEasing: "cubicInOut",
        animationDuration: 1000,
      },
    ],
  };
}

export function memoryGaugeOption(human: string | undefined): ChartOption {
  const value = parseMemoryNumber(human);
  const max = Math.max(100, Math.ceil(value * 2) || 1000);
  return {
    tooltip: {
      formatter: `{b} <br/>{a} : ${human ?? "-"}`,
    },
    series: [
      {
        name: "峰值",
        type: "gauge",
        min: 0,
        max,
        detail: {
          formatter: human ?? "-",
        },
        data: [
          {
            value,
            name: "内存消耗",
          },
        ],
      },
    ],
  };
}
