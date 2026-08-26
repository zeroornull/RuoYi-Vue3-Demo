import type {
  ApiDateTime,
  BaseEntity,
  DateRangeQuery,
  EnabledStatus,
  EntityId,
  PageQuery,
} from "./common";
import type { PageResponse } from "../http";

export type OnlineQuery = {
  ipaddr?: string;
  userName?: string;
};

export type OnlineUser = {
  tokenId: string;
  deptName?: string | null;
  userName: string;
  ipaddr: string;
  loginLocation?: string | null;
  browser?: string | null;
  os?: string | null;
  loginTime: number;
};

export type LoginInfoQuery = PageQuery & {
  ipaddr?: string;
  userName?: string;
  status?: EnabledStatus;
  params?: DateRangeQuery;
};

export type LoginInfoLog = BaseEntity & {
  infoId: EntityId;
  userName: string;
  ipaddr: string;
  loginLocation?: string | null;
  browser?: string | null;
  os?: string | null;
  status: EnabledStatus;
  msg?: string | null;
  loginTime: ApiDateTime;
};

export type OperationLogQuery = PageQuery & {
  operIp?: string;
  title?: string;
  operName?: string;
  businessType?: number;
  status?: EnabledStatus;
  params?: DateRangeQuery;
};

export type OperationLog = BaseEntity & {
  operId: EntityId;
  title: string;
  businessType: number;
  method?: string | null;
  requestMethod?: string | null;
  operatorType?: number;
  operName?: string | null;
  deptName?: string | null;
  operUrl?: string | null;
  operIp?: string | null;
  operLocation?: string | null;
  operParam?: string | null;
  jsonResult?: string | null;
  status: EnabledStatus;
  errorMsg?: string | null;
  operTime: ApiDateTime;
  costTime?: number | null;
};

export type JobQuery = PageQuery & {
  jobName?: string;
  jobGroup?: string;
  status?: EnabledStatus;
};

export type Job = BaseEntity & {
  jobId: EntityId;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  nextValidTime?: ApiDateTime | null;
  misfirePolicy: "1" | "2" | "3";
  concurrent: EnabledStatus;
  status: EnabledStatus;
};

export type JobUpsertRequest = Omit<Job, keyof BaseEntity | "jobId" | "nextValidTime"> & {
  jobId?: EntityId;
  remark?: string | null;
};

export type JobLogQuery = PageQuery & {
  jobName?: string;
  jobGroup?: string;
  status?: EnabledStatus;
  params?: DateRangeQuery;
};

export type JobLog = BaseEntity & {
  jobLogId: EntityId;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  jobMessage?: string | null;
  exceptionInfo?: string | null;
  status: EnabledStatus;
  startTime?: ApiDateTime | null;
  endTime?: ApiDateTime | null;
};

export type CacheEntry = {
  cacheName: string;
  cacheKey?: string | null;
  cacheValue?: string | null;
  remark?: string | null;
};

export type CacheCommandStat = { name: string; value: number };
export type CacheInfo = {
  redis_version?: string;
  redis_mode?: string;
  tcp_port?: string;
  connected_clients?: string;
  uptime_in_days?: string;
  used_memory_human?: string;
  used_cpu_user_children?: string;
  maxmemory_human?: string;
  aof_enabled?: string;
  rdb_last_bgsave_status?: string;
  instantaneous_input_kbps?: string;
  instantaneous_output_kbps?: string;
};
export type CacheOverview = {
  info: CacheInfo;
  dbSize: number;
  commandStats: CacheCommandStat[];
};

export type ServerCpu = {
  cpuNum: number;
  total: number;
  sys: number;
  used: number;
  wait: number;
  free: number;
};
export type ServerMemory = { total: number; used: number; free: number; usage: number };
export type ServerJvm = ServerMemory & {
  name: string;
  version: string;
  home: string;
  startTime: string;
  runTime: string;
  inputArgs: string;
};
export type ServerSystem = {
  computerName: string;
  computerIp: string;
  userDir: string;
  osName: string;
  osArch: string;
};
export type ServerFileSystem = {
  dirName: string;
  sysTypeName: string;
  typeName: string;
  total: string;
  free: string;
  used: string;
  usage: number;
};
export type ServerOverview = {
  cpu: ServerCpu;
  mem: ServerMemory;
  jvm: ServerJvm;
  sys: ServerSystem;
  sysFiles: ServerFileSystem[];
};

export type OnlinePageResponse = PageResponse<OnlineUser>;
export type LoginInfoPageResponse = PageResponse<LoginInfoLog>;
export type OperationLogPageResponse = PageResponse<OperationLog>;
export type JobPageResponse = PageResponse<Job>;
export type JobLogPageResponse = PageResponse<JobLog>;
