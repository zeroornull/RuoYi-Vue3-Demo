import { isRecord } from "../../utils/guard";

export type ColumnVisible = {
  key?: string | number;
  label: string;
  visible: boolean;
};

export type ColumnCollection = ColumnVisible[] | Record<string, ColumnVisible>;

export type ColumnVisibilityState = Record<string, boolean>;

export function columnEntries(
  columns: ColumnCollection,
): ColumnVisible[] {
  return Array.isArray(columns) ? columns : Object.values(columns);
}

export function isAllColumnsVisible(columns: ColumnCollection): boolean {
  const entries = columnEntries(columns);
  return entries.length > 0 && entries.every((column) => column.visible);
}

export function isSomeColumnsVisible(columns: ColumnCollection): boolean {
  return columnEntries(columns).some((column) => column.visible);
}

export function setAllColumnsVisible(
  columns: ColumnCollection,
  visible: boolean,
): void {
  if (Array.isArray(columns)) {
    for (const column of columns) {
      column.visible = visible;
    }
    return;
  }
  for (const column of Object.values(columns)) {
    column.visible = visible;
  }
}

export function hiddenTransferKeys(columns: ColumnCollection): number[] {
  if (Array.isArray(columns)) {
    return columns.flatMap((column, index) =>
      column.visible === false ? [index] : [],
    );
  }
  return Object.keys(columns).flatMap((key, index) =>
    columns[key]?.visible === false ? [index] : [],
  );
}

export function applyTransferHiddenKeys(
  columns: ColumnCollection,
  hiddenKeys: readonly number[],
): void {
  if (Array.isArray(columns)) {
    for (const [index, column] of columns.entries()) {
      const key = column.key;
      const hiddenId = typeof key === "number" ? key : index;
      column.visible = !hiddenKeys.includes(hiddenId);
    }
    return;
  }
  Object.keys(columns).forEach((key, index) => {
    const column = columns[key];
    if (column) {
      column.visible = !hiddenKeys.includes(index);
    }
  });
}

export function snapshotColumnVisibility(
  columns: ColumnCollection,
): ColumnVisibilityState {
  const state: ColumnVisibilityState = {};
  if (Array.isArray(columns)) {
    columns.forEach((column, index) => {
      state[String(index)] = column.visible;
    });
    return state;
  }
  for (const key of Object.keys(columns)) {
    const column = columns[key];
    if (column) {
      state[key] = column.visible;
    }
  }
  return state;
}

export function restoreColumnVisibility(
  columns: ColumnCollection,
  saved: unknown,
): void {
  if (!isRecord(saved)) {
    return;
  }
  if (Array.isArray(columns)) {
    columns.forEach((column, index) => {
      const value = saved[String(index)];
      if (typeof value === "boolean") {
        column.visible = value;
      }
    });
    return;
  }
  for (const key of Object.keys(columns)) {
    const column = columns[key];
    const value = saved[key];
    if (column && typeof value === "boolean") {
      column.visible = value;
    }
  }
}

export function transferData(columns: ColumnCollection): {
  key: number;
  label: string;
}[] {
  if (Array.isArray(columns)) {
    return columns.map((item, index) => ({
      key: index,
      label: item.label,
    }));
  }
  return Object.keys(columns).map((key, index) => ({
    key: index,
    label: columns[key]?.label ?? key,
  }));
}
