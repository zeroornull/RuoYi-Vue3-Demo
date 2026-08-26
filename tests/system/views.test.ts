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
  "system/role/index",
  "system/role/authUser",
  "system/role/selectUser",
  "monitor/online/index",
  "monitor/logininfor/index",
  "monitor/operlog/index",
  "monitor/operlog/detail",
  "monitor/job/index",
  "monitor/job/log",
  "monitor/job/detail",
  "monitor/cache/index",
  "monitor/cache/list",
  "monitor/server/index",
  "monitor/druid/index",
  "tool/swagger/index",
  "tool/gen/index",
  "tool/build/index",
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
      "src/views/system/role/index.vue",
      "src/views/system/role/authUser.vue",
      "src/views/system/role/selectUser.vue",
      "src/views/monitor/online/index.vue",
      "src/views/monitor/logininfor/index.vue",
      "src/views/monitor/operlog/index.vue",
      "src/views/monitor/job/index.vue",
      "src/views/monitor/job/log.vue",
      "src/views/monitor/cache/index.vue",
      "src/views/monitor/cache/list.vue",
      "src/views/monitor/server/index.vue",
      "src/views/tool/gen/index.vue",
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
    expect(sources[9]).toContain("system:role:add");
    expect(sources[10]).toContain("system:role:remove");
    expect(sources[11]).toContain("system:role:add");
    expect(sources[12]).toContain("monitor:online:forceLogout");
    expect(sources[13]).toContain("monitor:logininfor:unlock");
    expect(sources[14]).toContain("monitor:operlog:query");
    expect(sources[15]).toContain("monitor:job:add");
    expect(sources[16]).toContain("monitor:job:query");
    expect(sources[17]).toContain("monitor:cache:list");
    expect(sources[18]).toContain("monitor:cache:list");
    expect(sources[19]).toContain("monitor:server:list");
    expect(sources[20]).toContain("tool:gen:preview");
  });
});
