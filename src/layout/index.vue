<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAppStore } from "../stores/modules/app";
import { useSettingsStore } from "../stores/modules/settings";
import { applyThemeVariables } from "./theme";
import { resolveLayoutDevice } from "./model";
import AppMain from "./components/AppMain.vue";
import Navbar from "./components/Navbar.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import Sidebar from "./components/Sidebar.vue";
import TagsView from "./components/TagsView.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const settingsRef = ref<InstanceType<typeof SettingsPanel> | null>(null);

const showSidebar = computed(() => !appStore.sidebar.hide && settingsStore.navType !== 3);
const layoutClasses = computed(() => ({
  "is-mobile": appStore.device === "mobile",
  "is-collapsed": !appStore.sidebar.opened,
  "is-sidebar-hidden": !showSidebar.value,
  "without-animation": appStore.sidebar.withoutAnimation,
}));

function updateDevice(): void {
  const device = resolveLayoutDevice(window.innerWidth);
  appStore.toggleDevice(device);
  if (device === "mobile") {
    appStore.closeSideBar({ withoutAnimation: true });
  }
}

function closeMobileSidebar(): void {
  appStore.closeSideBar({ withoutAnimation: false });
}

function openSettings(): void {
  settingsRef.value?.openSetting();
}

watch(
  () => [settingsStore.theme, settingsStore.isDark] as const,
  ([theme, isDark]) => {
    if (typeof document !== "undefined") {
      applyThemeVariables(document.documentElement.style, theme, isDark);
    }
  },
  { immediate: true },
);

onMounted(() => {
  updateDevice();
  window.addEventListener("resize", updateDevice, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("resize", updateDevice));
</script>

<template>
  <div class="admin-layout" :class="layoutClasses">
    <button
      v-if="appStore.device === 'mobile' && appStore.sidebar.opened"
      type="button"
      class="admin-layout__overlay"
      aria-label="关闭侧栏"
      @click="closeMobileSidebar"
    />

    <div v-if="showSidebar" class="admin-layout__sidebar">
      <Sidebar />
    </div>

    <section class="admin-layout__main">
      <div class="admin-layout__header" :class="{ 'is-fixed': settingsStore.fixedHeader }">
        <Navbar @open-settings="openSettings" />
        <TagsView v-if="settingsStore.tagsView" />
      </div>
      <AppMain />
    </section>

    <SettingsPanel ref="settingsRef" />
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  width: 100%;
  height: 100vh;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  overflow: hidden;
  background: var(--app-bg);
  transition: grid-template-columns 0.28s ease;
}

.admin-layout.is-collapsed {
  grid-template-columns: var(--sidebar-collapsed-width) minmax(0, 1fr);
}

.admin-layout.is-sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

.admin-layout.without-animation {
  transition: none;
}

.admin-layout.without-animation .admin-layout__sidebar {
  transition: none;
}

.admin-layout__sidebar {
  min-width: 0;
  overflow: hidden;
}

.admin-layout__main {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
}

.admin-layout__header {
  z-index: 20;
  min-width: 0;
}

.admin-layout__header.is-fixed {
  position: sticky;
  top: 0;
}

.admin-layout__overlay {
  position: fixed;
  z-index: 90;
  inset: 0;
  background: rgb(15 23 42 / 48%);
  border: 0;
}

.admin-layout.is-mobile {
  display: block;
}

.admin-layout.is-mobile .admin-layout__sidebar {
  position: fixed;
  z-index: 100;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(82vw, var(--sidebar-width));
  box-shadow: 12px 0 28px rgb(0 0 0 / 22%);
  transform: translateX(0);
  transition: transform 0.24s ease;
}

.admin-layout.is-mobile.is-collapsed .admin-layout__sidebar {
  transform: translateX(-105%);
}

.admin-layout.is-mobile .admin-layout__main {
  height: 100vh;
}
</style>
