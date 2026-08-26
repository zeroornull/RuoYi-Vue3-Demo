import type { ServerOverview } from "../../../types/api/monitor";
import type { ChartOption } from "../../../charts/use-chart";

export const SERVER_PAGE_NAME = "Server";
export const SERVER_POLL_INTERVAL_MS = 10_000;

export function emptyServerOverview(): ServerOverview {
  return {
    cpu: { cpuNum: 0, total: 0, sys: 0, used: 0, wait: 0, free: 100 },
    mem: { total: 0, used: 0, free: 0, usage: 0 },
    jvm: {
      total: 0,
      used: 0,
      free: 0,
      usage: 0,
      name: "-",
      version: "-",
      home: "-",
      startTime: "-",
      runTime: "-",
      inputArgs: "-",
    },
    sys: {
      computerName: "-",
      computerIp: "-",
      userDir: "-",
      osName: "-",
      osArch: "-",
    },
    sysFiles: [],
  };
}

export function coalesceServer(data: Partial<ServerOverview> | null | undefined): ServerOverview {
  const empty = emptyServerOverview();
  if (!data) {
    return empty;
  }
  return {
    cpu: { ...empty.cpu, ...(data.cpu ?? {}) },
    mem: { ...empty.mem, ...(data.mem ?? {}) },
    jvm: { ...empty.jvm, ...(data.jvm ?? {}) },
    sys: { ...empty.sys, ...(data.sys ?? {}) },
    sysFiles: data.sysFiles ?? [],
  };
}

export function usageDanger(usage: number | undefined): boolean {
  return (usage ?? 0) > 80;
}

export function usageGaugeOption(title: string, usage: number | undefined): ChartOption {
  const value = Number.isFinite(usage) ? Number(usage) : 0;
  return {
    tooltip: { formatter: `{b} : {c}%` },
    series: [
      {
        name: title,
        type: "gauge",
        min: 0,
        max: 100,
        detail: { formatter: "{value}%" },
        data: [{ value, name: title }],
      },
    ],
  };
}
