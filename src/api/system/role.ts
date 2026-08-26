import { http } from "../../http";
import type {
  AuthUserQuery,
  AuthUserSelectionRequest,
  EntityId,
  IdCollection,
  Role,
  RoleDeptTreeResponse,
  RolePageResponse,
  RoleQuery,
  RoleUpsertRequest,
  UserPageResponse,
  UserRoleRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment } from "../shared";

export function listRole(query: RoleQuery): Promise<RolePageResponse> {
  return http.get<RolePageResponse>("/system/role/list", { params: query });
}

export function getRole(roleId: EntityId): Promise<ApiResponse<Role>> {
  return http.get<ApiResponse<Role>>(`/system/role/${encodePathSegment(roleId)}`);
}

export function addRole(data: RoleUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/role", data);
}

export function updateRole(data: RoleUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role", data);
}

export function dataScope(data: RoleUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role/dataScope", data);
}

export function changeRoleStatus(roleId: EntityId, status: "0" | "1"): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role/changeStatus", { roleId, status });
}

export function delRole(roleIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/role/${encodeIdCollection(roleIds)}`);
}

export function allocatedUserList(query: AuthUserQuery): Promise<UserPageResponse> {
  return http.get<UserPageResponse>("/system/role/authUser/allocatedList", {
    params: query,
  });
}

export function unallocatedUserList(query: AuthUserQuery): Promise<UserPageResponse> {
  return http.get<UserPageResponse>("/system/role/authUser/unallocatedList", {
    params: query,
  });
}

export function authUserCancel(data: UserRoleRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role/authUser/cancel", data);
}

export function authUserCancelAll(data: AuthUserSelectionRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role/authUser/cancelAll", undefined, {
    params: data,
  });
}

export function authUserSelectAll(data: AuthUserSelectionRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/role/authUser/selectAll", undefined, {
    params: data,
  });
}

export function deptTreeSelect(roleId: EntityId): Promise<RoleDeptTreeResponse> {
  return http.get<RoleDeptTreeResponse>(`/system/role/deptTree/${encodePathSegment(roleId)}`);
}
