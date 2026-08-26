import { describe, expect, test } from "bun:test";
import {
  customIconRegistry,
  elementIconRegistry,
  resolveCustomIcon,
  resolveElementIcon,
} from "../../../src/icons/registry";
import { buildThemeVariables, isHexTheme } from "../../../src/layout/theme";
import { IndexPage } from "../../../src/router/components/static-pages";
import { PROFILE_COMPONENT_NAME } from "../../../src/views/profile/model";

describe("layout theme variables", () => {
  test("builds Element Plus light and dark primary variables", () => {
    expect(isHexTheme("#409EFF")).toBe(true);
    expect(isHexTheme("red")).toBe(false);
    const light = buildThemeVariables("#409EFF", false);
    const dark = buildThemeVariables("#409EFF", true);
    expect(light["--el-color-primary"]).toBe("#409EFF");
    expect(light["--el-color-primary-light-9"]).toStartWith("#");
    expect(dark["--el-color-primary"]).not.toBe("#409EFF");
    expect(buildThemeVariables("bad", false)["--app-primary"]).toBe("#409EFF");
  });
});

describe("keep-alive component names", () => {
  test("matches component names to route names", () => {
    expect(IndexPage.name).toBe("Index");
    expect(PROFILE_COMPONENT_NAME).toBe("Profile");
  });
});

describe("explicit icon registry", () => {
  test("resolves known icons and leaves unknown names to the fallback", () => {
    expect(Object.keys(elementIconRegistry).length).toBeGreaterThan(20);
    expect(resolveElementIcon("dashboard")).not.toBeNull();
    expect(resolveElementIcon("user")).not.toBeNull();
    expect(resolveElementIcon("not-registered")).toBeNull();
    expect(Object.keys(customIconRegistry)).toEqual(["custom-user"]);
    expect(resolveCustomIcon("custom-user")).toEndWith(".svg");
    expect(resolveCustomIcon("unknown")).toBeNull();
  });
});
