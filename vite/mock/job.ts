import type { MockJson, MockRequest, MockResponse } from "./auth.ts";

const ok = (body: MockJson, status = 200): MockResponse => ({ status, body });
const fail = (msg: string, code = 500): MockResponse => ok({ code, msg });
const now = "2026-08-26 12:00:00";

type JobRow = {
  jobId: string;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy: "1" | "2" | "3";
  concurrent: "0" | "1";
  status: "0" | "1";
  remark: string;
  nextValidTime: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
};

type JobLogRow = {
  jobLogId: string;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  jobMessage: string;
  exceptionInfo: string;
  status: "0" | "1";
  createTime: string;
  startTime: string;
  endTime: string;
};

let jobs: JobRow[] = [];
let jobLogs: JobLogRow[] = [];

function seedJobs(): JobRow[] {
  return [
    job("1", "系统默认（无参）", "DEFAULT", "ryTask.ryNoParams", "0/10 * * * * ?", "0"),
    job("2", "系统默认（有参）", "SYSTEM", "ryTask.ryParams('ry')", "0/15 * * * * ?", "1"),
    job("3", "系统默认（多参）", "DEFAULT", "ryTask.ryMultipleParams('ry', true, 2000L, 316.50D, 100)", "0/20 * * * * ?", "0"),
  ];
}

function job(
  jobId: string,
  jobName: string,
  jobGroup: string,
  invokeTarget: string,
  cronExpression: string,
  status: "0" | "1",
): JobRow {
  return {
    jobId,
    jobName,
    jobGroup,
    invokeTarget,
    cronExpression,
    misfirePolicy: "1",
    concurrent: "1",
    status,
    remark: "",
    nextValidTime: "2026-08-26 12:00:10",
    createBy: "admin",
    createTime: "2026-01-01 00:00:00",
    updateBy: "admin",
    updateTime: "2026-01-01 00:00:00",
  };
}

function seedJobLogs(): JobLogRow[] {
  return [
    log("1", "系统默认（无参）", "DEFAULT", "ryTask.ryNoParams", "0", "执行成功", "", "2026-08-26 11:59:50"),
    log("2", "系统默认（无参）", "DEFAULT", "ryTask.ryNoParams", "0", "执行成功", "", "2026-08-26 11:59:40"),
    log(
      "3",
      "系统默认（有参）",
      "SYSTEM",
      "ryTask.ryParams('ry')",
      "1",
      "执行失败",
      "java.lang.RuntimeException: mock failure\n\tat com.ruoyi.quartz.task.RyTask.ryParams(RyTask.java:42)",
      "2026-08-26 11:50:00",
    ),
    log("4", "系统默认（多参）", "DEFAULT", "ryTask.ryMultipleParams('ry', true, 2000L, 316.50D, 100)", "0", "执行成功", "", "2026-08-25 08:00:00"),
  ];
}

function log(
  jobLogId: string,
  jobName: string,
  jobGroup: string,
  invokeTarget: string,
  status: "0" | "1",
  jobMessage: string,
  exceptionInfo: string,
  createTime: string,
): JobLogRow {
  return {
    jobLogId,
    jobName,
    jobGroup,
    invokeTarget,
    jobMessage,
    exceptionInfo,
    status,
    createTime,
    startTime: createTime,
    endTime: createTime,
  };
}

export function resetMockJobState(): void {
  jobs = seedJobs();
  jobLogs = seedJobLogs();
}

resetMockJobState();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function queryOf(request: MockRequest): Record<string, string> {
  return request.query ?? {};
}

function includes(haystack: string, needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function restAfter(path: string, prefix: string): string | null {
  if (path === prefix) {
    return "";
  }
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1);
  }
  return null;
}

function inDateRange(value: string, query: Record<string, string>): boolean {
  const day = value.slice(0, 10);
  const begin = query["params[beginTime]"];
  const end = query["params[endTime]"];
  if (begin && day < begin) {
    return false;
  }
  if (end && day > end) {
    return false;
  }
  return true;
}

function pageOf<T>(
  rows: readonly T[],
  query: Record<string, string>,
  map: (row: T) => MockJson,
): { rows: MockJson[]; total: number } {
  const pageNum = Number(query.pageNum ?? "1") || 1;
  const pageSize = Number(query.pageSize ?? "10") || 10;
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size).map(map),
    total: rows.length,
  };
}

function exportBlob(): MockResponse {
  return {
    status: 200,
    body: { code: 200, msg: "操作成功" },
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    raw: "mock-xlsx",
  };
}

function parseIds(rest: string): string[] {
  return rest
    .split(",")
    .map((item) => decodeURIComponent(item))
    .filter(Boolean);
}

function nextId(ids: string[]): string {
  return String(ids.reduce((max, id) => Math.max(max, Number(id) || 0), 0) + 1);
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string"
    ? value.trim()
    : typeof value === "number"
      ? String(value)
      : "";
}

function readMisfire(value: string): "1" | "2" | "3" {
  return value === "2" || value === "3" ? value : "1";
}

