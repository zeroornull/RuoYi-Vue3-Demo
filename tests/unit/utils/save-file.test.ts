import { describe, expect, test } from "bun:test";

const adapterFiles = ["src/utils/save-file.ts", "src/router/progress.ts"] as const;
const callers = [
  "src/http/index.ts",
  "src/views/tool/gen/index.vue",
  "src/views/tool/build/index.vue",
  "src/router/index.ts",
] as const;

describe("download and progress adapters", () => {
  test("keeps file-saver and nprogress behind typed adapters", async () => {
    const adapterSources = await Promise.all(adapterFiles.map((file) => Bun.file(file).text()));
    expect(adapterSources[0]).toContain('from "file-saver"');
    expect(adapterSources[0]).toContain("export function saveFile");
    expect(adapterSources[1]).toContain('from "nprogress"');
    expect(adapterSources[1]).toContain("navigationProgress");

    const callerSources = await Promise.all(callers.map((file) => Bun.file(file).text()));
    for (const source of callerSources) {
      expect(source).not.toContain('from "file-saver"');
      expect(source).not.toContain('from "nprogress"');
    }
    expect(callerSources[0]).toContain("saveFile");
    expect(callerSources[1]).toContain("saveFile");
    expect(callerSources[2]).toContain("saveFile");
    expect(callerSources[3]).toContain("navigationProgress");
  });
});
