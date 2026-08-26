export type TreePanelPropsMap = {
  children?: string;
  label?: string;
};

export type TreePanelNode = {
  [key: string]: unknown;
  children?: TreePanelNode[];
};

export function defaultTreeFilter(value: string, data: Record<string, unknown>, labelKey = "label"): boolean {
  if (!value) {
    return true;
  }
  const label = data[labelKey];
  return typeof label === "string" && label.includes(value);
}

export function clampTreeWidth(width: number, minWidth: number, maxWidth: number): number {
  return Math.max(minWidth, Math.min(maxWidth, width));
}

export function readStoredWidth(raw: string | null, minWidth: number, maxWidth: number): number | null {
  if (raw === null || raw.length === 0) {
    return null;
  }
  const width = Number.parseInt(raw, 10);
  if (Number.isNaN(width) || width < minWidth || width > maxWidth) {
    return null;
  }
  return width;
}

export function emptyTreeData(data: readonly TreePanelNode[] | null | undefined): boolean {
  return !data || data.length === 0;
}

export function collectNodeKeys(
  nodes: readonly TreePanelNode[],
  nodeKey: string,
  childrenKey = "children",
): Array<string | number> {
  const keys: Array<string | number> = [];
  const walk = (items: readonly TreePanelNode[]): void => {
    for (const node of items) {
      const key = node[nodeKey];
      if (typeof key === "string" || typeof key === "number") {
        keys.push(key);
      }
      const children = node[childrenKey];
      if (Array.isArray(children)) {
        walk(children as TreePanelNode[]);
      }
    }
  };
  walk(nodes);
  return keys;
}
