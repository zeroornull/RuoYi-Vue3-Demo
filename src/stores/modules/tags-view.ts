import { defineStore } from "pinia";
import { ref } from "vue";
import { parseCacheJson } from "../../http/cache";
import { isRecord } from "../../utils/guard";
import { browserLocalStore, type StoreStorage } from "../persistence";
import { useSettingsStore } from "./settings";

export type TagQueryValue = string | string[] | null;
export type TagQuery = Record<string, TagQueryValue>;

export type TagViewMeta = {
  title?: string;
  noCache?: boolean;
  affix?: boolean;
  link?: string | null;
  icon?: string;
};

export type TagViewInput = {
  path: string;
  fullPath?: string;
  name?: string;
  title?: string;
  query?: TagQuery;
  meta?: TagViewMeta;
};

export type TagView = {
  path: string;
  fullPath?: string;
  name?: string;
  title: string;
  query?: TagQuery;
  meta: TagViewMeta;
};

export type TagsSnapshot = {
  visitedViews: TagView[];
  cachedViews: string[];
};

export type TagsViewStoreDeps = {
  storage: StoreStorage;
  isPersistenceEnabled: () => boolean;
};

export const TAGS_VIEW_PERSIST_KEY = "tags-view-visited";
const TAGS_VIEW_PERSIST_VERSION = 1;

const browserDeps: TagsViewStoreDeps = {
  storage: browserLocalStore,
  isPersistenceEnabled: () => useSettingsStore().tagsViewPersist,
};

function optionalString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  return typeof source[key] === "string" ? source[key] : undefined;
}

function parseMeta(value: unknown): TagViewMeta | null {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;
  const title = optionalString(value, "title");
  const icon = optionalString(value, "icon");
  const noCache = typeof value.noCache === "boolean" ? value.noCache : undefined;
  const affix = typeof value.affix === "boolean" ? value.affix : undefined;
  const link =
    value.link === null || typeof value.link === "string" ? value.link : undefined;
  return {
    ...(title === undefined ? {} : { title }),
    ...(icon === undefined ? {} : { icon }),
    ...(noCache === undefined ? {} : { noCache }),
    ...(affix === undefined ? {} : { affix }),
    ...(link === undefined ? {} : { link }),
  };
}

function parseQuery(value: unknown): TagQuery | null {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;
  const query: TagQuery = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string" || item === null) {
      query[key] = item;
      continue;
    }
    if (Array.isArray(item) && item.every((entry) => typeof entry === "string")) {
      query[key] = item;
      continue;
    }
    return null;
  }
  return query;
}

export function parsePersistedTag(value: unknown): TagView | null {
  if (!isRecord(value) || typeof value.path !== "string") return null;
  const meta = parseMeta(value.meta);
  const query = parseQuery(value.query);
  if (meta === null || query === null) return null;
  const fullPath = optionalString(value, "fullPath");
  const name = optionalString(value, "name");
  const title = optionalString(value, "title") ?? meta.title ?? "no-name";
  return {
    path: value.path,
    title,
    meta,
    ...(fullPath === undefined ? {} : { fullPath }),
    ...(name === undefined ? {} : { name }),
    ...(Object.keys(query).length === 0 ? {} : { query }),
  };
}

export function parsePersistedTags(raw: string | null): TagView[] {
  if (raw === null) return [];
  const parsed = parseCacheJson(raw);
  const source =
    isRecord(parsed) &&
    parsed.version === TAGS_VIEW_PERSIST_VERSION &&
    Array.isArray(parsed.visitedViews)
      ? parsed.visitedViews
      : Array.isArray(parsed)
        ? parsed
        : [];
  return source
    .map(parsePersistedTag)
    .filter((view): view is TagView => view !== null && !view.meta.affix);
}

function normalizeView(view: TagViewInput): TagView {
  const meta = { ...(view.meta ?? {}) };
  return {
    path: view.path,
    title: view.title ?? meta.title ?? "no-name",
    meta,
    ...(view.fullPath === undefined ? {} : { fullPath: view.fullPath }),
    ...(view.name === undefined ? {} : { name: view.name }),
    ...(view.query === undefined ? {} : { query: { ...view.query } }),
  };
}

