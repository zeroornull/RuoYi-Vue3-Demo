import { beforeEach, describe, expect, test } from "bun:test";
import { protectedRoutes } from "../../src/router/protected-routes";
import {
  emptyJobForm,
  emptyJobLogQuery,
  emptyJobQuery,
  isJobLogRow,
  jobLogCostMs,
  jobStatusChangeText,
  jobToForm,
  misfirePolicyLabel,
} from "../../src/views/monitor/job/model";
import {
  dispatchMockRequest,
  MOCK_TOKEN,
  resetMockAuthState,
} from "../../vite/mock/auth.ts";

function job(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
) {
  return dispatchMockRequest({
    method,
    path,
    body,
    token: MOCK_TOKEN,
    ...(query ? { query } : {}),
  });
}

beforeEach(() => {
  resetMockAuthState();
});

describe("job Query/Create/Update/Row models", () => {
  test("keeps list filters, upsert and log queries distinct", () => {
    expect(emptyJobQuery()).toEqual({
      pageNum: 1,
      pageSize: 10,
      jobName: "",
    });
    expect("jobId" in emptyJobForm()).toBe(false);
    expect(emptyJobForm().misfirePolicy).toBe("1");
    expect(emptyJobLogQuery().jobName).toBe("");
    expect(jobStatusChangeText("0")).toBe("启用");
    expect(misfirePolicyLabel("2")).toBe("执行一次");
    expect(
      jobToForm({
        jobId: "1",
        jobName: "系统默认（无参）",
        jobGroup: "DEFAULT",
        invokeTarget: "ryTask.ryNoParams",
        cronExpression: "0/10 * * * * ?",
        misfirePolicy: "1",
        concurrent: "1",
        status: "0",
        remark: null,
      }).jobId,
    ).toBe("1");
    expect(
      isJobLogRow({
        jobLogId: "1",
        jobName: "x",
        jobGroup: "DEFAULT",
        invokeTarget: "t",
        status: "1",
      }),
    ).toBe(true);
    expect(
      jobLogCostMs({
        jobLogId: "1",
        jobName: "x",
        jobGroup: "DEFAULT",
        invokeTarget: "t",
        status: "0",
        startTime: "2026-08-26 12:00:00",
        endTime: "2026-08-26 12:00:12",
      }),
    ).toBe(12000);
  });
});

describe("job mock CRUD, run and logs", () => {
  test("lists jobs, rejects empty create, updates status and runs once", () => {
    expect(job("GET", "/monitor/job/list").body.total).toBe(3);
    expect(
      job("GET", "/monitor/job/list", undefined, { status: "1" }).body.total,
    ).toBe(1);
    expect(
      job("POST", "/monitor/job", {
        jobName: "",
        invokeTarget: "x",
        cronExpression: "* * * * * ?",
      }).body.msg,
    ).toBe("任务名称不能为空");
    expect(
      job("POST", "/monitor/job", {
        jobName: "自定义任务",
        invokeTarget: "ryTask.ryNoParams",
        cronExpression: "0 0/5 * * * ?",
        jobGroup: "DEFAULT",
      }).body.code,
    ).toBe(200);
    expect(job("GET", "/monitor/job/list").body.total).toBe(4);
    expect(
      job("PUT", "/monitor/job/changeStatus", { jobId: "2", status: "0" }).body.code,
    ).toBe(200);
    expect((job("GET", "/monitor/job/2").body.data as { status: string }).status).toBe(
      "0",
    );
    expect(job("PUT", "/monitor/job/run", { jobId: "1", jobGroup: "DEFAULT" }).body.code).toBe(
      200,
    );
    expect(
      job("GET", "/monitor/jobLog/list", undefined, { jobName: "系统默认（无参）" }).body
        .total,
    ).toBe(3);
    expect(job("DELETE", "/monitor/job/4").body.code).toBe(200);
  });

  test("exposes failed log stacks, deletes and cleans job logs", () => {
    const failed = job("GET", "/monitor/jobLog/list", undefined, { status: "1" });
    const row = (
      failed.body.rows as Array<{ exceptionInfo: string; jobName: string }>
    )[0];
    expect(row?.jobName).toBe("系统默认（有参）");
    expect(row?.exceptionInfo).toContain("RuntimeException");
    expect(job("DELETE", "/monitor/jobLog/1").body.code).toBe(200);
    expect(job("GET", "/monitor/jobLog/list").body.total).toBe(3);
    expect(job("POST", "/monitor/jobLog/export").raw).toBe("mock-xlsx");
    expect(job("DELETE", "/monitor/jobLog/clean").body.code).toBe(200);
    expect(job("GET", "/monitor/jobLog/list").body.total).toBe(0);
  });

  test("job-log hidden route keeps activeMenu on the job list", () => {
    const logRoute = protectedRoutes
      .find((route) => route.path === "/monitor/job-log")
      ?.children?.[0];
    expect(logRoute?.name).toBe("JobLog");
    expect(logRoute?.meta?.activeMenu).toBe("/monitor/job");
    expect(logRoute?.path).toBe("index/:jobId(\\d+)");
  });
});
