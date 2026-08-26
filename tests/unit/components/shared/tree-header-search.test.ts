import { describe, expect, test } from "bun:test";
import { GLOBAL_SHARED_COMPONENT_NAMES } from "../../../../src/bootstrap/global-component-names";
import {
  createHeaderSearchIndex,
  generateSearchRoutes,
  highlightText,
  nextActiveIndex,
  parseBackendQuery,
  searchHeaderItems,
} from "../../../../src/components/HeaderSearch/model";
import {
  clampTreeWidth,
  collectNodeKeys,
  defaultTreeFilter,
  emptyTreeData,
  readStoredWidth,
} from "../../../../src/components/TreePanel/model";
import { resolveBackendComponent } from "../../../../src/router/component-resolver";
import { RouterShell } from "../../../../src/router/components/router-shell";

describe("TreePanel selection helpers", () => {
  test("filters, clamps width and treats empty nodes as empty", () => {
    expect(defaultTreeFilter("", { label: "研发" })).toBe(true);
    expect(defaultTreeFilter("研", { label: "研发" })).toBe(true);
    expect(defaultTreeFilter("销售", { label: "研发" })).toBe(false);
    expect(clampTreeWidth(100, 180, 400)).toBe(180);
    expect(readStoredWidth("220", 180, 400)).toBe(220);
    expect(readStoredWidth("nope", 180, 400)).toBeNull();
    expect(emptyTreeData([])).toBe(true);
    expect(
      collectNodeKeys(
        [
          {
            id: 1,
            label: "root",
            children: [{ id: 2, label: "child" }],
          },
        ],
        "id",
      ),
    ).toEqual([1, 2]);
  });
});

describe("HeaderSearch menu pool", () => {
  test("indexes visible routes, searches and highlights safely", () => {
    const pool = generateSearchRoutes([
      {
        path: "/system",
        hidden: false,
        meta: { title: "系统管理", icon: "system" },
        children: [
          {
            path: "user",
            meta: { title: "用户管理", icon: "user" },
            backendQuery: '{"dept":"1"}',
          },
          { path: "hidden", hidden: true, meta: { title: "隐藏" } },
        ],
      },
    ]);
    expect(pool.map((item) => item.path)).toEqual(["/system", "/system/user"]);
    expect(pool[1]?.query).toBe('{"dept":"1"}');
    const fuse = createHeaderSearchIndex(pool);
    expect(searchHeaderItems(pool, fuse, "用户")[0]?.path).toBe("/system/user");
    expect(searchHeaderItems(pool, fuse, "/system/user")[0]?.path).toBe(
      "/system/user",
    );
    expect(highlightText("用户管理", "用户")).toContain("class=\"highlight\"");
    expect(highlightText("<script>", "<")).not.toContain("<script>");
    expect(nextActiveIndex(-1, 2, "down")).toBe(0);
    expect(parseBackendQuery('{"dept":"1"}')).toEqual({ dept: "1" });
    expect(parseBackendQuery("{")).toBeUndefined();
  });
});

describe("shared component registration boundary", () => {
  test("registers only high-value globals and maps ParentView", () => {
    expect([...GLOBAL_SHARED_COMPONENT_NAMES]).toEqual([
      "SvgIcon",
      "DictTag",
      "Pagination",
      "RightToolbar",
      "ImagePreview",
      "FileUpload",
      "ImageUpload",
      "Editor",
    ]);
    const parentView = resolveBackendComponent({
      component: "ParentView",
      hasChildren: true,
      link: null,
      hasRedirect: false,
    }).component;
    expect(parentView).not.toBe(RouterShell);
    expect(typeof parentView).toBe("function");
  });
});
