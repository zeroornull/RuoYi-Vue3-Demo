export type CapabilityKind =
  | "globalProperty"
  | "plugin"
  | "directive"
  | "globalComponent"
  | "sideEffectImport";

export type GlobalCapability = {
  name: string;
  kind: CapabilityKind;
  deleteRound: number;
  note: string;
};

export const globalCapabilityPlan = [
  {
    name: "$appTitle",
    kind: "globalProperty",
    deleteRound: 6,
    note: "Exercise only. App.vue already uses useAppTitle(); remove when no $appTitle callers remain.",
  },
  {
    name: "useDict",
    kind: "globalProperty",
    deleteRound: 7,
    note: "Label lookup is in src/utils/dict-label.ts. The store/API composable waits for rounds 9–10.",
  },
  {
    name: "parseTime / resetForm / handleTree / addDateRange / selectDictLabel(s)",
    kind: "globalProperty",
    deleteRound: 7,
    note: "Pure functions live in src/utils. resetForm stays unmigrated (Options API this.$refs).",
  },
  {
    name: "download / $download",
    kind: "globalProperty",
    deleteRound: 8,
    note: "Use src/http/download.ts. Do not hang download on globalProperties.",
  },
  {
    name: "$cache",
    kind: "plugin",
    deleteRound: 8,
    note: "session/local adapters are src/http/cache.ts. JSON parse failures return null.",
  },
  {
    name: "getConfigKey",
    kind: "globalProperty",
    deleteRound: 9,
    note: "System config API.",
  },
  {
    name: "Pinia",
    kind: "plugin",
    deleteRound: 10,
    note: "Installed in round 10 through src/stores after Element Plus and before Router.",
  },
  {
    name: "Vue Router",
    kind: "plugin",
    deleteRound: 11,
    note: "Installed in round 11 after Pinia; only typed static routes are active.",
  },
  {
    name: "$auth / v-hasPermi / v-hasRole / permission.js",
    kind: "sideEffectImport",
    deleteRound: 12,
    note: "Do not import permission as a side effect in main.ts.",
  },
  {
    name: "$tab / svg-icon / elementIcons",
    kind: "globalComponent",
    deleteRound: 13,
    note: "Layout and icon sprite.",
  },
  {
    name: "DictTag / Pagination / FileUpload / ImageUpload / ImagePreview / RightToolbar / Editor / $modal / v-copyText",
    kind: "globalComponent",
    deleteRound: 14,
    note: "Shared components. Do not register them until those modules exist.",
  },
] as const satisfies readonly GlobalCapability[];
