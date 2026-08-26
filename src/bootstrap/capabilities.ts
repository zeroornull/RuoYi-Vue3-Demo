export type CapabilityKind = "globalProperty" | "plugin" | "directive" | "globalComponent" | "sideEffectImport";

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
    note: "Label lookup is in src/utils/dict-label.ts. Page dictionaries use src/composables/useDict.ts and the Pinia dict store.",
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
    note: "v-hasPermi is installed from src/bootstrap/has-permi.ts. v-hasRole and $auth remain deferred. Route access stays in src/router/access.ts.",
  },
  {
    name: "$tab / svg-icon / elementIcons",
    kind: "globalComponent",
    deleteRound: 13,
    note: "Tags use the typed store directly; SvgIcon is registered explicitly and Element icons are imported through a finite semantic registry.",
  },
  {
    name: "DictTag / Pagination / FileUpload / ImageUpload / ImagePreview / RightToolbar / Editor / $modal / v-copyText",
    kind: "globalComponent",
    deleteRound: 14,
    note: "DictTag/Pagination/FileUpload/ImageUpload/ImagePreview/RightToolbar/Editor are globally registered. Crontab/TreePanel/IconSelect/ExcelImportDialog/HeaderSearch/Screenfull/ParentView are explicit imports. $modal/v-copyText remain deferred.",
  },
] as const satisfies readonly GlobalCapability[];
