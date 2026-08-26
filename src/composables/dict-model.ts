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
  sys_show_hide: [
    { label: "显示", value: "0", elTagType: "primary" },
    { label: "隐藏", value: "1", elTagType: "danger" },
  ],
  sys_user_sex: [
    { label: "男", value: "0" },
    { label: "女", value: "1" },
    { label: "未知", value: "2" },
  ],
  sys_common_status: [
    { label: "成功", value: "0", elTagType: "success" },
    { label: "失败", value: "1", elTagType: "danger" },
  ],
  sys_oper_type: [
    { label: "其他", value: "0" },
    { label: "新增", value: "1", elTagType: "info" },
    { label: "修改", value: "2", elTagType: "warning" },
    { label: "删除", value: "3", elTagType: "danger" },
    { label: "授权", value: "4" },
    { label: "导出", value: "5", elTagType: "warning" },
    { label: "导入", value: "6" },
    { label: "强退", value: "7" },
    { label: "生成代码", value: "8" },
    { label: "清空数据", value: "9", elTagType: "danger" },
  ],
  sys_job_group: [
    { label: "默认", value: "DEFAULT" },
    { label: "系统", value: "SYSTEM" },
  ],
  sys_job_status: [
    { label: "正常", value: "0", elTagType: "success" },
    { label: "暂停", value: "1", elTagType: "info" },
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