import { describe, expect, test } from "bun:test";
import {
  classifyCronToken,
  clampCronNumber,
  cronList,
  cronRange,
  cronStep,
  DEFAULT_CRONTAB,
  parseCrontab,
  shouldShowCrontabField,
  stringifyCrontab,
} from "../../../../src/components/Crontab/model";
import { previewCronRuns } from "../../../../src/components/Crontab/preview";

describe("Crontab expression composition", () => {
  test("parses six and seven field expressions and round-trips", () => {
    expect(parseCrontab("")).toEqual(DEFAULT_CRONTAB);
    expect(stringifyCrontab(DEFAULT_CRONTAB)).toBe("* * * * * ?");
    expect(parseCrontab("0 0/5 * * * ?")).toEqual({
      second: "0",
      min: "0/5",
      hour: "*",
      day: "*",
      month: "*",
      week: "?",
      year: "",
    });
    expect(stringifyCrontab(parseCrontab("0 15 10 * * ? 2026"))).toBe("0 15 10 * * ? 2026");
  });

  test("builds every field combination used by the editor", () => {
    expect(cronRange(1, 5)).toBe("1-5");
    expect(cronStep(0, 10)).toBe("0/10");
    expect(cronList([1, 2, 3])).toBe("1,2,3");
    expect(classifyCronToken("15W")).toBe("workday");
    expect(classifyCronToken("6#3")).toBe("nth");
    expect(classifyCronToken("5L")).toBe("last");
    expect(classifyCronToken("?")).toBe("unspecified");
    expect(clampCronNumber(80, 0, 59)).toBe(59);
    expect(shouldShowCrontabField(["year"], "year")).toBe(false);
    expect(shouldShowCrontabField(["year"], "min")).toBe(true);
  });

  test("previews upcoming runs from a fixed clock", () => {
    const now = new Date("2026-01-01T00:00:00");
    const runs = previewCronRuns("0 0 0 1 1 ? 2027", now, 2);
    expect(runs[0]).toStartWith("2027-01-01 00:00:00");
    expect(previewCronRuns("0 0/15 * * * ?", now, 3).length).toBe(3);
  });
});
