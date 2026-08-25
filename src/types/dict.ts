export type DictValue = string;

export type DictItem = {
  label: string;
  value: DictValue;
  elTagType?: string;
  elTagClass?: string;
};

export type DictMap = Record<string, Pick<DictItem, "label" | "value">>;
