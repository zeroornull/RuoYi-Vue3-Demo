export type ApiResponseKind = "data" | "page" | "empty" | "blob";

export type ApiMigrationRecord = {
  source: `legacy/src/api/${string}.js`;
  target: `src/api/${string}.ts`;
  status: "migrated";
  responseKinds: readonly ApiResponseKind[];
};

export const API_MIGRATION_MANIFEST = [
  { source: "legacy/src/api/login.js", target: "src/api/login.ts", status: "migrated", responseKinds: ["data", "empty"] },
  { source: "legacy/src/api/menu.js", target: "src/api/menu.ts", status: "migrated", responseKinds: ["data"] },
  { source: "legacy/src/api/system/user.js", target: "src/api/system/user.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/role.js", target: "src/api/system/role.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/menu.js", target: "src/api/system/menu.ts", status: "migrated", responseKinds: ["data", "empty"] },
  { source: "legacy/src/api/system/dept.js", target: "src/api/system/dept.ts", status: "migrated", responseKinds: ["data", "empty"] },
  { source: "legacy/src/api/system/dict/type.js", target: "src/api/system/dict/type.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/dict/data.js", target: "src/api/system/dict/data.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/config.js", target: "src/api/system/config.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/notice.js", target: "src/api/system/notice.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/system/post.js", target: "src/api/system/post.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/monitor/online.js", target: "src/api/monitor/online.ts", status: "migrated", responseKinds: ["page", "empty"] },
  { source: "legacy/src/api/monitor/logininfor.js", target: "src/api/monitor/logininfor.ts", status: "migrated", responseKinds: ["page", "empty"] },
  { source: "legacy/src/api/monitor/operlog.js", target: "src/api/monitor/operlog.ts", status: "migrated", responseKinds: ["page", "empty"] },
  { source: "legacy/src/api/monitor/job.js", target: "src/api/monitor/job.ts", status: "migrated", responseKinds: ["data", "page", "empty"] },
  { source: "legacy/src/api/monitor/jobLog.js", target: "src/api/monitor/jobLog.ts", status: "migrated", responseKinds: ["page", "empty"] },
  { source: "legacy/src/api/monitor/cache.js", target: "src/api/monitor/cache.ts", status: "migrated", responseKinds: ["data", "empty"] },
  { source: "legacy/src/api/monitor/server.js", target: "src/api/monitor/server.ts", status: "migrated", responseKinds: ["data"] },
  { source: "legacy/src/api/tool/gen.js", target: "src/api/tool/gen.ts", status: "migrated", responseKinds: ["data", "page", "empty", "blob"] },
] as const satisfies readonly ApiMigrationRecord[];
