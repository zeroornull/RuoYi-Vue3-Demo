export type StoreMigrationStatus = "migrated";

export type StoreMigrationRecord = {
  source: `legacy/src/store/modules/${string}.js`;
  target: `src/stores/modules/${string}.ts`;
  status: StoreMigrationStatus;
  dependsOn: readonly string[];
};

export const STORE_MIGRATION_MANIFEST = [
  { source: "legacy/src/store/modules/app.js", target: "src/stores/modules/app.ts", status: "migrated", dependsOn: [] },
  {
    source: "legacy/src/store/modules/settings.js",
    target: "src/stores/modules/settings.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    source: "legacy/src/store/modules/dict.js",
    target: "src/stores/modules/dict.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    source: "legacy/src/store/modules/lock.js",
    target: "src/stores/modules/lock.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    source: "legacy/src/store/modules/user.js",
    target: "src/stores/modules/user.ts",
    status: "migrated",
    dependsOn: ["lock"],
  },
  {
    source: "legacy/src/store/modules/tagsView.js",
    target: "src/stores/modules/tags-view.ts",
    status: "migrated",
    dependsOn: ["settings"],
  },
  {
    source: "legacy/src/store/modules/permission.js",
    target: "src/stores/modules/permission.ts",
    status: "migrated",
    dependsOn: [],
  },
] as const satisfies readonly StoreMigrationRecord[];
