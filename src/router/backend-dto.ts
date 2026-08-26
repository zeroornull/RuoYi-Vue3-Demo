import { isRecord } from "../utils/guard";

export type BackendRouteMetaDto = {
  title?: string;
  icon?: string;
  noCache?: boolean;
  affix?: boolean;
  breadcrumb?: boolean;
  activeMenu?: string;
  link?: string | null;
};

export type BackendRouteDto = {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string | null;
  component?: string | null;
  query?: string | null;
  alwaysShow?: boolean;
  meta?: BackendRouteMetaDto;
  children?: BackendRouteDto[];
};

export class BackendRouteValidationError extends Error {
  constructor(path: string, expectation: string) {
    super(`Backend route violation at ${path}: expected ${expectation}`);
    this.name = "BackendRouteValidationError";
  }
}

function optionalString(
  source: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BackendRouteValidationError(`${path}.${key}`, "string");
  }
  return value;
}

function optionalNullableString(
  source: Record<string, unknown>,
  key: string,
  path: string,
): string | null | undefined {
  const value = source[key];
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") {
    throw new BackendRouteValidationError(`${path}.${key}`, "string or null");
  }
  return value;
}

function optionalBoolean(
  source: Record<string, unknown>,
  key: string,
  path: string,
): boolean | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new BackendRouteValidationError(`${path}.${key}`, "boolean");
  }
  return value;
}

function parseMeta(value: unknown, path: string): BackendRouteMetaDto | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new BackendRouteValidationError(path, "object");
  }
  const title = optionalString(value, "title", path);
  const icon = optionalString(value, "icon", path);
  const noCache = optionalBoolean(value, "noCache", path);
  const affix = optionalBoolean(value, "affix", path);
  const breadcrumb = optionalBoolean(value, "breadcrumb", path);
  const activeMenu = optionalString(value, "activeMenu", path);
  const link = optionalNullableString(value, "link", path);
  return {
    ...(title === undefined ? {} : { title }),
    ...(icon === undefined ? {} : { icon }),
    ...(noCache === undefined ? {} : { noCache }),
    ...(affix === undefined ? {} : { affix }),
    ...(breadcrumb === undefined ? {} : { breadcrumb }),
    ...(activeMenu === undefined ? {} : { activeMenu }),
    ...(link === undefined ? {} : { link }),
  };
}

export function parseBackendRoute(value: unknown, path: string): BackendRouteDto {
  if (!isRecord(value)) {
    throw new BackendRouteValidationError(path, "object");
  }
  if (typeof value.path !== "string" || value.path.trim().length === 0) {
    throw new BackendRouteValidationError(`${path}.path`, "non-empty string");
  }
  const name = optionalString(value, "name", path);
  const hidden = optionalBoolean(value, "hidden", path);
  const redirect = optionalNullableString(value, "redirect", path);
  const component = optionalNullableString(value, "component", path);
  const query = optionalNullableString(value, "query", path);
  const alwaysShow = optionalBoolean(value, "alwaysShow", path);
  const meta = parseMeta(value.meta, `${path}.meta`);
  let children: BackendRouteDto[] | undefined;
  if (value.children !== undefined) {
    if (!Array.isArray(value.children)) {
      throw new BackendRouteValidationError(`${path}.children`, "array");
    }
    children = value.children.map((child, index) =>
      parseBackendRoute(child, `${path}.children[${index}]`),
    );
  }
  return {
    path: value.path.trim(),
    ...(name === undefined ? {} : { name }),
    ...(hidden === undefined ? {} : { hidden }),
    ...(redirect === undefined ? {} : { redirect }),
    ...(component === undefined ? {} : { component }),
    ...(query === undefined ? {} : { query }),
    ...(alwaysShow === undefined ? {} : { alwaysShow }),
    ...(meta === undefined ? {} : { meta }),
    ...(children === undefined ? {} : { children }),
  };
}

export function parseBackendRoutes(value: unknown): BackendRouteDto[] {
  if (!Array.isArray(value)) {
    throw new BackendRouteValidationError("routes", "array");
  }
  return value.map((route, index) => parseBackendRoute(route, `routes[${index}]`));
}
