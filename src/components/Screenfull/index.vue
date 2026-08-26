<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import SvgIcon from "../SvgIcon.vue";
import {
  fullscreenIconName,
  isDocumentFullscreen,
  toggleDocumentFullscreen,
} from "./model";

const isFullscreen = ref(false);

function sync(): void {
  isFullscreen.value = isDocumentFullscreen(document);
}

async function toggle(): Promise<void> {
  isFullscreen.value = await toggleDocumentFullscreen(document);
}

onMounted(() => {
  sync();
  document.addEventListener("fullscreenchange", sync);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", sync);
});
</script>

<template>
  <button class="screenfull" type="button" aria-label="切换全屏" @click="toggle">
    <SvgIcon :name="fullscreenIconName(isFullscreen)" :size="18" />
  </button>
</template>

<style scoped>
.screenfull {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
}
</style>
