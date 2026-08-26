export type TreeNode<T> = T & { children: TreeNode<T>[] };

export function entityId(value: unknown): string {
  return String(value);
}

export function nestByParent<T extends object>(
  rows: readonly T[],
  idOf: (row: T) => string,
  parentIdOf: (row: T) => string,
): TreeNode<T>[] {
  const nodes: TreeNode<T>[] = rows.map((row) => ({
    ...row,
    children: [],
  }));
  const byId = new Map(nodes.map((node) => [idOf(node), node]));
  const roots: TreeNode<T>[] = [];
  for (const node of nodes) {
    const id = idOf(node);
    const parentId = parentIdOf(node);
    const parent = byId.get(parentId);
    if (!parent || parentId === id) {
      roots.push(node);
      continue;
    }
    parent.children.push(node);
  }
  return roots;
}

export function collectDescendantIds<T>(
  node: T,
  idOf: (row: T) => string,
  childrenOf: (row: T) => readonly T[] | undefined,
): string[] {
  const ids: string[] = [];
  const walk = (current: T): void => {
    ids.push(idOf(current));
    for (const child of childrenOf(current) ?? []) {
      walk(child);
    }
  };
  walk(node);
  return ids;
}

export function excludeSelfAndDescendants<T>(
  nodes: readonly T[],
  selfId: string,
  idOf: (row: T) => string,
  childrenOf: (row: T) => readonly T[] | undefined,
): T[] {
  const blocked = new Set<string>();
  const find = (list: readonly T[]): void => {
    for (const node of list) {
      if (idOf(node) === selfId) {
        for (const id of collectDescendantIds(node, idOf, childrenOf)) {
          blocked.add(id);
        }
        continue;
      }
      find(childrenOf(node) ?? []);
    }
  };
  find(nodes);
  if (blocked.size === 0) {
    blocked.add(selfId);
  }
  const filter = (list: readonly T[]): T[] => {
    const next: T[] = [];
    for (const node of list) {
      if (blocked.has(idOf(node))) {
        continue;
      }
      next.push({
        ...node,
        children: filter(childrenOf(node) ?? []),
      } as T);
    }
    return next;
  };
  return filter(nodes);
}

export function wouldCreateCycle(
  rows: readonly { id: string; parentId: string }[],
  nodeId: string,
  nextParentId: string,
): boolean {
  if (nextParentId === "" || nextParentId === "0") {
    return false;
  }
  if (nextParentId === nodeId) {
    return true;
  }
  const parentOf = new Map(rows.map((row) => [row.id, row.parentId]));
  const seen = new Set<string>();
  let current: string | undefined = nextParentId;
  while (current && current !== "0") {
    if (current === nodeId) {
      return true;
    }
    if (seen.has(current)) {
      return true;
    }
    seen.add(current);
    current = parentOf.get(current);
  }
  return false;
}

export function recordOrders<T>(
  nodes: readonly T[],
  idOf: (row: T) => string,
  orderOf: (row: T) => number,
  childrenOf: (row: T) => readonly T[] | undefined,
): Record<string, number> {
  const orders: Record<string, number> = {};
  const walk = (list: readonly T[]): void => {
    for (const node of list) {
      orders[idOf(node)] = orderOf(node);
      walk(childrenOf(node) ?? []);
    }
  };
  walk(nodes);
  return orders;
}

export type SortChange = {
  ids: string;
  orderNums: string;
};

export function collectChangedSort<T>(
  nodes: readonly T[],
  original: Readonly<Record<string, number>>,
  idOf: (row: T) => string,
  orderOf: (row: T) => number,
  childrenOf: (row: T) => readonly T[] | undefined,
): SortChange | null {
  const ids: string[] = [];
  const orderNums: string[] = [];
  const walk = (list: readonly T[]): void => {
    for (const node of list) {
      const id = idOf(node);
      if (String(original[id]) !== String(orderOf(node))) {
        ids.push(id);
        orderNums.push(String(orderOf(node)));
      }
      walk(childrenOf(node) ?? []);
    }
  };
  walk(nodes);
  if (ids.length === 0) {
    return null;
  }
  return { ids: ids.join(","), orderNums: orderNums.join(",") };
}

export function confirmDeleteName(entityLabel: string, name: string): string {
  return `是否确认删除名称为"${name}"的${entityLabel}？`;
}
