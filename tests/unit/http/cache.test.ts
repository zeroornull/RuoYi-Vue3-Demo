import { describe, expect, test } from "bun:test";
import { createJsonCache, createMemoryStore, parseCacheJson } from "../../../src/http/cache";

describe("cache json boundary", () => {
  test("getJSON returns null for missing and invalid JSON", () => {
    const cache = createJsonCache(createMemoryStore());
    expect(cache.getJSON("missing")).toBeNull();
    const store = createMemoryStore();
    store.set("broken", "{not json");
    const broken = createJsonCache(store);
    expect(broken.getJSON("broken")).toBeNull();
    expect(parseCacheJson("{not json")).toBeNull();
  });

  test("round-trips a json value", () => {
    const cache = createJsonCache(createMemoryStore());
    cache.setJSON("sessionObj", { url: "/a", data: "{}", time: 1 });
    expect(cache.getJSON("sessionObj")).toEqual({
      url: "/a",
      data: "{}",
      time: 1,
    });
  });
});
