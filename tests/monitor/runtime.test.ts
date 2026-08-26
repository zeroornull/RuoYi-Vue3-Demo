import { beforeEach, describe, expect, test } from "bun:test";
import {
  commandPieOption,
  emptyCacheOverview,
  formatCpuUsage,
  memoryGaugeOption,
  parseMemoryNumber,
  redisModeLabel,
  stripCachePrefix,
} from "../../src/views/monitor/cache/model";
import { coalesceServer, usageDanger, usageGaugeOption } from "../../src/views/monitor/server/model";
import { druidLoginUrl } from "../../src/views/monitor/druid/model";
import { createVisibilityPoll } from "../../src/utils/visibility-poll";
import { echartsTheme } from "../../src/charts/register";
import { dispatchMockRequest, MOCK_TOKEN, resetMockAuthState } from "../../vite/mock/auth.ts";

function runtime(method: string, path: string, body?: unknown, token: string = MOCK_TOKEN) {
  return dispatchMockRequest({
    method,
    path,
    body,
    token,
  });
}

beforeEach(() => {
  resetMockAuthState();
});

describe("cache and server view models", () => {
  test("degrades missing cache and server fields without throwing", () => {
    expect(emptyCacheOverview().commandStats).toEqual([]);
    expect(redisModeLabel(undefined)).toBe("-");
    expect(redisModeLabel("standalone")).toBe("单机");
    expect(formatCpuUsage(undefined)).toBe("-");
    expect(parseMemoryNumber("1.20M")).toBe(1.2);
    expect(parseMemoryNumber("bad")).toBe(0);
    expect(stripCachePrefix("login_tokens:admin", "login_tokens:")).toBe("admin");
    const pie = commandPieOption([]);
    expect((pie.series as Array<{ data: unknown[] }>)[0]?.data).toEqual([]);
    expect(memoryGaugeOption(undefined).series).toBeDefined();
    const empty = coalesceServer({});
    expect(empty.cpu.cpuNum).toBe(0);
    expect(empty.sys.computerName).toBe("-");
    expect(empty.sysFiles).toEqual([]);
    expect(usageDanger(81)).toBe(true);
    expect(usageDanger(20)).toBe(false);
    expect(
      (usageGaugeOption("CPU", undefined).series as Array<{ data: Array<{ value: number }> }>)[0]?.data[0]?.value,
    ).toBe(0);
    expect(echartsTheme(true)).toBe("dark");
    expect(echartsTheme(false)).toBeUndefined();
    expect(druidLoginUrl("/dev-api")).toBe("/dev-api/druid/login.html");
  });
});

describe("visibility poll cleanup", () => {
  test("skips hidden ticks, avoids overlap and stops the timer", async () => {
    const scheduled: Array<() => void> = [];
    let visible = true;
    let runs = 0;
    let pending: (() => void) | undefined;
    const poll = createVisibilityPoll({
      intervalMs: 10,
      isVisible: () => visible,
      schedule(callback) {
        scheduled.push(callback);
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
      cancel() {
        scheduled.pop();
      },
      run() {
        runs += 1;
        return new Promise<void>((resolve) => {
          pending = resolve;
        });
      },
    });
    poll.start();
    expect(scheduled.length).toBe(1);
    scheduled[0]?.();
    expect(runs).toBe(1);
    scheduled[0]?.();
    expect(runs).toBe(1);
    pending?.();
    await Promise.resolve();
    visible = false;
    scheduled.at(-1)?.();
    expect(runs).toBe(1);
    visible = true;
    scheduled.at(-1)?.();
    pending?.();
    await Promise.resolve();
    expect(runs).toBe(2);
    poll.stop();
    const afterStop = scheduled.length;
    poll.stop();
    expect(scheduled.length).toBeLessThanOrEqual(afterStop);
  });
});

describe("cache and server mock", () => {
  test("returns redis overview, names, keys, values and clears by name/key/all", () => {
    const overview = runtime("GET", "/monitor/cache");
    expect((overview.body.data as { dbSize: number }).dbSize).toBe(4);
    expect(runtime("GET", "/monitor/cache/getNames").body.data as unknown[]).toHaveLength(3);
    expect((runtime("GET", "/monitor/cache/getKeys/login_tokens:").body.data as string[])[0]).toBe(
      "login_tokens:admin",
    );
    expect(
      (runtime("GET", "/monitor/cache/getValue/login_tokens:/login_tokens:admin").body.data as { cacheValue: string })
        .cacheValue,
    ).toContain("admin");
    expect(runtime("DELETE", "/monitor/cache/clearCacheKey/login_tokens:ry").body.code).toBe(200);
    expect(runtime("GET", "/monitor/cache/getKeys/login_tokens:").body.data as string[]).toHaveLength(1);
    expect(runtime("DELETE", "/monitor/cache/clearCacheName/sys_config:").body.code).toBe(200);
    expect(runtime("GET", "/monitor/cache/getKeys/sys_config:").body.data as string[]).toHaveLength(0);
    expect(runtime("DELETE", "/monitor/cache/clearCacheAll").body.code).toBe(200);
    expect((runtime("GET", "/monitor/cache").body.data as { dbSize: number }).dbSize).toBe(0);
  });

  test("returns server metrics and the druid mock login page", () => {
    const server = runtime("GET", "/monitor/server").body.data as {
      cpu: { cpuNum: number };
      sysFiles: unknown[];
    };
    expect(server.cpu.cpuNum).toBe(8);
    expect(server.sysFiles).toHaveLength(2);
    const druid = runtime("GET", "/druid/login.html", undefined, "");
    expect(druid.contentType).toContain("text/html");
    expect(druid.raw).toContain("Druid Monitor");
  });
});
