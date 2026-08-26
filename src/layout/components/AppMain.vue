<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { RouterView, useRoute } from "vue-router";
import { useSettingsStore } from "../../stores/modules/settings";
import { useTagsViewStore } from "../../stores/modules/tags-view";
import { normalizeKeepAliveNames, routeToTagView } from "../model";
import IframeToggle from "./IframeToggle.vue";

const route = useRoute();
const settingsStore = useSettingsStore();
const tagsStore = useTagsViewStore();
const keepAliveNames = computed(() =>
  normalizeKeepAliveNames(tagsStore.cachedViews),
);

watchEffect(() => {
  if (!route.meta.link) return;
  const view = routeToTagView(route);
  if (view) tagsStore.addIframeView(view);
});
</script>

<template>
  <main class="app-main">
    <RouterView v-slot="{ Component, route: currentRoute }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="keepAliveNames">
          <component
            :is="Component"
            v-if="!currentRoute.meta.link"
            :key="currentRoute.path"
          />
        </keep-alive>
      </transition>
    </RouterView>
    <IframeToggle />
    <footer v-if="settingsStore.footerVisible" class="app-main__footer">
      {{ settingsStore.footerContent }}
    </footer>
  </main>
</template>

<style scoped>
.app-main {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: var(--app-bg);
}

.app-main__footer {
  padding: 22px 0 4px;
  color: var(--app-text-muted);
  font-size: 12px;
  text-align: center;
}
</style>
