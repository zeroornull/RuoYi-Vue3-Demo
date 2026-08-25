import type {
  ApiDateTime,
  BaseEntity,
  DateRangeQuery,
  EnabledStatus,
  EntityId,
  PageQuery,
  TreeSelectNode,
  YesNo,
} from "./common";
import type { ApiResponse, EmptyResponse, PageResponse } from "../http";

export type UserQuery = PageQuery & {
  userName?: string;
  phonenumber?: string;
  status?: EnabledStatus;
  deptId?: EntityId;
  params?: DateRangeQuery;
};

export type RoleQuery = PageQuery & {
  roleName?: string;
  roleKey?: string;
  status?: EnabledStatus;
  params?: DateRangeQuery;
};

export type AuthUserQuery = UserQuery & { roleId: EntityId };

export type Department = BaseEntity & {
  deptId: EntityId;
  parentId: EntityId;
  ancestors?: string | null;
  deptName: string;
  orderNum: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  status: EnabledStatus;
  children?: Department[];
};

export type Role = BaseEntity & {
  roleId: EntityId;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: "1" | "2" | "3" | "4" | "5";
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  menuIds?: EntityId[];
  deptIds?: EntityId[];
  status: EnabledStatus;
};

export type Post = BaseEntity & {
  postId: EntityId;
  postCode: string;
  postName: string;
  postSort: number;
  status: EnabledStatus;
};

export type SystemUser = BaseEntity & {
  userId: EntityId;
  deptId?: EntityId | null;
  userName: string;
  nickName: string;
  email?: string | null;
  phonenumber?: string | null;
  sex?: "0" | "1" | "2";
  avatar?: string | null;
  status: EnabledStatus;
  dept?: Department | null;
  roles?: Role[];
  roleIds?: EntityId[];
  postIds?: EntityId[];
};

export type UserUpsertRequest = {
  userId?: EntityId;
  deptId?: EntityId | null;
  userName: string;
  nickName: string;
  password?: string;
  email?: string | null;
  phonenumber?: string | null;
  sex?: "0" | "1" | "2";
  status?: EnabledStatus;
  roleIds?: EntityId[];
  postIds?: EntityId[];
  remark?: string | null;
};

export type UserProfileUpdateRequest = Pick<
  UserUpsertRequest,
  "nickName" | "email" | "phonenumber" | "sex"
>;

export type UserFormResponse = EmptyResponse & {
  data?: SystemUser;
  postIds?: EntityId[];
  roleIds?: EntityId[];
  roles: Role[];
  posts: Post[];
};

export type UserProfileResponse = ApiResponse<SystemUser> & {
  roleGroup: string;
  postGroup: string;
};

export type UserAvatarResponse = EmptyResponse & { imgUrl: string };
export type UserAuthRoleResponse = EmptyResponse & {
  user: SystemUser;
  roles: Role[];
};

export type RoleUpsertRequest = {
  roleId?: EntityId;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope?: Role["dataScope"];
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  menuIds?: EntityId[];
  deptIds?: EntityId[];
  status?: EnabledStatus;
  remark?: string | null;
};

export type UserRoleRequest = { userId: EntityId; roleId: EntityId };
export type UserRolesRequest = { userId: EntityId; roleIds: string };
export type AuthUserSelectionRequest = { roleId: EntityId; userIds: string };
export type RoleDeptTreeResponse = EmptyResponse & {
  checkedKeys: EntityId[];
  depts: TreeSelectNode[];
};

export type MenuQuery = { menuName?: string; status?: EnabledStatus };
export type Menu = BaseEntity & {
  menuId: EntityId;
  parentId: EntityId;
  menuName: string;
  orderNum: number;
  path: string;
  component?: string | null;
  query?: string | null;
  routeName?: string | null;
  perms?: string | null;
  icon?: string | null;
  isFrame: EnabledStatus;
  isCache: EnabledStatus;
  menuType: "M" | "C" | "F";
  visible: EnabledStatus;
  status: EnabledStatus;
  children?: Menu[];
};

