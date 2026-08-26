import { beforeEach, describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryStore } from "../../../src/http/cache";
import { STORE_MIGRATION_MANIFEST } from "../../../src/stores/migration-manifest";
import { createUsePermissionStore } from "../../../src/stores/modules/permission-core";
import {
  createUseTagsViewStore,
  parsePersistedTags,
  TAGS_VIEW_PERSIST_KEY,
} from "../../../src/stores/modules/tags-view";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("tags view store", () => {
  test("adds/deletes views, preserves affix tags and writes versioned persistence", () => {
    const storage = createMemoryStore();
    const store = createUseTagsViewStore({
      storage,
      isPersistenceEnabled: () => true,
    })();
    store.addAffixView({ path: "/index", name: "Index", meta: { title: "首页" } });
    store.addView({ path: "/user", name: "User", meta: { title: "用户" } });
    store.addView({
      path: "/notice",
      name: "Notice",
      meta: { title: "公告", noCache: true },
    });
    expect(store.visitedViews.map((view) => view.path)).toEqual(["/index", "/user", "/notice"]);
    expect(store.cachedViews).toEqual(["User"]);

    const persisted = parsePersistedTags(storage.get(TAGS_VIEW_PERSIST_KEY));
    expect(persisted.map((view) => view.path)).toEqual(["/user", "/notice"]);

    const result = store.delAllViews();
    expect(result.visitedViews.map((view) => view.path)).toEqual(["/index"]);
    expect(result.cachedViews).toEqual([]);
    expect(storage.get(TAGS_VIEW_PERSIST_KEY)).toBeNull();
  });

  test("restores valid persisted views and ignores damaged JSON", () => {
    const storage = createMemoryStore();
    storage.set(
      TAGS_VIEW_PERSIST_KEY,
      JSON.stringify({
        version: 1,
        visitedViews: [{ path: "/job", name: "Job", title: "任务", meta: {} }],
      }),
    );
    const store = createUseTagsViewStore({
      storage,
      isPersistenceEnabled: () => true,
    })();
    expect(store.loadPersistedViews().map((view) => view.path)).toEqual(["/job"]);
    expect(store.cachedViews).toEqual(["Job"]);

    setActivePinia(createPinia());
    storage.set(TAGS_VIEW_PERSIST_KEY, "{broken");
    const damaged = createUseTagsViewStore({
      storage,
      isPersistenceEnabled: () => true,
    })();
    expect(damaged.loadPersistedViews()).toEqual([]);
  });

  test("deletes left/right tags without removing affix views", () => {
    const store = createUseTagsViewStore({
      storage: createMemoryStore(),
      isPersistenceEnabled: () => false,
    })();
    store.addAffixView({ path: "/index", name: "Index", meta: { title: "首页" } });
    store.addView({ path: "/a", name: "A", meta: {} });
    store.addView({ path: "/b", name: "B", meta: {} });
    store.addView({ path: "/c", name: "C", meta: {} });
    expect(store.delRightTags({ path: "/b" }).map((view) => view.path)).toEqual(["/index", "/a", "/b"]);
    expect(store.delLeftTags({ path: "/b" }).map((view) => view.path)).toEqual(["/index", "/b"]);
  });
});

describe("permission store", () => {
  test("updates route collections without Router side effects", () => {
    const constantRoutes = [{ path: "/login", meta: { title: "登录" } }];
    const dynamic = [{ path: "/system", children: [{ path: "user" }] }];
    const store = createUsePermissionStore({
      constantRoutes,
      protectedRoutes: [],
      loadBackendRoutes: async () => [],
    })();
    store.setRoutes(dynamic);
    store.setSidebarRouters(dynamic);
    store.setTopbarRoutes(dynamic);
    store.setDefaultRoutes(dynamic);
    dynamic[0]!.path = "/mutated-outside";

    expect(store.routes.map((route) => route.path)).toEqual(["/login", "/system"]);
    expect(store.addRoutes[0]?.children?.[0]?.path).toBe("user");
    expect(store.sidebarRouters.map((route) => route.path)).toEqual(["/login", "/system"]);
    expect(store.topbarRouters[0]?.path).toBe("/system");
    expect(store.defaultRoutes.map((route) => route.path)).toEqual(["/login", "/system"]);
    expect(store.status).toBe("loaded");

    store.resetRoutes();
    expect(store.routes.map((route) => route.path)).toEqual(["/login"]);
    expect(store.status).toBe("idle");
  });
});

describe("store migration manifest", () => {
  test("tracks all seven legacy stores as migrated", async () => {
    expect(STORE_MIGRATION_MANIFEST).toHaveLength(7);
    for (const record of STORE_MIGRATION_MANIFEST) {
      expect(await Bun.file(record.source).exists()).toBe(true);
      expect(await Bun.file(record.target).exists()).toBe(true);
    }
    expect(STORE_MIGRATION_MANIFEST.every((record) => record.status === "migrated")).toBe(true);
  });

  test("keeps the declared store dependency graph acyclic", () => {
    const dependencies = new Map(
      STORE_MIGRATION_MANIFEST.map((record) => [
        record.target.split("/").at(-1)?.replace(".ts", "") ?? "",
        [...record.dependsOn],
      ]),
    );
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function visit(name: string): void {
      if (visiting.has(name)) throw new Error(`store dependency cycle at ${name}`);
      if (visited.has(name)) return;
      visiting.add(name);
      for (const dependency of dependencies.get(name) ?? []) visit(dependency);
      visiting.delete(name);
      visited.add(name);
    }
    for (const name of dependencies.keys()) visit(name);
    expect(visited.size).toBe(7);
  });
});
