import { http } from "../../http";
import type {
  EntityId,
  IdCollection,
  TreeSelectNode,
  UserAuthRoleResponse,
  UserAvatarResponse,
  UserFormResponse,
  UserPageResponse,
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserQuery,
  UserRolesRequest,
  UserUpsertRequest,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodeIdCollection, encodePathSegment, optionalPathId } from "../shared";

export function listUser(query: UserQuery): Promise<UserPageResponse> {
  return http.get<UserPageResponse>("/system/user/list", { params: query });
}

export function getUser(userId?: EntityId): Promise<UserFormResponse> {
  return http.get<UserFormResponse>(`/system/user/${optionalPathId(userId)}`);
}

export function addUser(data: UserUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/user", data);
}

export function updateUser(data: UserUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user", data);
}

export function delUser(userIds: IdCollection): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/user/${encodeIdCollection(userIds)}`);
}

export function resetUserPwd(userId: EntityId, password: string): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user/resetPwd", { userId, password });
}

export function changeUserStatus(userId: EntityId, status: "0" | "1"): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user/changeStatus", { userId, status });
}

export function getUserProfile(): Promise<UserProfileResponse> {
  return http.get<UserProfileResponse>("/system/user/profile");
}

export function updateUserProfile(data: UserProfileUpdateRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user/profile", data);
}

export function updateUserPwd(oldPassword: string, newPassword: string): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user/profile/updatePwd", {
    oldPassword,
    newPassword,
  });
}

export function uploadAvatar(data: FormData): Promise<UserAvatarResponse> {
  return http.post<UserAvatarResponse>("/system/user/profile/avatar", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getAuthRole(userId: EntityId): Promise<UserAuthRoleResponse> {
  return http.get<UserAuthRoleResponse>(
    `/system/user/authRole/${encodePathSegment(userId)}`,
  );
}

export function updateAuthRole(data: UserRolesRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/user/authRole", undefined, { params: data });
}

export function deptTreeSelect(): Promise<ApiResponse<TreeSelectNode[]>> {
  return http.get<ApiResponse<TreeSelectNode[]>>("/system/user/deptTree");
}
