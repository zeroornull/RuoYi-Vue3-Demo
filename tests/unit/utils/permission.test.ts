import { describe, expect, spyOn, test } from "bun:test";
import { checkPermi, checkRole } from "../../../src/utils/permission";

describe("checkPermi", () => {
  test("allows wildcard owners and listed permissions", () => {
    expect(checkPermi(["*:*:*"], ["system:user:add"])).toBe(true);
    expect(checkPermi(["system:user:add"], ["system:user:add"])).toBe(true);
    expect(checkPermi(["system:user:list"], ["system:user:add"])).toBe(false);
  });

  test("rejects a non-array required list", () => {
    const error = spyOn(console, "error").mockImplementation(() => undefined);
    expect(checkPermi(["system:user:add"], undefined)).toBe(false);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});

describe("checkRole", () => {
  test("treats admin as super user", () => {
    expect(checkRole(["admin"], ["editor"])).toBe(true);
    expect(checkRole(["common"], ["editor"])).toBe(false);
  });
});
