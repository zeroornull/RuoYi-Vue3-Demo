import { parseUser } from "./01-unknown.ts";
// @ts-expect-error verbatimModuleSyntax：类型别名 User 必须用 import type，不能当值导入
import { User } from "./01-unknown.ts";
import type { User as UserDto } from "./01-unknown.ts";

export type EntityId = string;

export type BackendRouteDto = {
  path: string;
  name?: string;
  component?: string;
  hidden?: boolean;
  children?: BackendRouteDto[];
};

export function walkRoutes(routes: BackendRouteDto[], visit: (route: BackendRouteDto) => void): void {
  for (const route of routes) {
    visit(route);
    const children = route.children;
    if (children) {
      walkRoutes(children, visit);
    }
  }
}

export const menuTree = [
  {
    path: "/system",
    name: "System",
    children: [{ path: "user", name: "User", component: "system/user/index" }],
  },
] as const satisfies readonly BackendRouteDto[];

export const names: string[] = [];
walkRoutes([...menuTree], (route) => {
  if (route.name) {
    names.push(route.name);
  }
});

export const invalidTree: BackendRouteDto = {
  path: "/system",
  // @ts-expect-error 递归 children 必须是路由节点，不能是字符串路径
  children: ["user"],
};

export type UserRow = {
  userId: EntityId;
  userName: string;
};

export const rowFromParser: UserRow = parseUser({
  userId: "18446744073709551615",
  userName: "admin",
});

export function labelUser(user: UserDto): string {
  return user.userName;
}

export const labeled = labelUser(rowFromParser);

export type ImportedUser = User;