export function dispatchJobMock(request: MockRequest): MockResponse | null {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/\/+$/, "") || "/";
  const query = queryOf(request);

  if (method === "GET" && path === "/monitor/jobLog/list") {
    const filtered = jobLogs.filter(
      (row) =>
        includes(row.jobName, query.jobName) &&
        (!query.jobGroup || row.jobGroup === query.jobGroup) &&
        (!query.status || row.status === query.status) &&
        inDateRange(row.createTime, query),
    );
    const page = pageOf(filtered, query, (row) => ({ ...row }));
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "POST" && path === "/monitor/jobLog/export") {
    return exportBlob();
  }
  if (method === "DELETE" && path === "/monitor/jobLog/clean") {
    jobLogs = [];
    return ok({ code: 200, msg: "清空成功" });
  }
  const logRest = restAfter(path, "/monitor/jobLog");
  if (
    method === "DELETE" &&
    logRest &&
    logRest !== "list" &&
    logRest !== "export" &&
    logRest !== "clean"
  ) {
    const ids = new Set(parseIds(logRest));
    const before = jobLogs.length;
    jobLogs = jobLogs.filter((row) => !ids.has(row.jobLogId));
    return jobLogs.length !== before
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }

  if (method === "GET" && path === "/monitor/job/list") {
    const filtered = jobs.filter(
      (row) =>
        includes(row.jobName, query.jobName) &&
        (!query.jobGroup || row.jobGroup === query.jobGroup) &&
        (!query.status || row.status === query.status),
    );
    const page = pageOf(filtered, query, (row) => ({ ...row }));
    return ok({ code: 200, msg: "查询成功", rows: page.rows, total: page.total });
  }
  if (method === "POST" && path === "/monitor/job/export") {
    return exportBlob();
  }
  if (method === "PUT" && path === "/monitor/job/changeStatus") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const jobId = readString(request.body, "jobId");
    const row = jobs.find((item) => item.jobId === jobId);
    if (!row) return fail("数据不存在");
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/monitor/job/run") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const jobId = readString(request.body, "jobId");
    const row = jobs.find((item) => item.jobId === jobId);
    if (!row) return fail("数据不存在");
    jobLogs.unshift(
      log(
        nextId(jobLogs.map((item) => item.jobLogId)),
        row.jobName,
        row.jobGroup,
        row.invokeTarget,
        "0",
        "执行成功",
        "",
        now,
      ),
    );
    return ok({ code: 200, msg: "执行成功" });
  }
  if (method === "POST" && path === "/monitor/job") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const jobName = readString(request.body, "jobName");
    const invokeTarget = readString(request.body, "invokeTarget");
    const cronExpression = readString(request.body, "cronExpression");
    const jobGroup = readString(request.body, "jobGroup") || "DEFAULT";
    if (!jobName) return fail("任务名称不能为空");
    if (!invokeTarget) return fail("调用目标字符串不能为空");
    if (!cronExpression) return fail("cron执行表达式不能为空");
    if (jobs.some((item) => item.jobName === jobName && item.jobGroup === jobGroup)) {
      return fail("任务名称已存在");
    }
    jobs.push({
      jobId: nextId(jobs.map((item) => item.jobId)),
      jobName,
      jobGroup,
      invokeTarget,
      cronExpression,
      misfirePolicy: readMisfire(readString(request.body, "misfirePolicy")),
      concurrent: readString(request.body, "concurrent") === "0" ? "0" : "1",
      status: readString(request.body, "status") === "1" ? "1" : "0",
      remark: readString(request.body, "remark"),
      nextValidTime: "2026-08-26 12:10:00",
      createBy: "admin",
      createTime: now,
      updateBy: "admin",
      updateTime: now,
    });
    return ok({ code: 200, msg: "操作成功" });
  }
  if (method === "PUT" && path === "/monitor/job") {
    if (!isRecord(request.body)) return fail("请求参数错误");
    const jobId = readString(request.body, "jobId");
    const row = jobs.find((item) => item.jobId === jobId);
    if (!row) return fail("数据不存在");
    const jobName = readString(request.body, "jobName");
    const invokeTarget = readString(request.body, "invokeTarget");
    const cronExpression = readString(request.body, "cronExpression");
    if (!jobName) return fail("任务名称不能为空");
    if (!invokeTarget) return fail("调用目标字符串不能为空");
    if (!cronExpression) return fail("cron执行表达式不能为空");
    const jobGroup = readString(request.body, "jobGroup") || row.jobGroup;
    if (
      jobs.some(
        (item) =>
          item.jobId !== jobId && item.jobName === jobName && item.jobGroup === jobGroup,
      )
    ) {
      return fail("任务名称已存在");
    }
    row.jobName = jobName;
    row.jobGroup = jobGroup;
    row.invokeTarget = invokeTarget;
    row.cronExpression = cronExpression;
    row.misfirePolicy = readMisfire(readString(request.body, "misfirePolicy"));
    row.concurrent = readString(request.body, "concurrent") === "0" ? "0" : "1";
    row.status = readString(request.body, "status") === "1" ? "1" : "0";
    row.remark = readString(request.body, "remark");
    row.updateTime = now;
    return ok({ code: 200, msg: "操作成功" });
  }
  const jobRest = restAfter(path, "/monitor/job");
  if (
    jobRest === null ||
    jobRest === "" ||
    jobRest === "list" ||
    jobRest === "export" ||
    jobRest === "changeStatus" ||
    jobRest === "run" ||
    jobRest.startsWith("Log")
  ) {
    return null;
  }
  if (method === "GET") {
    const row = jobs.find((item) => item.jobId === decodeURIComponent(jobRest));
    return row
      ? ok({ code: 200, msg: "操作成功", data: { ...row } })
      : fail("数据不存在");
  }
  if (method === "DELETE") {
    const ids = new Set(parseIds(jobRest));
    const before = jobs.length;
    jobs = jobs.filter((item) => !ids.has(item.jobId));
    return jobs.length !== before
      ? ok({ code: 200, msg: "操作成功" })
      : fail("数据不存在");
  }
  return null;
}
