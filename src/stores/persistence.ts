import {
  createMemoryStore,
  createWebStore,
  parseCacheJson,
  type CacheStore,
} from "../http/cache";

export type StoreStorage = CacheStore;

const localMemoryFallback = createMemoryStore();
const sessionMemoryFallback = createMemoryStore();

export const browserLocalStore: StoreStorage =
  typeof localStorage === "undefined"
    ? localMemoryFallback
    : createWebStore(localStorage);

export const browserSessionStore: StoreStorage =
  typeof sessionStorage === "undefined"
    ? sessionMemoryFallback
    : createWebStore(sessionStorage);

export function readStoredJson(storage: StoreStorage, key: string): unknown {
  return parseCacheJson(storage.get(key));
}

export function writeStoredJson(
  storage: StoreStorage,
  key: string,
  value: unknown,
): void {
  storage.set(key, JSON.stringify(value));
}
