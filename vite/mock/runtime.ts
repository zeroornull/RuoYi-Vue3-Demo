import type { MockJson, MockRequest, MockResponse } from "./auth.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });

type CacheNameRow = {
  cacheName: string;
  remark: string;
};

type CacheValueRow = {
  cacheName: string;
  cacheKey: string;
  cacheValue: string;
  remark: string;
};

let names: CacheNameRow[] = [];
let entries: CacheValueRow[] = [];

function seedNames(): CacheNameRow[] {
  return [
    { cacheName: "login_tokens:", remark: "用户信息" },
    { cacheName: "sys_config:", remark: "配置信息" },
    { cacheName: "sys_dict:", remark: "数据字典" },
  ];
}

function seedEntries(): CacheValueRow[] {
  return [
    {
      cacheName: "login_tokens:",
      cacheKey: "login_tokens:admin",
      cacheValue: '{"userName":"admin","userId":"1"}',
      remark: "用户信息",
    },
    {
      cacheName: "login_tokens:",
      cacheKey: "login_tokens:ry",
      cacheValue: '{"userName":"ry","userId":"2"}',
      remark: "用户信息",
    },
    {
      cacheName: "sys_config:",
      cacheKey: "sys_config:sys.index.skinName",
      cacheValue: "skin-blue",
      remark: "配置信息",
    },
    {
      cacheName: "sys_dict:",
      cacheKey: "sys_dict:sys_job_status",
      cacheValue: '[{"label":"正常","value":"0"}]',
      remark: "数据字典",
    },
  ];
}

export function resetMockRuntimeState(): void {
  names = seedNames();
  entries = seedEntries();
}

resetMockRuntimeState();

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

export const DRUID_LOGIN_HTML =
  "<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\"><title>Druid Monitor</title></head><body><h1>Druid Monitor</h1><p>本地 Mock 登录页</p></body></html>";

export function dispatchRuntimeMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";

  if (method === "GET" && path === "/monitor/cache") {
    return ok({
      code: 200,
      msg: "操作成功",
      data: {
        info: {
          redis_version: "7.2.4",
          redis_mode: "standalone",
          tcp_port: "6379",
          connected_clients: "3",
          uptime_in_days: "12",
          used_memory_human: "1.20M",
          used_cpu_user_children: "0.42",
          maxmemory_human: "0B",
          aof_enabled: "0",
          rdb_last_bgsave_status: "ok",
          instantaneous_input_kbps: "0.12",
          instantaneous_output_kbps: "0.08",
        },
        dbSize: entries.length,
        commandStats: [
          { name: "get", value: 128 },
          { name: "set", value: 46 },
          { name: "del", value: 9 },
        ],
      },
    });
  }
  if (method === "GET" && path === "/monitor/cache/getNames") {
    return ok({ code: 200, msg: "操作成功", data: names });
  }
  const keysRest = restAfter(path, "/monitor/cache/getKeys");
  if (method === "GET" && keysRest) {
    const cacheName = decodeURIComponent(keysRest);
    return ok({
      code: 200,
      msg: "操作成功",
      data: entries
        .filter((item) => item.cacheName === cacheName)
        .map((item) => item.cacheKey),
    });
  }
  const valueRest = restAfter(path, "/monitor/cache/getValue");
  if (method === "GET" && valueRest) {
    const [rawName, ...keyParts] = valueRest.split("/");
    const cacheName = decodeURIComponent(rawName ?? "");
    const cacheKey = decodeURIComponent(keyParts.join("/"));
    const row = entries.find(
      (item) => item.cacheName === cacheName && item.cacheKey === cacheKey,
    );
    return row
      ? ok({ code: 200, msg: "操作成功", data: { ...row } })
      : fail("数据不存在");
  }
  const clearName = restAfter(path, "/monitor/cache/clearCacheName");
  if (method === "DELETE" && clearName) {
    const cacheName = decodeURIComponent(clearName);
    entries = entries.filter((item) => item.cacheName !== cacheName);
    return ok({ code: 200, msg: "清理成功" });
  }
  const clearKey = restAfter(path, "/monitor/cache/clearCacheKey");
  if (method === "DELETE" && clearKey) {
    const cacheKey = decodeURIComponent(clearKey);
    const before = entries.length;
    entries = entries.filter((item) => item.cacheKey !== cacheKey);
    return entries.length !== before
      ? ok({ code: 200, msg: "清理成功" })
      : fail("数据不存在");
  }
  if (method === "DELETE" && path === "/monitor/cache/clearCacheAll") {
    entries = [];
    return ok({ code: 200, msg: "清理成功" });
  }
  if (method === "GET" && path === "/monitor/server") {
    return ok({
      code: 200,
      msg: "操作成功",
      data: {
        cpu: { cpuNum: 8, total: 100, sys: 12.4, used: 23.1, wait: 0.2, free: 64.3 },
        mem: { total: 16, used: 7.2, free: 8.8, usage: 45 },
        jvm: {
          total: 512,
          used: 268,
          free: 244,
          usage: 52.3,
          name: "OpenJDK 64-Bit Server VM",
          version: "21.0.4",
          home: "/usr/lib/jvm/java-21",
          startTime: "2026-08-26 08:00:00",
          runTime: "8小时12分钟",
          inputArgs: "-Xms256m -Xmx512m",
        },
        sys: {
          computerName: "ruoyi-dev",
          computerIp: "127.0.0.1",
          userDir: "/home/pax/Project/github/RuoYi-Vue3",
          osName: "Linux",
          osArch: "amd64",
        },
        sysFiles: [
          {
            dirName: "/",
            sysTypeName: "ext4",
            typeName: "本地磁盘",
            total: "120GB",
            free: "64GB",
            used: "56GB",
            usage: 46.7,
          },
          {
            dirName: "/home",
            sysTypeName: "ext4",
            typeName: "本地磁盘",
            total: "400GB",
            free: "210GB",
            used: "190GB",
            usage: 47.5,
          },
        ],
      },
    });
  }
  return null;
}
