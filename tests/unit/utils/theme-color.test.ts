import { describe, expect, test } from "bun:test";
import { getDarkColor, getLightColor, hexToRgb, mixHexColors, rgbToHex } from "../../../src/utils/theme-color";

describe("theme colors", () => {
  test("converts hex and rgb in both directions", () => {
    expect(hexToRgb("#409eff")).toEqual([64, 158, 255]);
    expect(rgbToHex(64, 158, 255)).toBe("#409eff");
  });

  test("lightens and darkens a primary color", () => {
    expect(getLightColor("#409eff", 0.1).startsWith("#")).toBe(true);
    expect(getDarkColor("#409eff", 0.1).startsWith("#")).toBe(true);
    expect(mixHexColors("#409eff", "#2d3036", 0.34).startsWith("#")).toBe(true);
  });
});
