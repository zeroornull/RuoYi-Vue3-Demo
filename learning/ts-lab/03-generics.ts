export type PageQuery = {
  pageNum: number;
  pageSize: number;
};

export type PageResult<T> = {
  rows: T[];
  total: number;
};

export function emptyPage<T = never>(): PageResult<T> {
  return { rows: [], total: 0 };
}

export function firstRow<T>(page: PageResult<T>): T | undefined {
  return page.rows[0];
}

export function requireFirstRow<T>(page: PageResult<T>): T {
  // @ts-expect-error noUncheckedIndexedAccess：rows[0] 是 T | undefined
  return page.rows[0];
}

export function pickById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export const usersPage = emptyPage<{ id: string; name: string }>();

export const picked = pickById(
  [
    { id: "1", name: "admin" },
    { id: "2", name: "guest" },
  ],
  "1",
);

// @ts-expect-error 泛型约束要求元素具有 string 类型的 id
export const rejected = pickById([1, 2, 3], "1");
