import type { Role, RoleQuery, RoleUpsertRequest } from "../../../types/api/system";

export const ROLE_PAGE_NAME = "Role";
export const AUTH_USER_PAGE_NAME = "AuthUser";
export const SELECT_USER_PAGE_NAME = "SelectUser";
export const ADMIN_ROLE_ID = "1";

export type RoleListQuery = RoleQuery & {
  pageNum: number;
  pageSize: number;
};

export type DataScopeOption = {
  value: Role["dataScope"];
  label: string;
};

export const DATA_SCOPE_OPTIONS: readonly DataScopeOption[] = [
  { value: "1", label: "全部数据权限" },
  { value: "2", label: "自定数据权限" },
  { value: "3", label: "本部门数据权限" },
  { value: "4", label: "本部门及以下数据权限" },
  { value: "5", label: "仅本人数据权限" },
];

export function emptyRoleQuery(): RoleListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    roleName: "",
    roleKey: "",
  };
}

export function emptyRoleForm(): RoleUpsertRequest {
  return {
    roleName: "",
    roleKey: "",
    roleSort: 0,
    status: "0",
    dataScope: "1",
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    menuIds: [],
    deptIds: [],
    remark: "",
  };
}

export function roleToForm(row: Role): RoleUpsertRequest {
  return {
    roleId: row.roleId,
    roleName: row.roleName,
    roleKey: row.roleKey,
    roleSort: Number(row.roleSort),
    status: row.status,
    dataScope: row.dataScope,
    menuCheckStrictly: row.menuCheckStrictly ?? true,
    deptCheckStrictly: row.deptCheckStrictly ?? true,
    menuIds: row.menuIds ? [...row.menuIds] : [],
    deptIds: row.deptIds ? [...row.deptIds] : [],
    remark: row.remark ?? "",
  };
}

export function isProtectedRole(roleId: string | undefined): boolean {
  return roleId === ADMIN_ROLE_ID;
}

export type RoleTreeInstance = {
  getCheckedKeys: (leafOnly?: boolean) => unknown[];
  getHalfCheckedKeys: () => unknown[];
  setCheckedKeys: (keys: unknown[]) => void;
  setChecked: (key: unknown, checked: boolean, deep: boolean) => void;
  setCheckedNodes: (nodes: unknown[]) => void;
  store?: {
    nodesMap?: Record<string, { expanded: boolean }>;
  };
};

export function collectCheckedTreeIds(
  tree: Pick<RoleTreeInstance, "getCheckedKeys" | "getHalfCheckedKeys"> | null | undefined,
): string[] {
  if (!tree) {
    return [];
  }
  const half = tree.getHalfCheckedKeys().map((id) => String(id));
  const checked = tree.getCheckedKeys().map((id) => String(id));
  return [...half, ...checked];
}

export function setRootTreeExpand(
  tree: Pick<RoleTreeInstance, "store"> | null | undefined,
  roots: readonly { id: string }[],
  expanded: boolean,
): void {
  const nodesMap = tree?.store?.nodesMap;
  if (!nodesMap) {
    return;
  }
  for (const node of roots) {
    const mapped = nodesMap[node.id];
    if (mapped) {
      mapped.expanded = expanded;
    }
  }
}
