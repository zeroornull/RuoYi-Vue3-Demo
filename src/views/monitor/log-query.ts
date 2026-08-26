export type TableSortEvent = {
  prop?: string;
  order?: string | null;
};

export function tableSortToQuery(sort: TableSortEvent): {
  orderByColumn?: string;
  isAsc?: "asc" | "desc";
} {
  if (!sort.prop) {
    return {};
  }
  if (sort.order === "ascending") {
    return { orderByColumn: sort.prop, isAsc: "asc" };
  }
  if (sort.order === "descending") {
    return { orderByColumn: sort.prop, isAsc: "desc" };
  }
  return {};
}
