import type { RouteMeta } from "vue-router";
import type { BackendRouteDto } from "./backend-dto";
import { resolveBackendComponent } from "./component-resolver";
import { assertUniqueRouteNames, type AppRouteRecordRaw } from "./types";

export type RouteTransformIssue = {
  routePath: string;
  code: "missing-component" | "unknown-component";
  detail: string;
};

export type RouteTransformResult = {
  routes: AppRouteRecordRaw[];
  issues: RouteTransformIssue[];
};

function transformMeta(dto: BackendRouteDto): RouteMeta {
  return {
    ...(dto.meta ?? {}),
  };
}

function transformRoute(dto: BackendRouteDto): {
  route: AppRouteRecordRaw;
  issues: RouteTransformIssue[];
} {
  const childResults = (dto.children ?? []).map(transformRoute);
  const children = childResults.map((result) => result.route);
  const issues = childResults.flatMap((result) => result.issues);
  const hasRedirect = typeof dto.redirect === "string" && dto.redirect.length > 0;
  const resolution = resolveBackendComponent({
    component: dto.component,
    hasChildren: children.length > 0,
    link: dto.meta?.link,
    hasRedirect,
  });
  if (resolution.issue) {
    issues.push({
      routePath: dto.path,
      ...resolution.issue,
    });
  }
  const meta: RouteMeta = {
    ...transformMeta(dto),
    ...(resolution.issue ? { componentError: `${resolution.issue.code}:${resolution.issue.detail}` } : {}),
  };
  const common = {
    path: dto.path,
    ...(dto.name === undefined ? {} : { name: dto.name }),
    ...(dto.hidden === undefined ? {} : { hidden: dto.hidden }),
    ...(dto.alwaysShow === undefined ? {} : { alwaysShow: dto.alwaysShow }),
    ...(dto.query === undefined ? {} : { backendQuery: dto.query }),
    ...(Object.keys(meta).length === 0 ? {} : { meta }),
    ...(children.length === 0 ? {} : { children }),
  };
  const route: AppRouteRecordRaw =
    hasRedirect && resolution.component === undefined
      ? { ...common, redirect: dto.redirect ?? "/index" }
      : {
          ...common,
          ...(hasRedirect ? { redirect: dto.redirect ?? "/index" } : {}),
          ...(resolution.component === undefined ? {} : { component: resolution.component }),
        };
  return { route, issues };
}

export function transformBackendRoutes(dtos: readonly BackendRouteDto[]): RouteTransformResult {
  const results = dtos.map(transformRoute);
  const routes = results.map((result) => result.route);
  assertUniqueRouteNames(routes);
  return {
    routes,
    issues: results.flatMap((result) => result.issues),
  };
}
