import type { RepeatSubmitRecord } from "../types/http";
import { isRecord } from "../utils/guard";

export type CacheStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export type JsonCache = {
  getJSON(key: string): unknown;
  setJSON(key: string, value: unknown): void;
  remove(key: string): void;
};

export function parseCacheJson(raw: string | null): unknown {
  if (raw == null) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function createJsonCache(store: CacheStore): JsonCache {
  return {
    getJSON(key) {
      return parseCacheJson(store.get(key));
    },
    setJSON(key, value) {
      if (value != null) {
        store.set(key, JSON.stringify(value));
      }
    },
    remove(key) {
      store.remove(key);
    },
  };
}

export function createMemoryStore(): CacheStore {
  const data = new Map<string, string>();
  return {
    get(key) {
      return data.get(key) ?? null;
    },
    set(key, value) {
      data.set(key, value);
    },
    remove(key) {
      data.delete(key);
    },
  };
}

export function createWebStore(storage: Storage): CacheStore {
  return {
    get(key) {
      return storage.getItem(key);
    },
    set(key, value) {
      storage.setItem(key, value);
    },
    remove(key) {
      storage.removeItem(key);
    },
  };
}

export function isRepeatSubmitRecord(value: unknown): value is RepeatSubmitRecord {
  return (
    isRecord(value) && typeof value.url === "string" && typeof value.data === "string" && typeof value.time === "number"
  );
}

export const sessionCache = createJsonCache(
  typeof sessionStorage === "undefined" ? createMemoryStore() : createWebStore(sessionStorage),
);

export const localCache = createJsonCache(
  typeof localStorage === "undefined" ? createMemoryStore() : createWebStore(localStorage),
);
