import type {
  Department,
  LoginResponse,
  Role,
  RouteMeta,
  RouteNode,
  RouterResponse,
  SystemUser,
  UserInfoResponse,
} from "../types/api";
import type { PageResponse } from "../types/http";
import { isRecord } from "../utils/guard";

export class ApiContractError extends Error {
  constructor(path: string, expectation: string) {
    super(`API contract violation at ${path}: expected ${expectation}`);
    this.name = "ApiContractError";
  }
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new ApiContractError(path, "object");
  return value;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") throw new ApiContractError(path, "string");
  return value;
}

function numberValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiContractError(path, "finite number");
  }
  return value;
}

function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new ApiContractError(path, "boolean");
  return value;
}

function optionalString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  return stringValue(value, key);
}

function optionalBoolean(source: Record<string, unknown>, key: string): boolean | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  return booleanValue(value, key);
}

function optionalNullableString(
  source: Record<string, unknown>,
  key: string,
): string | null | undefined {
  const value = source[key];
  if (value === undefined || value === null) return value;
  return stringValue(value, key);
}

function codeMessage(value: unknown, path: string): {
  source: Record<string, unknown>;
  code: number;
  msg?: string;
} {
  const source = record(value, path);
  const msg = optionalString(source, "msg");
  return {
    source,
    code: numberValue(source.code, `${path}.code`),
    ...(msg === undefined ? {} : { msg }),
  };
}

function stringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new ApiContractError(path, "string[]");
  return value.map((item, index) => stringValue(item, `${path}[${index}]`));
}

function entityId(value: unknown, path: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  throw new ApiContractError(path, "string ID or safe integer ID");
}

function optionalEntityId(
  source: Record<string, unknown>,
  key: string,
  path: string,
): string | null | undefined {
  const value = source[key];
  if (value === undefined || value === null) return value;
  return entityId(value, `${path}.${key}`);
}

function entityIdArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new ApiContractError(path, "ID array");
  return value.map((item, index) => entityId(item, `${path}[${index}]`));
}

function enabledStatus(value: unknown, path: string): "0" | "1" {
  if (value === "0" || value === "1") return value;
  throw new ApiContractError(path, '"0" or "1"');
}

function roleDataScope(value: unknown, path: string): "1" | "2" | "3" | "4" | "5" {
  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5") {
    return value;
  }
  throw new ApiContractError(path, '"1" through "5"');
}

