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
  });
});
