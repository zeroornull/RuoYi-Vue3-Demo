import { describe, expect, test } from "bun:test";

const roots = ["src", "vite", "scripts", ".github"] as const;

describe("legacy snapshot boundary", () => {
  test("runtime sources, scripts and CI do not mention legacy/", async () => {
    const hits: string[] = [];
    for (const root of roots) {
      const glob = new Bun.Glob(`${root}/**/*.{ts,vue,js,mjs,yml}`);
      for await (const file of glob.scan(".")) {
        const text = await Bun.file(file).text();
        if (text.includes("legacy/")) {
          hits.push(file);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
