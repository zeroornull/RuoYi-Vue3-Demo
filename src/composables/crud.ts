export type CrudSelection<Id> = {
  ids: Id[];
  rows: unknown[];
  single: boolean;
  multiple: boolean;
};

export function emptySelection<Id>(): CrudSelection<Id> {
  return { ids: [], rows: [], single: true, multiple: true };
}

export function selectionFromRows<Row, Id>(
  rows: readonly Row[],
  idOf: (row: Row) => Id,
): CrudSelection<Id> {
  const ids = rows.map(idOf);
  return {
    ids,
    rows: [...rows],
    single: ids.length !== 1,
    multiple: ids.length === 0,
  };
}

export function idsForAction<Row, Id>(
  row: Row | undefined,
  idOf: (row: Row) => Id,
  selected: readonly Id[],
): Id | readonly Id[] {
  if (row) {
    return idOf(row);
  }
  return selected;
}

export function confirmDeleteMessage(
  entityLabel: string,
  ids: unknown,
): string {
  return `是否确认删除${entityLabel}编号为"${String(ids)}"的数据项？`;
}

export function firstPage<T extends { pageNum: number }>(query: T): T {
  return { ...query, pageNum: 1 };
}

export type PageEnvelope<Row> = {
  rows: Row[];
  total: number;
};

export function paginateRows<Row>(
  rows: readonly Row[],
  pageNum: number,
  pageSize: number,
): PageEnvelope<Row> {
  const page = pageNum < 1 ? 1 : pageNum;
  const size = pageSize < 1 ? 10 : pageSize;
  const start = (page - 1) * size;
  return {
    rows: rows.slice(start, start + size),
    total: rows.length,
  };
}

export function replaceObject<T extends object>(target: T, source: T): T {
  for (const key of Object.keys(target) as Array<keyof T>) {
    delete target[key];
  }
  Object.assign(target, source);
  return target;
}

export function asSingleId<Id>(ids: Id | readonly Id[]): Id | undefined {
  if (Array.isArray(ids)) {
    return (ids as readonly Id[])[0];
  }
  return ids as Id;
}
