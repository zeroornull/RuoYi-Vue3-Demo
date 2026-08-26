import { defineStore } from "pinia";
import { ref } from "vue";
import type { DictItem } from "../../types/dict";

export type DictEntry = {
  key: string;
  value: DictItem[];
};

export const useDictStore = defineStore("dict", () => {
  const entries = ref<DictEntry[]>([]);

  function getDict(key: string | null | undefined): DictItem[] | null {
    if (!key) return null;
    return entries.value.find((entry) => entry.key === key)?.value ?? null;
  }

  function setDict(key: string | null | undefined, value: DictItem[]): void {
    if (!key) return;
    const entry = entries.value.find((candidate) => candidate.key === key);
    if (entry) {
      entry.value = [...value];
      return;
    }
    entries.value.push({ key, value: [...value] });
  }

  function removeDict(key: string | null | undefined): boolean {
    if (!key) return false;
    const index = entries.value.findIndex((entry) => entry.key === key);
    if (index < 0) return false;
    entries.value.splice(index, 1);
    return true;
  }

  function cleanDict(): void {
    entries.value = [];
  }

  function initDict(): void {
    cleanDict();
  }

  return { entries, getDict, setDict, removeDict, cleanDict, initDict };
});

export default useDictStore;
