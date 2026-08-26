import { describe, expect, test } from "bun:test";
import { canAccessRoute, filterRoutesByAccess } from "../../../src/router/access";
import { BackendRouteValidationError, parseBackendRoutes } from "../../../src/router/backend-dto";
import { resolveBackendComponent } from "../../../src/router/component-resolver";
import { transformBackendRoutes } from "../../../src/router/transform";

describe("backend route DTO boundary", () => {
  test("parses nested routes, empty children, redirect and external link", () => {
    const routes = parseBackendRoutes([
      {
        path: "/system",
        name: "System",
        component: "Layout",
        meta: { title: "系统管理", breadcrumb: true },
        children: [
          {
            path: "user",
            name: "UserList",
            component: "system/user/index",
            children: [],
          },
        ],
      },
      {
        path: "/docs",
        redirect: "/index",
        meta: { link: "https://example.invalid/docs" },
      },
    ]);
    expect(routes[0]?.children?.[0]?.path).toBe("user");
    expect(routes[0]?.meta?.breadcrumb).toBe(true);
    expect(routes[1]?.redirect).toBe("/index");
    expect(routes[1]?.meta?.link).toBe("https://example.invalid/docs");
  });

  test("allows missing name/meta but rejects missing path and malformed fields", () => {
    expect(parseBackendRoutes([{ path: "/unnamed" }])).toEqual([{ path: "/unnamed" }]);
    for (const value of [
      [{}],
      [{ path: "" }],
      [{ path: "/a", name: 7 }],
      [{ path: "/a", meta: "bad" }],
      [{ path: "/a", children: {} }],
    ]) {
      expect(() => parseBackendRoutes(value)).toThrow(BackendRouteValidationError);
    }
  });
});

describe("backend route transformer", () => {
  test("transforms single and multi-level children without mutating DTOs", () => {
    const input = parseBackendRoutes([
      {
        path: "/system",
        name: "System",
        component: "Layout",
        children: [
          {
            path: "user",
            name: "UserList",
            component: "system/user/index",
            meta: { title: "用户管理", noCache: false },
          },
        ],
      },
    ]);
    const before = JSON.stringify(input);
    const result = transformBackendRoutes(input);
    expect(result.issues).toEqual([]);
    expect(result.routes[0]?.name).toBe("System");
    expect(result.routes[0]?.children?.[0]?.meta?.title).toBe("用户管理");
    expect(result.routes[0]?.children?.[0]?.component).toBeFunction();
    expect(JSON.stringify(input)).toBe(before);
  });

  test("preserves redirect/query and handles empty leaf components safely", () => {
    const result = transformBackendRoutes(
      parseBackendRoutes([
        {
          path: "/redirect-only",
          redirect: "/index",
          query: '{"source":"menu"}',
          children: [],
        },
        { path: "/missing-component", name: "Missing" },
      ]),
    );
    expect(result.routes[0]?.redirect).toBe("/index");
    expect(result.routes[0]?.backendQuery).toBe('{"source":"menu"}');
    expect(result.issues).toEqual([
      {
        routePath: "/missing-component",
        code: "missing-component",
        detail: "Leaf route has no component",
      },
    ]);
    expect(result.routes[1]?.meta?.componentError).toContain("missing-component");
  });

  test("never executes an unknown or malicious component import path", async () => {
    const resolution = resolveBackendComponent({
      component: "../../../../etc/passwd",
      hasChildren: false,
      link: undefined,
      hasRedirect: false,
    });
    expect(resolution.issue).toEqual({
      code: "unknown-component",
      detail: "../../../../etc/passwd",
    });
    expect(resolution.component).toBeFunction();
    if (typeof resolution.component === "function") {
      const fallback = await resolution.component();
      expect("name" in fallback ? fallback.name : undefined).toBe("UnknownComponentPage");
    }
  });

  test("rejects duplicate backend route names", () => {
    expect(() =>
      transformBackendRoutes(
        parseBackendRoutes([
          { path: "/a", name: "Duplicate", component: "system/user/index" },
          { path: "/b", name: "Duplicate", component: "system/role/index" },
        ]),
      ),
    ).toThrow("Duplicate route name: Duplicate");
  });
});

describe("roles and permissions filtering", () => {
  const guarded = {
    path: "/guarded",
    name: "Guarded",
    redirect: "/index",
    roles: ["manager"],
    permissions: ["system:user:list"],
  };

  test("requires both role and permission when both are declared", () => {
    expect(
      canAccessRoute(guarded, {
        roles: ["manager"],
        permissions: ["other"],
      }),
    ).toBe(false);
    expect(
      canAccessRoute(guarded, {
        roles: ["other"],
        permissions: ["system:user:list"],
      }),
    ).toBe(false);
    expect(
      canAccessRoute(guarded, {
        roles: ["manager"],
        permissions: ["system:user:list"],
      }),
    ).toBe(true);
  });

  test("supports admin/all-permission wildcards and removes empty parents", () => {
    expect(
      canAccessRoute(guarded, {
        roles: ["admin"],
        permissions: ["*:*:*"],
      }),
    ).toBe(true);
    const filtered = filterRoutesByAccess(
      [
        {
          path: "/parent",
          name: "Parent",
          redirect: "/index",
          children: [guarded],
        },
      ],
      { roles: [], permissions: [] },
    );
    expect(filtered).toEqual([]);
  });
});
