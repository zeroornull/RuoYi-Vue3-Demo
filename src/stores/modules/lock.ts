import { defineStore } from "pinia";
import { ref } from "vue";
import { isRecord } from "../../utils/guard";
import {
  browserLocalStore,
  readStoredJson,
  writeStoredJson,
  type StoreStorage,
} from "../persistence";

export const LOCK_STATE_KEY = "screen-lock-state";
const LEGACY_LOCK_KEY = "screen-lock";
const LEGACY_LOCK_PATH_KEY = "screen-lock-path";
const LOCK_STATE_VERSION = 1;
const DEFAULT_LOCK_PATH = "/index";

export type LockState = {
  isLock: boolean;
  lockPath: string;
};

export function parseLockState(value: unknown): LockState | null {
  if (!isRecord(value) || value.version !== LOCK_STATE_VERSION) return null;
  if (typeof value.isLock !== "boolean" || typeof value.lockPath !== "string") {
    return null;
  }
  return {
    isLock: value.isLock,
    lockPath: value.lockPath.startsWith("/") ? value.lockPath : DEFAULT_LOCK_PATH,
  };
}

function loadInitialState(storage: StoreStorage): LockState {
  const current = parseLockState(readStoredJson(storage, LOCK_STATE_KEY));
  if (current) return current;
  const legacyLock = storage.get(LEGACY_LOCK_KEY);
  const legacyPath = storage.get(LEGACY_LOCK_PATH_KEY);
  return {
    isLock: legacyLock === "true",
    lockPath:
      typeof legacyPath === "string" && legacyPath.startsWith("/")
        ? legacyPath
        : DEFAULT_LOCK_PATH,
  };
}

export function createUseLockStore(storage: StoreStorage = browserLocalStore) {
  return defineStore("lock", () => {
    const initial = loadInitialState(storage);
    const isLock = ref(initial.isLock);
    const lockPath = ref(initial.lockPath);

    function persist(): void {
      writeStoredJson(storage, LOCK_STATE_KEY, {
        version: LOCK_STATE_VERSION,
        isLock: isLock.value,
        lockPath: lockPath.value,
      });
      storage.remove(LEGACY_LOCK_KEY);
      storage.remove(LEGACY_LOCK_PATH_KEY);
    }

    function lockScreen(currentPath?: string): void {
      lockPath.value = currentPath?.startsWith("/") ? currentPath : DEFAULT_LOCK_PATH;
      isLock.value = true;
      persist();
    }

    function unlockScreen(): void {
      isLock.value = false;
      lockPath.value = DEFAULT_LOCK_PATH;
      persist();
    }

    return { isLock, lockPath, lockScreen, unlockScreen };
  });
}

export const useLockStore = createUseLockStore();
export default useLockStore;
