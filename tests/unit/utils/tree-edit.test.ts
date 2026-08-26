import { describe, expect, test } from "bun:test";
import {
  collectChangedSort,
  collectDescendantIds,
  confirmDeleteName,
  entityId,
  excludeSelfAndDescendants,
  nestByParent,
  recordOrders,
  wouldCreateCycle,
} from "../../../src/utils/tree-edit";

type Node = {
  id: string;
  parentId: string;
  name: string;
  orderNum: number;
  children?: Node[];
};

function childrenOf(node: Node): Node[] {
  return node.children ?? [];
}

describe("organization tree helpers", () => {
  test("nests by parent and treats missing parents as roots", () => {
    const tree = nestByParent(
      [
        { id: "100", parentId: "0", name: "root", orderNum: 1 },
        { id: "101", parentId: "100", name: "child", orderNum: 1 },
        { id: "999", parentId: "missing", name: "orphan", orderNum: 1 },
      ],
      (row) => row.id,
      (row) => row.parentId,
    );
    expect(tree.map((node) => node.name)).toEqual(["root", "orphan"]);
    expect(tree[0]?.children.map((node) => node.name)).toEqual(["child"]);
  });

  test("self-parented nodes become roots instead of looping", () => {
    const tree = nestByParent(
      [{ id: "1", parentId: "1", name: "loop", orderNum: 1 }],
      (row) => row.id,
      (row) => row.parentId,
    );
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toEqual([]);
  });

  test("excludes self and descendants from parent options", () => {
    const tree = nestByParent(
      [
        { id: "100", parentId: "0", name: "root", orderNum: 1 },
        { id: "101", parentId: "100", name: "sz", orderNum: 1 },
        { id: "103", parentId: "101", name: "dev", orderNum: 1 },
        { id: "102", parentId: "100", name: "cs", orderNum: 2 },
      ],
      (row) => row.id,
      (row) => row.parentId,
    );
    const filtered = excludeSelfAndDescendants(tree, "101", (row) => row.id, childrenOf);
    expect(filtered.map((node) => node.id)).toEqual(["100"]);
    expect(filtered[0]?.children.map((node) => node.id)).toEqual(["102"]);
    expect(collectDescendantIds(tree[0]!, (row) => row.id, childrenOf)).toEqual(["100", "101", "103", "102"]);
  });

  test("detects parent cycles and normalizes string/number ids", () => {
    const rows = [
      { id: "100", parentId: "0" },
      { id: "101", parentId: "100" },
      { id: "103", parentId: "101" },
    ];
    expect(wouldCreateCycle(rows, "101", "101")).toBe(true);
    expect(wouldCreateCycle(rows, "100", "103")).toBe(true);
    expect(wouldCreateCycle(rows, "103", "100")).toBe(false);
    expect(wouldCreateCycle(rows, "103", "0")).toBe(false);
    expect(entityId(100)).toBe("100");
    expect(entityId("100")).toBe("100");
  });

  test("collects only changed sort pairs", () => {
    const tree = nestByParent(
      [
        { id: "1", parentId: "0", name: "a", orderNum: 3 },
        { id: "2", parentId: "1", name: "b", orderNum: 1 },
      ],
      (row) => row.id,
      (row) => row.parentId,
    );
    const original = recordOrders(
      tree,
      (row) => row.id,
      (row) => row.orderNum,
      childrenOf,
    );
    expect(
      collectChangedSort(
        tree,
        original,
        (row) => row.id,
        (row) => row.orderNum,
        childrenOf,
      ),
    ).toBeNull();
    const child = tree[0]?.children[0];
    if (child) {
      child.orderNum = 9;
    }
    expect(
      collectChangedSort(
        tree,
        original,
        (row) => row.id,
        (row) => row.orderNum,
        childrenOf,
      ),
    ).toEqual({ ids: "2", orderNums: "9" });
    expect(confirmDeleteName("部门", "研发部门")).toBe('是否确认删除名称为"研发部门"的部门？');
  });
});
