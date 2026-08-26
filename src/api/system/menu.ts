import { http } from "../../http";
import type {
  EntityId,
  Menu,
  MenuQuery,
  MenuUpsertRequest,
  RoleMenuTreeResponse,
  SortRequest,
  TreeSelectNode,
} from "../../types/api";
import type { ApiResponse, EmptyResponse } from "../../types/http";
import { encodePathSegment } from "../shared";

export function listMenu(query?: MenuQuery): Promise<ApiResponse<Menu[]>> {
  return http.get<ApiResponse<Menu[]>>("/system/menu/list", { params: query });
}

export function getMenu(menuId: EntityId): Promise<ApiResponse<Menu>> {
  return http.get<ApiResponse<Menu>>(`/system/menu/${encodePathSegment(menuId)}`);
}

export function treeselect(): Promise<ApiResponse<TreeSelectNode[]>> {
  return http.get<ApiResponse<TreeSelectNode[]>>("/system/menu/treeselect");
}

export function roleMenuTreeselect(roleId: EntityId): Promise<RoleMenuTreeResponse> {
  return http.get<RoleMenuTreeResponse>(`/system/menu/roleMenuTreeselect/${encodePathSegment(roleId)}`);
}

export function addMenu(data: MenuUpsertRequest): Promise<EmptyResponse> {
  return http.post<EmptyResponse>("/system/menu", data);
}

export function updateMenu(data: MenuUpsertRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/menu", data);
}

export function updateMenuSort(data: SortRequest): Promise<EmptyResponse> {
  return http.put<EmptyResponse>("/system/menu/updateSort", data);
}

export function delMenu(menuId: EntityId): Promise<EmptyResponse> {
  return http.delete<EmptyResponse>(`/system/menu/${encodePathSegment(menuId)}`);
}