export function createUseTagsViewStore(deps: TagsViewStoreDeps = browserDeps) {
  return defineStore("tags-view", () => {
    const visitedViews = ref<TagView[]>([]);
    const cachedViews = ref<string[]>([]);
    const iframeViews = ref<TagView[]>([]);

    function persistVisitedViews(): void {
      if (!deps.isPersistenceEnabled()) return;
      deps.storage.set(
        TAGS_VIEW_PERSIST_KEY,
        JSON.stringify({
          version: TAGS_VIEW_PERSIST_VERSION,
          visitedViews: visitedViews.value.filter((view) => !view.meta.affix),
        }),
      );
    }

    function snapshot(): TagsSnapshot {
      return {
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      };
    }

    function addVisitedView(view: TagViewInput): void {
      if (visitedViews.value.some((candidate) => candidate.path === view.path)) return;
      visitedViews.value.push(normalizeView(view));
      persistVisitedViews();
    }

    function addAffixView(view: TagViewInput): void {
      if (visitedViews.value.some((candidate) => candidate.path === view.path)) return;
      const normalized = normalizeView(view);
      normalized.meta.affix = true;
      visitedViews.value.unshift(normalized);
    }

    function addCachedView(view: TagViewInput): void {
      if (!view.name || view.meta?.noCache || cachedViews.value.includes(view.name)) return;
      cachedViews.value.push(view.name);
    }

    function addIframeView(view: TagViewInput): void {
      if (iframeViews.value.some((candidate) => candidate.path === view.path)) return;
      iframeViews.value.push(normalizeView(view));
    }

    function addView(view: TagViewInput): void {
      addVisitedView(view);
      addCachedView(view);
    }

    function delVisitedView(view: Pick<TagViewInput, "path">): TagView[] {
      visitedViews.value = visitedViews.value.filter((item) => item.path !== view.path);
      iframeViews.value = iframeViews.value.filter((item) => item.path !== view.path);
      persistVisitedViews();
      return [...visitedViews.value];
    }

    function delIframeView(view: Pick<TagViewInput, "path">): TagView[] {
      iframeViews.value = iframeViews.value.filter((item) => item.path !== view.path);
      return [...iframeViews.value];
    }

    function delCachedView(view: Pick<TagViewInput, "name">): string[] {
      if (view.name) {
        cachedViews.value = cachedViews.value.filter((name) => name !== view.name);
      }
      return [...cachedViews.value];
    }

    function delView(view: TagViewInput): TagsSnapshot {
      delVisitedView(view);
      delCachedView(view);
      return snapshot();
    }

    function delOthersVisitedViews(view: Pick<TagViewInput, "path">): TagView[] {
      visitedViews.value = visitedViews.value.filter(
        (item) => item.meta.affix || item.path === view.path,
      );
      iframeViews.value = iframeViews.value.filter((item) => item.path === view.path);
      persistVisitedViews();
      return [...visitedViews.value];
    }

    function delOthersCachedViews(view: Pick<TagViewInput, "name">): string[] {
      cachedViews.value = view.name && cachedViews.value.includes(view.name)
        ? [view.name]
        : [];
      return [...cachedViews.value];
    }

    function delOthersViews(view: TagViewInput): TagsSnapshot {
      delOthersVisitedViews(view);
      delOthersCachedViews(view);
      return snapshot();
    }

    function delAllVisitedViews(): TagView[] {
      visitedViews.value = visitedViews.value.filter((view) => view.meta.affix);
      iframeViews.value = [];
      deps.storage.remove(TAGS_VIEW_PERSIST_KEY);
      return [...visitedViews.value];
    }

    function delAllCachedViews(): string[] {
      cachedViews.value = [];
      return [];
    }

    function delAllViews(): TagsSnapshot {
      delAllVisitedViews();
      delAllCachedViews();
      return snapshot();
    }

    function updateVisitedView(view: TagViewInput): void {
      const index = visitedViews.value.findIndex((item) => item.path === view.path);
      if (index < 0) return;
      visitedViews.value[index] = normalizeView(view);
      persistVisitedViews();
    }

    function removeDiscardedView(view: TagView): void {
      if (view.name) {
        cachedViews.value = cachedViews.value.filter((name) => name !== view.name);
      }
      if (view.meta.link) {
        iframeViews.value = iframeViews.value.filter((item) => item.path !== view.path);
      }
    }

    function delRightTags(view: Pick<TagViewInput, "path">): TagView[] {
      const index = visitedViews.value.findIndex((item) => item.path === view.path);
      if (index < 0) return [...visitedViews.value];
      visitedViews.value = visitedViews.value.filter((item, itemIndex) => {
        const keep = itemIndex <= index || item.meta.affix === true;
        if (!keep) removeDiscardedView(item);
        return keep;
      });
      persistVisitedViews();
      return [...visitedViews.value];
    }

    function delLeftTags(view: Pick<TagViewInput, "path">): TagView[] {
      const index = visitedViews.value.findIndex((item) => item.path === view.path);
      if (index < 0) return [...visitedViews.value];
      visitedViews.value = visitedViews.value.filter((item, itemIndex) => {
        const keep = itemIndex >= index || item.meta.affix === true;
        if (!keep) removeDiscardedView(item);
        return keep;
      });
      persistVisitedViews();
      return [...visitedViews.value];
    }

    function loadPersistedViews(): TagView[] {
      const restored = parsePersistedTags(deps.storage.get(TAGS_VIEW_PERSIST_KEY));
      for (const view of restored) {
        if (!visitedViews.value.some((item) => item.path === view.path)) {
          visitedViews.value.push(view);
          if (view.name && !view.meta.noCache && !cachedViews.value.includes(view.name)) {
            cachedViews.value.push(view.name);
          }
        }
      }
      return [...visitedViews.value];
    }

    function clearPersistedViews(): void {
      deps.storage.remove(TAGS_VIEW_PERSIST_KEY);
    }

    return {
      visitedViews,
      cachedViews,
      iframeViews,
      addView,
      addIframeView,
      addVisitedView,
      addAffixView,
      addCachedView,
      delView,
      delVisitedView,
      delIframeView,
      delCachedView,
      delOthersViews,
      delOthersVisitedViews,
      delOthersCachedViews,
      delAllViews,
      delAllVisitedViews,
      delAllCachedViews,
      updateVisitedView,
      delRightTags,
      delLeftTags,
      loadPersistedViews,
      clearPersistedViews,
    };
  });
}

export const useTagsViewStore = createUseTagsViewStore();
export default useTagsViewStore;
