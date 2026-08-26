export const DEFAULT_PAGE_SIZES = [10, 20, 30, 50] as const;
export const MOBILE_PAGER_COUNT = 5;
export const DESKTOP_PAGER_COUNT = 7;
export const PAGINATION_BREAKPOINT = 992;

export type PaginationChange = {
  page: number;
  limit: number;
};

export function defaultPagerCount(width: number): number {
  return width < PAGINATION_BREAKPOINT ? MOBILE_PAGER_COUNT : DESKTOP_PAGER_COUNT;
}

export function nextPageOnSizeChange(page: number, limit: number, total: number): number {
  return page * limit > total ? 1 : page;
}

export function paginationChange(page: number, limit: number): PaginationChange {
  return { page, limit };
}
