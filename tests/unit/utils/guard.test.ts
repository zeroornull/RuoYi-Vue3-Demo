import { describe, expect, test } from "bun:test";
import { isRecord, parseJsonUnknown } from "../../../src/utils/guard";

describe("parseJsonUnknown", () => {
  test("returns unknown and narrows objects with a type guard", () => {
    const value = parseJsonUnknown('{"id":"1"}');
    expect(isRecord(value)).toBe(true);
    if (isRecord(value)) {
      expect(value.id).toBe("1");
    }
  });
});
