import type {
  Department,
  DepartmentQuery,
  DepartmentUpsertRequest,
} from "../../../types/api/system";
import { nestByParent, type TreeNode } from "../../../utils/tree-edit";

export const DEPT_PAGE_NAME = "Dept";
export const DEPT_PHONE_PATTERN = /^1[3-9]\d{9}$/;
export const ROOT_PARENT_ID = "0";

export type DeptListQuery = DepartmentQuery;
export type DeptTreeNode = TreeNode<Department>;

export function emptyDeptQuery(): DeptListQuery {
  return { deptName: "" };
}

export function emptyDeptForm(parentId = ROOT_PARENT_ID): DepartmentUpsertRequest {
  return {
    parentId,
    deptName: "",
    orderNum: 0,
    leader: "",
    phone: "",
    email: "",
    status: "0",
  };
}

export function deptToForm(row: Department): DepartmentUpsertRequest {
  return {
    deptId: row.deptId,
    parentId: row.parentId,
    deptName: row.deptName,
    orderNum: row.orderNum,
    leader: row.leader ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    status: row.status,
  };
}

export function toDeptTree(rows: readonly Department[]): DeptTreeNode[] {
  return nestByParent(rows, (row) => row.deptId, (row) => row.parentId);
}

export function isRootDept(row: Pick<Department, "parentId">): boolean {
  return row.parentId === ROOT_PARENT_ID;
}