export type MenuUpsertRequest = Omit<
  Menu,
  keyof BaseEntity | "children" | "menuId"
> & { menuId?: EntityId; remark?: string | null };
export type SortRequest = { ids: string; orderNums: string };
export type RoleMenuTreeResponse = EmptyResponse & {
  checkedKeys: EntityId[];
  menus: TreeSelectNode[];
};

export type DepartmentQuery = { deptName?: string; status?: EnabledStatus };
export type DepartmentUpsertRequest = {
  deptId?: EntityId;
  parentId: EntityId;
  deptName: string;
  orderNum: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: EnabledStatus;
};

export type DictTypeQuery = PageQuery & {
  dictName?: string;
  dictType?: string;
  status?: EnabledStatus;
  params?: DateRangeQuery;
};
export type DictDataQuery = PageQuery & {
  dictLabel?: string;
  dictType?: string;
  status?: EnabledStatus;
};
export type DictType = BaseEntity & {
  dictId: EntityId;
  dictName: string;
  dictType: string;
  status: EnabledStatus;
};
export type DictData = BaseEntity & {
  dictCode: EntityId;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string | null;
  listClass?: string | null;
  isDefault: YesNo;
  status: EnabledStatus;
};
export type DictTypeUpsertRequest = Omit<DictType, keyof BaseEntity | "dictId"> & {
  dictId?: EntityId;
  remark?: string | null;
};
export type DictDataUpsertRequest = Omit<DictData, keyof BaseEntity | "dictCode"> & {
  dictCode?: EntityId;
  remark?: string | null;
};

export type ConfigQuery = PageQuery & {
  configName?: string;
  configKey?: string;
  configType?: YesNo;
  params?: DateRangeQuery;
};
export type Config = BaseEntity & {
  configId: EntityId;
  configName: string;
  configKey: string;
  configValue: string;
  configType: YesNo;
};
export type ConfigUpsertRequest = Omit<Config, keyof BaseEntity | "configId"> & {
  configId?: EntityId;
  remark?: string | null;
};

export type NoticeQuery = PageQuery & {
  noticeTitle?: string;
  createBy?: string;
  noticeType?: "1" | "2";
};
export type Notice = BaseEntity & {
  noticeId: EntityId;
  noticeTitle: string;
  noticeType: "1" | "2";
  noticeContent: string;
  status: EnabledStatus;
  isRead?: boolean;
};
export type NoticeUpsertRequest = Omit<Notice, keyof BaseEntity | "noticeId" | "isRead"> & {
  noticeId?: EntityId;
  remark?: string | null;
};
export type NoticeTopResponse = ApiResponse<Notice[]> & { unreadCount: number };
export type NoticeReadUserQuery = PageQuery & {
  noticeId: EntityId;
  searchValue?: string;
};
export type NoticeReadUser = {
  userId: EntityId;
  userName: string;
  nickName: string;
  deptName?: string | null;
  phonenumber?: string | null;
  readTime: ApiDateTime;
};

export type PostQuery = PageQuery & {
  postCode?: string;
  postName?: string;
  status?: EnabledStatus;
};
export type PostUpsertRequest = Omit<Post, keyof BaseEntity | "postId"> & {
  postId?: EntityId;
  remark?: string | null;
};

export type UserPageResponse = PageResponse<SystemUser>;
export type RolePageResponse = PageResponse<Role>;
export type ConfigPageResponse = PageResponse<Config>;
export type DictTypePageResponse = PageResponse<DictType>;
export type DictDataPageResponse = PageResponse<DictData>;
export type NoticePageResponse = PageResponse<Notice>;
export type NoticeReadUserPageResponse = PageResponse<NoticeReadUser>;
export type PostPageResponse = PageResponse<Post>;
