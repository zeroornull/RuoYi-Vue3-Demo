import { describe, expect, test } from "bun:test";
import { checkPassword } from "../../../src/utils/password-rule";

describe("checkPassword", () => {
  test("rejects length outside 6-20", () => {
    expect(checkPassword("12345").ok).toBe(false);
    expect(checkPassword("x".repeat(21)).ok).toBe(false);
  });

  test("chrtype 0 rejects illegal characters", () => {
    const result = checkPassword("abc<>12", "0");
    expect(result.ok).toBe(false);
  });

  test("chrtype 1 allows digits only", () => {
    expect(checkPassword("123456", "1").ok).toBe(true);
    expect(checkPassword("abc123", "1").ok).toBe(false);
  });

  test("chrtype 3 requires letters and digits", () => {
    expect(checkPassword("abcdef", "3").ok).toBe(false);
    expect(checkPassword("abc123", "3").ok).toBe(true);
  });

  test("chrtype 4 requires letters, digits and specials", () => {
    expect(checkPassword("abc123", "4").ok).toBe(false);
    expect(checkPassword("abc123~", "4").ok).toBe(true);
  });
});
