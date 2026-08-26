import type { Menu, MenuQuery, MenuUpsertRequest } from "../../../types/api/system";
import { nestByParent, type TreeNode } from "../../../utils/tree-edit";

export const MENU_PAGE_NAME = "Menu";
export const MENU_ROOT_ID = "0";
export const MENU_ROOT_NAME = "主类目";

export type MenuListQuery = MenuQuery;
export type MenuTreeNode = TreeNode<Menu>;
export type MenuParentOption = {
  menuId: string;
  menuName: string;
  children: MenuParentOption[];
};

export function emptyMenuQuery(): MenuListQuery {
  return { menuName: "" };
}

export function emptyMenuForm(parentId = MENU_ROOT_ID): MenuUpsertRequest {
  return {
    parentId,
    menuName: "",
    orderNum: 0,
    path: "",
    component: "",
    query: "",
    routeName: "",
    perms: "",
    icon: "",
    isFrame: "1",
    isCache: "0",
    menuType: "M",
    visible: "0",
    status: "0",
  };
}

export function menuToForm(row: Menu): MenuUpsertRequest {
  return {
    menuId: row.menuId,
    parentId: row.parentId,
    menuName: row.menuName,
    orderNum: row.orderNum,
    path: row.path,
    component: row.component ?? "",
    query: row.query ?? "",
    routeName: row.routeName ?? "",
    perms: row.perms ?? "",
    icon: row.icon ?? "",
    isFrame: row.isFrame,
    isCache: row.isCache,
    menuType: row.menuType,
    visible: row.visible,
    status: row.status,
  };
}

export function toMenuTree(rows: readonly Menu[]): MenuTreeNode[] {
  return nestByParent(
    rows,
    (row) => row.menuId,
    (row) => row.parentId,
  );
}

export function withMenuRoot(children: MenuParentOption[]): MenuParentOption[] {
  return [
    {
      menuId: MENU_ROOT_ID,
      menuName: MENU_ROOT_NAME,
      children,
    },
  ];
}

export function toMenuParentOptions(nodes: readonly MenuTreeNode[]): MenuParentOption[] {
  return nodes.map((node) => ({
    menuId: node.menuId,
    menuName: node.menuName,
    children: toMenuParentOptions(node.children),
  }));
}

export function menuTypeLabel(row: Pick<Menu, "menuType" | "isFrame">): string {
  if (row.isFrame === "0") {
    return "外链";
  }
  if (row.menuType === "M") {
    return "目录";
  }
  if (row.menuType === "C") {
    return "菜单";
  }
  return "按钮";
}
