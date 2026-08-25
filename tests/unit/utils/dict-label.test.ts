import { describe, expect, test } from "bun:test";
import { selectDictLabel, selectDictLabels } from "../../../src/utils/dict-label";

const datas = {
  "0": { label: "正常", value: "0" },
  "1": { label: "停用", value: "1" },
};

describe("selectDictLabel", () => {
  test("returns an empty string when value is undefined", () => {
    expect(selectDictLabel(datas, undefined)).toBe("");
  });

  test("returns the raw value when no dict item matches", () => {
    expect(selectDictLabel(datas, "missing")).toBe("missing");
    expect(selectDictLabel(datas, 9)).toBe("9");
  });

  test("matches loosely so numbers equal string dict values", () => {
    expect(selectDictLabel(datas, 0)).toBe("正常");
  });
});

describe("selectDictLabels", () => {
  test("joins multiple labels and keeps unmatched tokens", () => {
    expect(selectDictLabels(datas, "0,9,1")).toBe("正常,9,停用");
  });
});
