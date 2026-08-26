import { reactive, toRefs, watch } from "vue";
import { getDicts } from "../api/system/dict/data";
import { useDictStore } from "../stores/modules/dict";
import type { DictItem } from "../types/dict";
import { dictDataToItem, FALLBACK_DICTS } from "./dict-model";

export { dictDataToItem, FALLBACK_DICTS } from "./dict-model";

export function useDict<K extends string>(
  ...keys: K[]
): { [P in K]: DictItem[] } {
  const store = useDictStore();
  const state: Record<string, DictItem[]> = reactive(
    Object.fromEntries(
      keys.map((key) => [key, store.getDict(key) ?? FALLBACK_DICTS[key] ?? []]),
    ),
  );

  async function load(key: K): Promise<void> {
    const cached = store.getDict(key);
    if (cached) {
      state[key] = cached;
      return;
    }
    try {
      const response = await getDicts(key);
      const items = (response.data ?? []).map(dictDataToItem);
      store.setDict(key, items);
      state[key] = items;
    } catch {
      state[key] = FALLBACK_DICTS[key] ?? [];
    }
  }

  for (const key of keys) {
    void load(key);
  }

  watch(
    () => store.entries,
    () => {
      for (const key of keys) {
        const cached = store.getDict(key);
        if (cached) {
          state[key] = cached;
        }
      }
    },
    { deep: true },
  );

  return toRefs(state) as unknown as { [P in K]: DictItem[] };
}
