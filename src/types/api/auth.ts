import type { EntityId } from "./common";
import type { SystemUser } from "./system";

export type LoginRequest = {
  username: string;
  password: string;
  code: string;
  uuid: string;
};

export type RegisterRequest = LoginRequest & {
  confirmPassword?: string;
};

export type LoginResponse = {
  code: number;
  msg?: string;
  token: string;
};

export type UserInfoResponse = {
  code: number;
  msg?: string;
  user: SystemUser;
  roles: string[];
  permissions: string[];
  pwdChrtype?: string;
  isDefaultModifyPwd?: boolean;
  isPasswordExpired?: boolean;
};

export type CaptchaResponse = {
  code: number;
  msg?: string;
  uuid: string;
  img: string;
  captchaEnabled: boolean;
};

export type RouteMeta = {
  title?: string;
  icon?: string;
  noCache?: boolean;
  affix?: boolean;
  breadcrumb?: boolean;
  activeMenu?: string;
  link?: string | null;
};

export type RouteNode = {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string | null;
  component?: string | null;
  query?: string | null;
  alwaysShow?: boolean;
  meta?: RouteMeta;
  children?: RouteNode[];
};

export type RouterResponse = {
  code: number;
  msg?: string;
  data: RouteNode[];
};

export type SessionUserRef = {
  userId: EntityId;
};
