import { describe, expect, test } from "bun:test";
import { isExternal, isPathMatch } from "../../../src/utils/validate";

describe("isPathMatch", () => {
  test("supports single-segment and recursive wildcards", () => {
    expect(isPathMatch("/system/*", "/system/user")).toBe(true);
    expect(isPathMatch("/system/*", "/system/user/list")).toBe(false);
    expect(isPathMatch("/system/**", "/system/user/list")).toBe(true);
  });
});

describe("isExternal", () => {
  test("detects http(s), mailto and tel", () => {
    expect(isExternal("https://example.com")).toBe(true);
    expect(isExternal("/system/user")).toBe(false);
  });
});
