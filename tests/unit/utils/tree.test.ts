import { describe, expect, test } from "bun:test";
import { handleTree } from "../../../src/utils/tree";

describe("handleTree", () => {
  test("builds children under the matching parent", () => {
    const rows = [
      { id: 1, parentId: 0, name: "root" },
      { id: 2, parentId: 1, name: "child" },
    ];
    const tree = handleTree(rows);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe("root");
    expect(tree[0]?.children).toEqual([{ id: 2, parentId: 1, name: "child", children: [] }]);
  });

  test("treats nodes with missing parents as roots", () => {
    const rows = [{ id: 2, parentId: 99, name: "orphan" }];
    const tree = handleTree(rows);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe("orphan");
  });

  test("mutates source nodes by adding a children array", () => {
    const child = { id: 2, parentId: 1, name: "child" };
    const root = { id: 1, parentId: 0, name: "root" };
    handleTree([root, child]);
    expect(Array.isArray(child.children)).toBe(true);
    expect(Array.isArray(root.children)).toBe(true);
  });
});
