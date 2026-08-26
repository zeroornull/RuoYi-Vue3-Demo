<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQueryRaw, type RouteLocationRaw } from "vue-router";
import SvgIcon from "../../components/SvgIcon.vue";
import { usePermissionStore } from "../../stores/modules/permission";
import { useSettingsStore } from "../../stores/modules/settings";
import { useTagsViewStore, type TagView } from "../../stores/modules/tags-view";
import { collectAffixTags, fallbackAfterClose, routeToTagView } from "../model";

type TagsCommand = "refresh" | "close" | "closeOthers" | "closeLeft" | "closeRight" | "closeAll";

const route = useRoute();
const router = useRouter();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();
const tagsStore = useTagsViewStore();
const scrollRef = ref<HTMLDivElement | null>(null);

const visitedViews = computed(() => tagsStore.visitedViews);
const activeTag = computed(() => visitedViews.value.find((tag) => tag.path === route.path));

function isActive(tag: TagView): boolean {
  return tag.path === route.path;
}

function syncCurrentRoute(): void {
  const tag = routeToTagView(route);
  if (!tag) return;
  if (tagsStore.visitedViews.some((item) => item.path === tag.path)) {
    tagsStore.updateVisitedView(tag);
  } else {
    tagsStore.addView(tag);
  }
  void nextTick(() => {
    const active = scrollRef.value?.querySelector<HTMLElement>(`[data-tag-path="${CSS.escape(tag.path)}"]`);
    active?.scrollIntoView({ inline: "nearest", block: "nearest" });
  });
}

function initializeTags(): void {
  if (settingsStore.tagsViewPersist) tagsStore.loadPersistedViews();
  for (const tag of collectAffixTags(permissionStore.routes)) {
    tagsStore.addAffixView(tag);
    tagsStore.addCachedView(tag);
  }
  syncCurrentRoute();
}

function navigateAfterClose(paths: readonly string[]): void {
  void router.push(fallbackAfterClose(paths));
}

function tagLocation(tag: TagView): RouteLocationRaw {
  if (!tag.query) return { path: tag.path };
  const query: LocationQueryRaw = {};
  for (const [key, item] of Object.entries(tag.query)) {
    query[key] = Array.isArray(item) ? item.map((entry) => entry ?? "") : item;
  }
  return { path: tag.path, query };
}

function closeTag(tag: TagView): void {
  const wasActive = isActive(tag);
  const result = tagsStore.delView(tag);
  if (wasActive) {
    navigateAfterClose(result.visitedViews.map((item) => item.fullPath ?? item.path));
  }
}

function closeOthers(tag: TagView): void {
  tagsStore.delOthersViews(tag);
  void router.push(tagLocation(tag));
}

function closeLeft(tag: TagView): void {
  const remaining = tagsStore.delLeftTags(tag);
  if (!remaining.some((item) => item.path === route.path)) {
    navigateAfterClose(remaining.map((item) => item.fullPath ?? item.path));
  }
}

function closeRight(tag: TagView): void {
  const remaining = tagsStore.delRightTags(tag);
  if (!remaining.some((item) => item.path === route.path)) {
    navigateAfterClose(remaining.map((item) => item.fullPath ?? item.path));
  }
}

function closeAll(): void {
  const result = tagsStore.delAllViews();
  if (!result.visitedViews.some((item) => item.path === route.path)) {
    navigateAfterClose(result.visitedViews.map((item) => item.fullPath ?? item.path));
  }
}

function refresh(): void {
  void router.replace({ path: `/redirect${route.path}`, query: route.query });
}

function handleCommand(command: TagsCommand): void {
  const tag = activeTag.value;
  if (command === "refresh") return refresh();
  if (command === "closeAll") return closeAll();
  if (!tag) return;
  if (command === "close" && !tag.meta.affix) closeTag(tag);
  if (command === "closeOthers") closeOthers(tag);
  if (command === "closeLeft") closeLeft(tag);
  if (command === "closeRight") closeRight(tag);
}

function scrollBy(delta: number): void {
  scrollRef.value?.scrollBy({ left: delta, behavior: "smooth" });
}

watch(() => route.fullPath, syncCurrentRoute);
onMounted(initializeTags);
</script>

<template>
  <div class="tags-view" :class="`tags-view--${settingsStore.tagsViewStyle}`">
    <button class="tags-view__nav" type="button" aria-label="向左滚动" @click="scrollBy(-240)">
      <SvgIcon name="arrow-left" :size="13" />
    </button>
    <div ref="scrollRef" class="tags-view__scroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-tag-path="tag.path"
        :to="tagLocation(tag)"
        class="tags-view__item"
        :class="{ 'is-active': isActive(tag) }"
        :style="
          isActive(tag) && settingsStore.tagsViewStyle === 'card'
            ? { backgroundColor: settingsStore.theme, borderColor: settingsStore.theme }
            : undefined
        "
        @click.middle.prevent="!tag.meta.affix && closeTag(tag)"
      >
        <SvgIcon v-if="settingsStore.tagsIcon && tag.meta.icon" :name="tag.meta.icon" :size="13" />
        <span>{{ tag.title }}</span>
        <button
          v-if="!tag.meta.affix"
          type="button"
          class="tags-view__close"
          aria-label="关闭标签"
          @click.prevent.stop="closeTag(tag)"
        >
          <SvgIcon name="close" :size="11" />
        </button>
      </router-link>
    </div>
    <button class="tags-view__nav" type="button" aria-label="向右滚动" @click="scrollBy(240)">
      <SvgIcon name="arrow-right" :size="13" />
    </button>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="tags-view__action" type="button" aria-label="标签操作">
        <SvgIcon name="more" :size="16" />
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">刷新当前</el-dropdown-item>
          <el-dropdown-item command="close" :disabled="activeTag?.meta.affix">关闭当前</el-dropdown-item>
          <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeLeft">关闭左侧</el-dropdown-item>
          <el-dropdown-item command="closeRight">关闭右侧</el-dropdown-item>
          <el-dropdown-item divided command="closeAll">全部关闭</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.tags-view {
  display: flex;
  height: var(--tags-height);
  align-items: center;
  overflow: hidden;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.tags-view__scroll {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 5px;
  padding: 0 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tags-view__scroll::-webkit-scrollbar {
  display: none;
}

.tags-view__item {
  display: inline-flex;
  height: 26px;
  flex: none;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  color: var(--app-text-muted);
  font-size: 12px;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: 3px;
}

.tags-view__item.is-active {
  color: #fff;
}

.tags-view--chrome .tags-view__item {
  padding-inline: 12px;
  border-radius: 10px 10px 2px 2px;
}

.tags-view--chrome .tags-view__item.is-active {
  color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-primary) 38%, var(--app-border));
}

.tags-view__close,
.tags-view__nav,
.tags-view__action {
  display: inline-flex;
  height: 100%;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.tags-view__close {
  width: 16px;
  height: 16px;
  padding: 0;
  border-radius: 50%;
}

.tags-view__close:hover {
  color: #fff;
  background: rgb(0 0 0 / 22%);
}

.tags-view__nav,
.tags-view__action {
  width: 30px;
  border-inline: 1px solid var(--app-border);
}
</style>
