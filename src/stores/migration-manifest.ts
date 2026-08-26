export type StoreMigrationStatus = "migrated";

export type StoreMigrationRecord = {
  id: string;
  target: `src/stores/modules/${string}.ts`;
  status: StoreMigrationStatus;
  dependsOn: readonly string[];
};

export const STORE_MIGRATION_MANIFEST = [
  { id: "app", target: "src/stores/modules/app.ts", status: "migrated", dependsOn: [] },
  {
    id: "settings",
    target: "src/stores/modules/settings.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    id: "dict",
    target: "src/stores/modules/dict.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    id: "lock",
    target: "src/stores/modules/lock.ts",
    status: "migrated",
    dependsOn: [],
  },
  {
    id: "user",
    target: "src/stores/modules/user.ts",
    status: "migrated",
    dependsOn: ["lock"],
  },
  {
    id: "tagsView",
    target: "src/stores/modules/tags-view.ts",
    status: "migrated",
    dependsOn: ["settings"],
  },
  {
    id: "permission",
    target: "src/stores/modules/permission.ts",
    status: "migrated",
    dependsOn: [],
  },
] as const satisfies readonly StoreMigrationRecord[];
