import type { DictItem } from "../types/dict";
import type { DictData } from "../types/api/system";

export const FALLBACK_DICTS: Record<string, DictItem[]> = {
  sys_yes_no: [
    { label: "是", value: "Y" },
    { label: "否", value: "N" },
  ],
  sys_normal_disable: [
    { label: "正常", value: "0", elTagType: "success" },
    { label: "停用", value: "1", elTagType: "danger" },
  ],
  sys_notice_type: [
    { label: "通知", value: "1" },
    { label: "公告", value: "2" },
  ],
  sys_notice_status: [
    { label: "正常", value: "0", elTagType: "success" },
    { label: "关闭", value: "1", elTagType: "danger" },
  ],
};

export function dictDataToItem(row: DictData): DictItem {
  const item: DictItem = {
    label: row.dictLabel,
    value: row.dictValue,
  };
  if (row.listClass) {
    item.elTagType = row.listClass;
  }
  if (row.cssClass) {
    item.elTagClass = row.cssClass;
  }
  return item;
}