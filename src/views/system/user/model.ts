import type { TreePanelNode } from "../../../components/TreePanel/model";
import type { TreeSelectNode } from "../../../types/api/common";
import type { Role, SystemUser, UserQuery, UserUpsertRequest } from "../../../types/api/system";
import type { DictItem } from "../../../types/dict";
import { checkPassword } from "../../../utils/password-rule";

export const USER_PAGE_NAME = "User";
export const USER_VIEW_NAME = "UserView";
export const AUTH_ROLE_PAGE_NAME = "AuthRole";
export const ADMIN_USER_ID = "1";
export const USER_PHONE_PATTERN = /^1[3-9]\d{9}$/;

export type UserListQuery = UserQuery & {
  pageNum: number;
  pageSize: number;
};

export type AuthRoleRow = Role & { flag?: boolean };

export type UserDetail = SystemUser & {
  loginIp?: string | null;
  loginDate?: string | null;
  postIds?: string[];
  roleIds?: string[];
};

export function emptyUserQuery(): UserListQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    userName: "",
    phonenumber: "",
  };
}

export function emptyUserForm(password = ""): UserUpsertRequest {
  return {
    userName: "",
    nickName: "",
    password,
    phonenumber: "",
    email: "",
    sex: "0",
    status: "0",
    remark: "",
    postIds: [],
    roleIds: [],
  };
}

export function userToForm(
  row: SystemUser,
  postIds: readonly string[] = [],
  roleIds: readonly string[] = [],
): UserUpsertRequest {
  const form: UserUpsertRequest = {
    userId: row.userId,
    userName: row.userName,
    nickName: row.nickName,
    password: "",
    phonenumber: row.phonenumber ?? "",
    email: row.email ?? "",
    sex: row.sex ?? "0",
    status: row.status,
    remark: row.remark ?? "",
    postIds: [...postIds],
    roleIds: [...roleIds],
  };
  if (row.deptId) {
    form.deptId = row.deptId;
  }
  return form;
}

export function isProtectedUser(userId: string | undefined): boolean {
  return userId === ADMIN_USER_ID;
}

export function toTreePanelData(nodes: readonly TreeSelectNode[]): TreePanelNode[] {
  return nodes.map((node) => {
    const item: TreePanelNode = {
      id: node.id,
      label: node.label,
    };
    if (node.disabled) {
      item.disabled = true;
    }
    if (node.children && node.children.length > 0) {
      item.children = toTreePanelData(node.children);
    }
    return item;
  });
}

export function filterEnabledDeptTree(nodes: readonly TreeSelectNode[]): TreeSelectNode[] {
  const result: TreeSelectNode[] = [];
  for (const node of nodes) {
    if (node.disabled) {
      continue;
    }
    const children = node.children ? filterEnabledDeptTree(node.children) : [];
    const next: TreeSelectNode = { id: node.id, label: node.label };
    if (children.length > 0) {
      next.children = children;
    }
    result.push(next);
  }
  return result;
}

export function dictLabel(items: readonly DictItem[], value: string | undefined, fallback = "-"): string {
  if (value === undefined || value === "") {
    return fallback;
  }
  return items.find((item) => item.value === value)?.label ?? fallback;
}

export function joinOptionNames<T>(
  options: readonly T[],
  ids: readonly string[] | undefined,
  idOf: (item: T) => string,
  nameOf: (item: T) => string,
  empty = "",
): string {
  if (!ids || ids.length === 0) {
    return empty;
  }
  const selected = new Set(ids);
  const names = options
    .filter((item) => selected.has(idOf(item)))
    .map(nameOf)
    .join("、");
  return names.length > 0 ? names : empty;
}

export function assignedRoleIds(roles: readonly AuthRoleRow[]): string[] {
  return roles.filter((role) => role.flag === true).map((role) => role.roleId);
}

export function statusChangeText(status: "0" | "1"): string {
  return status === "0" ? "启用" : "停用";
}

export function passwordPromptError(value: string): string | true {
  const result = checkPassword(value, "0");
  return result.ok ? true : result.message;
}

export function passwordFieldError(value: string, chrType = "0"): string | undefined {
  const result = checkPassword(value, chrType);
  return result.ok ? undefined : result.message;
}

export type UserColumnKey = "userId" | "userName" | "nickName" | "deptName" | "phonenumber" | "status" | "createTime";

export function defaultColumnVisibility(): Record<UserColumnKey, { label: string; visible: boolean }> {
  return {
    userId: { label: "用户编号", visible: true },
    userName: { label: "用户名称", visible: true },
    nickName: { label: "用户昵称", visible: true },
    deptName: { label: "部门", visible: true },
    phonenumber: { label: "手机号码", visible: true },
    status: { label: "状态", visible: true },
    createTime: { label: "创建时间", visible: true },
  };
}
