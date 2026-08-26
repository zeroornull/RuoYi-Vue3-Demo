export type ApiResponseKind = "data" | "page" | "empty" | "blob";

export type ApiMigrationRecord = {
  id: string;
  target: `src/api/${string}.ts`;
  status: "migrated";
  responseKinds: readonly ApiResponseKind[];
};

export const API_MIGRATION_MANIFEST = [
  {
    id: "login",
    target: "src/api/login.ts",
    status: "migrated",
    responseKinds: ["data", "empty"],
  },
  { id: "menu", target: "src/api/menu.ts", status: "migrated", responseKinds: ["data"] },
  {
    id: "system/user",
    target: "src/api/system/user.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/role",
    target: "src/api/system/role.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/menu",
    target: "src/api/system/menu.ts",
    status: "migrated",
    responseKinds: ["data", "empty"],
  },
  {
    id: "system/dept",
    target: "src/api/system/dept.ts",
    status: "migrated",
    responseKinds: ["data", "empty"],
  },
  {
    id: "system/dict/type",
    target: "src/api/system/dict/type.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/dict/data",
    target: "src/api/system/dict/data.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/config",
    target: "src/api/system/config.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/notice",
    target: "src/api/system/notice.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "system/post",
    target: "src/api/system/post.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "monitor/online",
    target: "src/api/monitor/online.ts",
    status: "migrated",
    responseKinds: ["page", "empty"],
  },
  {
    id: "monitor/logininfor",
    target: "src/api/monitor/logininfor.ts",
    status: "migrated",
    responseKinds: ["page", "empty"],
  },
  {
    id: "monitor/operlog",
    target: "src/api/monitor/operlog.ts",
    status: "migrated",
    responseKinds: ["page", "empty"],
  },
  {
    id: "monitor/job",
    target: "src/api/monitor/job.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty"],
  },
  {
    id: "monitor/jobLog",
    target: "src/api/monitor/jobLog.ts",
    status: "migrated",
    responseKinds: ["page", "empty"],
  },
  {
    id: "monitor/cache",
    target: "src/api/monitor/cache.ts",
    status: "migrated",
    responseKinds: ["data", "empty"],
  },
  {
    id: "monitor/server",
    target: "src/api/monitor/server.ts",
    status: "migrated",
    responseKinds: ["data"],
  },
  {
    id: "tool/gen",
    target: "src/api/tool/gen.ts",
    status: "migrated",
    responseKinds: ["data", "page", "empty", "blob"],
  },
] as const satisfies readonly ApiMigrationRecord[];
