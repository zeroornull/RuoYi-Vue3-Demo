import { describe, expect, test } from "bun:test";
import { resolveBackendComponent } from "../../src/router/component-resolver";
import { migratedViewLoaders } from "../../src/router/view-registry";

const migrated = [
  "system/config/index",
  "system/post/index",
  "system/notice/index",
  "system/notice/ReadUsers",
  "system/dict/index",
  "system/dict/data",
  "system/dict/detail",
  "system/dept/index",
  "system/menu/index",
  "system/user/index",
  "system/user/view",
  "system/user/authRole",
] as const;

describe("16.a migrated views", () => {
  test("dynamic backend components prefer the typed view registry", () => {
    for (const component of migrated) {
      const resolved = resolveBackendComponent({
        component,
        hasChildren: false,
        link: undefined,
        hasRedirect: false,
      });
      expect(resolved.issue).toBeUndefined();
      expect(resolved.component).toBe(migratedViewLoaders[component]);
    }
  });

  test("CRUD pages keep permission directives and do not import legacy/", async () => {
    const files = [
      "src/views/system/config/index.vue",
      "src/views/system/post/index.vue",
      "src/views/system/notice/index.vue",
      "src/views/system/dict/index.vue",
      "src/views/system/dict/data.vue",
      "src/views/system/dept/index.vue",
      "src/views/system/menu/index.vue",
      "src/views/system/user/index.vue",
      "src/views/system/user/authRole.vue",
    ];
    const sources = await Promise.all(files.map((file) => Bun.file(file).text()));
    for (const source of sources) {
      expect(source).not.toContain("legacy/");
      expect(source).toContain("v-hasPermi");
    }
    expect(sources[0]).toContain("system:config:add");
    expect(sources[1]).toContain("system:post:remove");
    expect(sources[2]).toContain("system:notice:edit");
    expect(sources[3]).toContain("system:dict:export");
    expect(sources[5]).toContain("system:dept:add");
    expect(sources[6]).toContain("system:menu:edit");
    expect(sources[7]).toContain("system:user:add");
    expect(sources[8]).toContain("updateAuthRole");
  });
});
