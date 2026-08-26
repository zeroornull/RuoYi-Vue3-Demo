import { describe, expect, test } from "bun:test";
import { formatUnmatchedValues, isPlainDictTag, matchDictTagValues } from "../../../../src/components/DictTag/model";

const options = [
  { label: "正常", value: "0", elTagType: "success" },
  { label: "停用", value: "1", elTagType: "danger", elTagClass: "status" },
  { label: "默认", value: "2" },
];

describe("DictTag matching", () => {
  test("matches scalar, comma-separated and array values", () => {
    expect(matchDictTagValues(options, 0).matched.map((item) => item.label)).toEqual(["正常"]);
    expect(matchDictTagValues(options, "0,1").matched.map((item) => item.label)).toEqual(["正常", "停用"]);
    expect(matchDictTagValues(options, ["1", "9"]).unmatched).toEqual(["9"]);
  });

  test("treats empty options or values as unmatched silence", () => {
    expect(matchDictTagValues(null, "0")).toEqual({ matched: [], unmatched: [] });
    expect(matchDictTagValues(options, "")).toEqual({ matched: [], unmatched: [] });
    expect(formatUnmatchedValues(["9", "8"])).toBe("9 8");
  });

  test("uses a plain span only when tag type and class are empty/default", () => {
    expect(isPlainDictTag(options[2]!)).toBe(true);
    expect(isPlainDictTag(options[0]!)).toBe(false);
  });
});
