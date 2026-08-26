import { describe, expect, test } from "bun:test";
import {
  defaultPagerCount,
  nextPageOnSizeChange,
  paginationChange,
} from "../../../../src/components/Pagination/model";

describe("Pagination boundaries", () => {
  test("uses five pagers on mobile and seven on desktop", () => {
    expect(defaultPagerCount(390)).toBe(5);
    expect(defaultPagerCount(1440)).toBe(7);
  });

  test("resets to page 1 when the new size would pass total", () => {
    expect(nextPageOnSizeChange(3, 50, 100)).toBe(1);
    expect(nextPageOnSizeChange(2, 20, 100)).toBe(2);
  });

  test("emits page and limit together", () => {
    expect(paginationChange(2, 10)).toEqual({ page: 2, limit: 10 });
  });
});
