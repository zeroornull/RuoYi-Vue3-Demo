import { describe, expect, test } from "bun:test";
import { addDateRange, tansParams } from "../../../src/utils/params";

describe("tansParams", () => {
  test("encodes scalar fields and skips empty values", () => {
    expect(
      tansParams({
        name: "张三",
        empty: "",
        nothing: null,
        missing: undefined,
        ok: "a b",
      }),
    ).toBe("name=%E5%BC%A0%E4%B8%89&ok=a%20b&");
  });

  test("flattens one level of nested objects and arrays", () => {
    expect(tansParams({ filter: { status: "0", skip: "" } })).toBe(
      "filter%5Bstatus%5D=0&",
    );
    expect(tansParams({ ids: ["1", "2"] })).toBe("ids%5B0%5D=1&ids%5B1%5D=2&");
  });
});

describe("addDateRange", () => {
  test("writes beginTime/endTime by default", () => {
    const query = addDateRange({ pageNum: 1 }, ["2020-01-01", "2020-01-31"]);
    expect(query.params).toEqual({
      beginTime: "2020-01-01",
      endTime: "2020-01-31",
    });
  });

  test("uses a custom property prefix", () => {
    const query = addDateRange({ params: { keep: true } }, ["a", "b"], "Date");
    expect(query.params).toEqual({
      keep: true,
      beginDate: "a",
      endDate: "b",
    });
  });
});
