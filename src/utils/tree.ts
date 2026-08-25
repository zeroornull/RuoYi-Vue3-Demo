export function handleTree<T extends Record<string, unknown>>(
  data: T[],
  id = "id",
  parentId = "parentId",
  children = "children",
): T[] {
  const childrenListMap: Record<PropertyKey, T> = {};
  const tree: T[] = [];

  for (const node of data) {
    const writable = node as Record<string, unknown>;
    const nodeId = writable[id] as PropertyKey;
    childrenListMap[nodeId] = node;
    if (!writable[children]) {
      writable[children] = [];
    }
  }

  for (const node of data) {
    const parentKey = node[parentId] as PropertyKey;
    const parent = childrenListMap[parentKey];
    if (!parent) {
      tree.push(node);
    } else {
      const siblings = parent[children];
      if (Array.isArray(siblings)) {
        siblings.push(node);
      }
    }
  }

  return tree;
}
