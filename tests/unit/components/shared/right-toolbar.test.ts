import { describe, expect, test } from "bun:test";
import {
  applyTransferHiddenKeys,
  hiddenTransferKeys,
  isAllColumnsVisible,
  restoreColumnVisibility,
  setAllColumnsVisible,
  snapshotColumnVisibility,
} from "../../../../src/components/RightToolbar/model";

describe("RightToolbar columns", () => {
  test("toggles array and record collections", () => {
    const columns = [
      { key: "name", label: "名称", visible: true },
      { key: "status", label: "状态", visible: false },
    ];
    expect(isAllColumnsVisible(columns)).toBe(false);
    expect(hiddenTransferKeys(columns)).toEqual([1]);
    setAllColumnsVisible(columns, true);
    expect(isAllColumnsVisible(columns)).toBe(true);
    applyTransferHiddenKeys(columns, [0]);
    expect(columns[0]?.visible).toBe(false);
    expect(columns[1]?.visible).toBe(true);
  });

  test("snapshots and restores visibility by storage key", () => {
    const columns = {
      name: { label: "名称", visible: true },
      status: { label: "状态", visible: true },
    };
    const snapshot = snapshotColumnVisibility(columns);
    expect(snapshot).toEqual({ name: true, status: true });
    restoreColumnVisibility(columns, { status: false });
    expect(columns.status.visible).toBe(false);
    restoreColumnVisibility(columns, "bad");
    expect(columns.name.visible).toBe(true);
  });
});
