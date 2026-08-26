import type { Job, JobLog, JobLogQuery, JobQuery, JobUpsertRequest } from "../../../types/api/monitor";

export const JOB_PAGE_NAME = "Job";
export const JOB_LOG_PAGE_NAME = "JobLog";
export const JOB_DETAIL_PAGE_NAME = "JobDetail";
export const ALL_JOB_LOGS_ID = "0";

export type JobListQuery = JobQuery & {
  pageNum: number;
  pageSize: number;
  jobName: string;
};

export type JobLogListQuery = JobLogQuery & {
  pageNum: number;
  pageSize: number;
  jobName: string;
};

export type JobDetailKind = "job" | "log";

export type MisfireOption = {
  value: Job["misfirePolicy"];
  label: string;
};

export const MISFIRE_OPTIONS: readonly MisfireOption[] = [
  { value: "1", label: "立即执行" },
  { value: "2", label: "执行一次" },
  { value: "3", label: "放弃执行" },
];

export function emptyJobQuery(): JobListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    jobName: "",
  };
}

export function emptyJobLogQuery(): JobLogListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    jobName: "",
  };
}

export function emptyJobForm(): JobUpsertRequest {
  return {
    jobName: "",
    jobGroup: "DEFAULT",
    invokeTarget: "",
    cronExpression: "",
    misfirePolicy: "1",
    concurrent: "1",
    status: "0",
    remark: "",
  };
}

export function jobToForm(row: Job): JobUpsertRequest {
  return {
    jobId: row.jobId,
    jobName: row.jobName,
    jobGroup: row.jobGroup,
    invokeTarget: row.invokeTarget,
    cronExpression: row.cronExpression,
    misfirePolicy: row.misfirePolicy,
    concurrent: row.concurrent,
    status: row.status,
    remark: row.remark ?? "",
  };
}

export function jobStatusChangeText(status: "0" | "1"): string {
  return status === "0" ? "启用" : "停用";
}

export function isJobLogRow(row: Job | JobLog | null | undefined): row is JobLog {
  return row !== null && row !== undefined && "jobLogId" in row;
}

export function misfirePolicyLabel(value: string | undefined): string {
  if (value === "1") return "立即执行";
  if (value === "2") return "执行一次";
  if (value === "3") return "放弃执行";
  return "默认策略";
}

export function jobLogCostMs(row: JobLog | null | undefined): number | null {
  if (!row?.startTime || !row.endTime) {
    return null;
  }
  const start = Date.parse(row.startTime.replace(" ", "T"));
  const end = Date.parse(row.endTime.replace(" ", "T"));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }
  return end - start;
}
