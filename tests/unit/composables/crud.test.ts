import { describe, expect, test } from "bun:test";
import {
  asSingleId,
  confirmDeleteMessage,
  emptySelection,
  firstPage,
  idsForAction,
  paginateRows,
  replaceObject,
  selectionFromRows,
} from "../../../src/composables/crud";

describe("CRUD selection and paging helpers", () => {
  test("empty selection disables batch actions and requires a single row for edit", () => {
    expect(emptySelection<string>()).toEqual({
      ids: [],
      rows: [],
      single: true,
      multiple: true,
    });
    expect(selectionFromRows([{ id: "1" }], (row) => row.id)).toEqual({
      ids: ["1"],
      rows: [{ id: "1" }],
      single: false,
      multiple: false,
    });
    expect(selectionFromRows([{ id: "1" }, { id: "2" }], (row) => row.id).single).toBe(true);
  });

  test("resolves a row id or the current selection and formats delete copy", () => {
    expect(idsForAction({ id: "9" }, (row) => row.id, ["1", "2"])).toBe("9");
    expect(idsForAction(undefined, (row: { id: string }) => row.id, ["1", "2"])).toEqual(["1", "2"]);
    expect(asSingleId(["3", "4"])).toBe("3");
    expect(asSingleId([] as string[])).toBeUndefined();
    expect(asSingleId("8")).toBe("8");
    expect(confirmDeleteMessage("参数", "1,2")).toBe('是否确认删除参数编号为"1,2"的数据项？');
  });

  test("resets query/form objects without leaving stale ids and paginates", () => {
    const form = { configId: "1", configName: "old" };
    replaceObject(form, { configName: "new" } as typeof form);
    expect(form).toEqual({ configName: "new" });
    expect("configId" in form).toBe(false);
    expect(firstPage({ pageNum: 4, q: "x" })).toEqual({ pageNum: 1, q: "x" });
    expect(paginateRows([1, 2, 3, 4], 2, 2)).toEqual({ rows: [3, 4], total: 4 });
    expect(paginateRows([1, 2, 3], 0, 0)).toEqual({ rows: [1, 2, 3], total: 3 });
  });
});
