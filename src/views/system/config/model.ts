import type { Config, ConfigQuery, ConfigUpsertRequest } from "../../../types/api/system";

export const CONFIG_PAGE_NAME = "Config";

export type ConfigListQuery = ConfigQuery & {
  pageNum: number;
  pageSize: number;
};

export function emptyConfigQuery(): ConfigListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    configName: "",
    configKey: "",
  };
}

export function emptyConfigForm(): ConfigUpsertRequest {
  return {
    configName: "",
    configKey: "",
    configValue: "",
    configType: "Y",
    remark: "",
  };
}

export function configToForm(row: Config): ConfigUpsertRequest {
  return {
    configId: row.configId,
    configName: row.configName,
    configKey: row.configKey,
    configValue: row.configValue,
    configType: row.configType,
    remark: row.remark ?? "",
  };
}