function optionalBaseEntity(source: Record<string, unknown>): {
  searchValue?: string | null;
  createBy?: string | null;
  createTime?: string | null;
  updateBy?: string | null;
  updateTime?: string | null;
  remark?: string | null;
} {
  const keys = [
    "searchValue",
    "createBy",
    "createTime",
    "updateBy",
    "updateTime",
    "remark",
  ] as const;
  const result: {
    searchValue?: string | null;
    createBy?: string | null;
    createTime?: string | null;
    updateBy?: string | null;
    updateTime?: string | null;
    remark?: string | null;
  } = {};
  for (const key of keys) {
    const value = optionalNullableString(source, key);
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function parseDepartment(value: unknown, path: string): Department {
  const source = record(value, path);
  const leader = optionalNullableString(source, "leader");
  const phone = optionalNullableString(source, "phone");
  const email = optionalNullableString(source, "email");
  const ancestors = optionalNullableString(source, "ancestors");
  const children = source.children;
  return {
    ...optionalBaseEntity(source),
    deptId: entityId(source.deptId, `${path}.deptId`),
    parentId: entityId(source.parentId, `${path}.parentId`),
    deptName: stringValue(source.deptName, `${path}.deptName`),
    orderNum: numberValue(source.orderNum, `${path}.orderNum`),
    status: enabledStatus(source.status, `${path}.status`),
    ...(ancestors === undefined ? {} : { ancestors }),
    ...(leader === undefined ? {} : { leader }),
    ...(phone === undefined ? {} : { phone }),
    ...(email === undefined ? {} : { email }),
    ...(children === undefined
      ? {}
      : {
          children: Array.isArray(children)
            ? children.map((item, index) =>
                parseDepartment(item, `${path}.children[${index}]`),
              )
            : (() => {
                throw new ApiContractError(`${path}.children`, "array");
              })(),
        }),
  };
}

function parseRole(value: unknown, path: string): Role {
  const source = record(value, path);
  const menuIds = source.menuIds;
  const deptIds = source.deptIds;
  const menuCheckStrictly = optionalBoolean(source, "menuCheckStrictly");
  const deptCheckStrictly = optionalBoolean(source, "deptCheckStrictly");
  const dataScope = roleDataScope(source.dataScope, `${path}.dataScope`);
  return {
    ...optionalBaseEntity(source),
    roleId: entityId(source.roleId, `${path}.roleId`),
    roleName: stringValue(source.roleName, `${path}.roleName`),
    roleKey: stringValue(source.roleKey, `${path}.roleKey`),
    roleSort: numberValue(source.roleSort, `${path}.roleSort`),
    dataScope,
    status: enabledStatus(source.status, `${path}.status`),
    ...(menuCheckStrictly === undefined ? {} : { menuCheckStrictly }),
    ...(deptCheckStrictly === undefined ? {} : { deptCheckStrictly }),
    ...(menuIds === undefined
      ? {}
      : { menuIds: entityIdArray(menuIds, `${path}.menuIds`) }),
    ...(deptIds === undefined
      ? {}
      : { deptIds: entityIdArray(deptIds, `${path}.deptIds`) }),
  };
}

function parseSystemUser(value: unknown, path: string): SystemUser {
  const source = record(value, path);
  const deptId = optionalEntityId(source, "deptId", path);
  const email = optionalNullableString(source, "email");
  const phonenumber = optionalNullableString(source, "phonenumber");
  const avatar = optionalNullableString(source, "avatar");
  const sex = optionalString(source, "sex");
  const dept = source.dept;
  const roles = source.roles;
  const roleIds = source.roleIds;
  const postIds = source.postIds;
  if (sex !== undefined && sex !== "0" && sex !== "1" && sex !== "2") {
    throw new ApiContractError(`${path}.sex`, '"0", "1" or "2"');
  }
  return {
    ...optionalBaseEntity(source),
    userId: entityId(source.userId, `${path}.userId`),
    userName: stringValue(source.userName, `${path}.userName`),
    nickName: stringValue(source.nickName, `${path}.nickName`),
    status: enabledStatus(source.status, `${path}.status`),
    ...(deptId === undefined ? {} : { deptId }),
    ...(email === undefined ? {} : { email }),
    ...(phonenumber === undefined ? {} : { phonenumber }),
    ...(avatar === undefined ? {} : { avatar }),
    ...(sex === undefined ? {} : { sex }),
    ...(dept === undefined
      ? {}
      : { dept: dept === null ? null : parseDepartment(dept, `${path}.dept`) }),
    ...(roles === undefined
      ? {}
      : {
          roles: Array.isArray(roles)
            ? roles.map((item, index) => parseRole(item, `${path}.roles[${index}]`))
            : (() => {
                throw new ApiContractError(`${path}.roles`, "array");
              })(),
        }),
    ...(roleIds === undefined
      ? {}
      : { roleIds: entityIdArray(roleIds, `${path}.roleIds`) }),
    ...(postIds === undefined
      ? {}
      : { postIds: entityIdArray(postIds, `${path}.postIds`) }),
  };
}

function parseRouteMeta(value: unknown, path: string): RouteMeta {
  const source = record(value, path);
  const title = optionalString(source, "title");
  const icon = optionalString(source, "icon");
  const noCache = optionalBoolean(source, "noCache");
  const affix = optionalBoolean(source, "affix");
  const breadcrumb = optionalBoolean(source, "breadcrumb");
  const activeMenu = optionalString(source, "activeMenu");
  const link = source.link;
  return {
    ...(title === undefined ? {} : { title }),
    ...(icon === undefined ? {} : { icon }),
    ...(noCache === undefined ? {} : { noCache }),
    ...(affix === undefined ? {} : { affix }),
    ...(breadcrumb === undefined ? {} : { breadcrumb }),
    ...(activeMenu === undefined ? {} : { activeMenu }),
    ...(link === undefined
      ? {}
      : { link: link === null ? null : stringValue(link, `${path}.link`) }),
  };
}

function parseRoute(value: unknown, path: string): RouteNode {
  const source = record(value, path);
  const children = source.children;
  const meta = source.meta;
  const name = optionalString(source, "name");
  const redirect = optionalNullableString(source, "redirect");
  const component = optionalNullableString(source, "component");
  const query = optionalNullableString(source, "query");
  const parsed: RouteNode = {
    path: stringValue(source.path, `${path}.path`),
    ...(source.hidden === undefined
      ? {}
      : { hidden: booleanValue(source.hidden, `${path}.hidden`) }),
    ...(source.alwaysShow === undefined
      ? {}
      : { alwaysShow: booleanValue(source.alwaysShow, `${path}.alwaysShow`) }),
    ...(meta === undefined ? {} : { meta: parseRouteMeta(meta, `${path}.meta`) }),
    ...(children === undefined
      ? {}
      : {
          children: Array.isArray(children)
            ? children.map((item, index) => parseRoute(item, `${path}.children[${index}]`))
            : (() => {
                throw new ApiContractError(`${path}.children`, "array");
              })(),
        }),
    ...(name === undefined ? {} : { name }),
    ...(redirect === undefined ? {} : { redirect }),
    ...(component === undefined ? {} : { component }),
    ...(query === undefined ? {} : { query }),
  };
  return parsed;
}

export function parseLoginResponse(value: unknown): LoginResponse {
  const { source, code, msg } = codeMessage(value, "login");
  return {
    code,
    ...(msg === undefined ? {} : { msg }),
    token: stringValue(source.token, "login.token"),
  };
}

export function parseUserInfoResponse(value: unknown): UserInfoResponse {
  const { source, code, msg } = codeMessage(value, "getInfo");
  const defaultPwd = optionalBoolean(source, "isDefaultModifyPwd");
  const expired = optionalBoolean(source, "isPasswordExpired");
  const pwdChrtype = optionalString(source, "pwdChrtype");
  return {
    code,
    ...(msg === undefined ? {} : { msg }),
    user: parseSystemUser(source.user, "getInfo.user"),
    roles: stringArray(source.roles, "getInfo.roles"),
    permissions: stringArray(source.permissions, "getInfo.permissions"),
    ...(pwdChrtype === undefined ? {} : { pwdChrtype }),
    ...(defaultPwd === undefined ? {} : { isDefaultModifyPwd: defaultPwd }),
    ...(expired === undefined ? {} : { isPasswordExpired: expired }),
  };
}

export function parseRouterResponse(value: unknown): RouterResponse {
  const { source, code, msg } = codeMessage(value, "getRouters");
  if (!Array.isArray(source.data)) {
    throw new ApiContractError("getRouters.data", "array");
  }
  return {
    code,
    ...(msg === undefined ? {} : { msg }),
    data: source.data.map((item, index) => parseRoute(item, `getRouters.data[${index}]`)),
  };
}

export function parsePageResponse<T>(
  value: unknown,
  parseRow: (row: unknown, index: number) => T,
): PageResponse<T> {
  const { source, code, msg } = codeMessage(value, "page");
  if (!Array.isArray(source.rows)) throw new ApiContractError("page.rows", "array");
  return {
    code,
    ...(msg === undefined ? {} : { msg }),
    total: numberValue(source.total, "page.total"),
    rows: source.rows.map(parseRow),
  };
}
