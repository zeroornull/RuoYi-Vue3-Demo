import { describe, expect, test } from "bun:test";
import { parseTime } from "../../../src/utils/parse-time";

describe("parseTime", () => {
  test("returns null for empty input", () => {
    expect(parseTime()).toBeNull();
    expect(parseTime(null)).toBeNull();
    expect(parseTime("")).toBeNull();
    expect(parseTime(0)).toBeNull();
  });

  test("formats a Date with the default pattern", () => {
    const date = new Date(2020, 0, 2, 3, 4, 5);
    expect(parseTime(date)).toBe("2020-01-02 03:04:05");
  });

  test("formats custom tokens including weekday", () => {
    const sunday = new Date(2020, 0, 5, 0, 0, 0);
    expect(parseTime(sunday, "{y}/{m}/{d} {a}")).toBe("2020/01/05 日");
  });

  test("treats 10-digit numbers as unix seconds", () => {
    const seconds = 1577934245;
    const fromSeconds = parseTime(seconds);
    const fromMillis = parseTime(seconds * 1000);
    expect(fromSeconds).toBe(fromMillis);
  });

  test("parses numeric strings", () => {
    const date = new Date(2020, 0, 2, 3, 4, 5);
    expect(parseTime(String(date.getTime()), "{y}-{m}-{d}")).toBe(parseTime(date, "{y}-{m}-{d}"));
  });
});
