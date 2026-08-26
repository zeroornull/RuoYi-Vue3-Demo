<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTagsViewStore } from "../../stores/modules/tags-view";
import { sanitizeIframeUrl } from "../model";

const route = useRoute();
const tagsStore = useTagsViewStore();
const frames = computed(() =>
  tagsStore.iframeViews
    .map((view) => ({ view, url: sanitizeIframeUrl(view.meta.link) }))
    .filter((item): item is { view: typeof item.view; url: string } =>
      item.url !== null,
    ),
);
</script>

<template>
  <div v-if="frames.length" class="iframe-toggle">
    <iframe
      v-for="frame in frames"
      v-show="frame.view.path === route.path"
      :key="frame.view.path"
      :src="frame.url"
      :title="frame.view.title"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>

<style scoped>
.iframe-toggle,
.iframe-toggle iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
