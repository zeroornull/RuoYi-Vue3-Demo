import { describe, expect, test } from "bun:test";
import { dictDataToItem, FALLBACK_DICTS } from "../../../src/composables/dict-model";

describe("dictionary mapping", () => {
  test("maps API rows onto DictTag items and keeps fallbacks for core types", () => {
    expect(
      dictDataToItem({
        dictCode: "1",
        dictSort: 1,
        dictLabel: "是",
        dictValue: "Y",
        dictType: "sys_yes_no",
        isDefault: "Y",
        status: "0",
        listClass: "success",
        cssClass: "yes",
      }),
    ).toEqual({
      label: "是",
      value: "Y",
      elTagType: "success",
      elTagClass: "yes",
    });
    expect(FALLBACK_DICTS.sys_yes_no?.map((item) => item.value)).toEqual(["Y", "N"]);
    expect(FALLBACK_DICTS.sys_normal_disable?.[0]?.elTagType).toBe("success");
    expect(FALLBACK_DICTS.sys_notice_type?.map((item) => item.value)).toEqual([
      "1",
      "2",
    ]);
  });
});
