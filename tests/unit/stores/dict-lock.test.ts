import { beforeEach, describe, expect, test } from "bun:test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryStore } from "../../../src/http/cache";
import { useDictStore } from "../../../src/stores/modules/dict";
import { createUseLockStore, LOCK_STATE_KEY, parseLockState } from "../../../src/stores/modules/lock";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("dict store", () => {
  test("sets, replaces, removes and clears typed dictionary values", () => {
    const store = useDictStore();
    store.setDict("sys_status", [{ label: "正常", value: "0" }]);
    expect(store.getDict("sys_status")).toEqual([{ label: "正常", value: "0" }]);

    store.setDict("sys_status", [{ label: "停用", value: "1" }]);
    expect(store.entries).toHaveLength(1);
    expect(store.getDict("sys_status")?.[0]?.value).toBe("1");
    expect(store.removeDict("missing")).toBe(false);
    expect(store.removeDict("sys_status")).toBe(true);
    expect(store.getDict("sys_status")).toBeNull();

    store.setDict("another", []);
    store.cleanDict();
    expect(store.entries).toEqual([]);
  });
});

describe("lock store", () => {
  test("migrates legacy state and persists lock/unlock as a versioned object", () => {
    const storage = createMemoryStore();
    storage.set("screen-lock", "true");
    storage.set("screen-lock-path", "/system/user");
    const store = createUseLockStore(storage)();
    expect(store.isLock).toBe(true);
    expect(store.lockPath).toBe("/system/user");

    store.unlockScreen();
    expect(store.isLock).toBe(false);
    expect(store.lockPath).toBe("/index");
    expect(storage.get("screen-lock")).toBeNull();

    store.lockScreen("/monitor/job");
    const raw = storage.get(LOCK_STATE_KEY);
    expect(raw).not.toBeNull();
    const persisted = parseLockState(JSON.parse(raw ?? "null") as unknown);
    expect(persisted).toEqual({ isLock: true, lockPath: "/monitor/job" });
  });

  test("recovers defaults from malformed persisted input", () => {
    const storage = createMemoryStore();
    storage.set(LOCK_STATE_KEY, '{"version":1,"isLock":"yes","lockPath":7}');
    const store = createUseLockStore(storage)();
    expect(store.isLock).toBe(false);
    expect(store.lockPath).toBe("/index");
  });
});
