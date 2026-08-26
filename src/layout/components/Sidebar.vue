<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appEnv } from "../../config/env";
import { useAppStore } from "../../stores/modules/app";
import { usePermissionStore } from "../../stores/modules/permission";
import { useSettingsStore } from "../../stores/modules/settings";
import { isExternal } from "../../utils/validate";
import { resolveActiveMenu, visibleMenuRoutes } from "../model";
import SidebarItem from "./SidebarItem.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const routes = computed(() => visibleMenuRoutes(permissionStore.sidebarRouters));
const activeMenu = computed(() => resolveActiveMenu({ path: route.path, meta: route.meta }));
const collapsed = computed(() => !appStore.sidebar.opened);
const menuBackground = computed(() =>
  settingsStore.sideTheme === "theme-light" && !settingsStore.isDark ? "#ffffff" : "var(--sidebar-bg)",
);
const menuText = computed(() =>
  settingsStore.sideTheme === "theme-light" && !settingsStore.isDark ? "#334155" : "var(--sidebar-text)",
);

function handleSelect(index: string): void {
  if (isExternal(index)) {
    window.open(index, "_blank", "noopener,noreferrer");
    return;
  }
  void router.push(index);
}
</script>

<template>
  <aside class="sidebar" :class="settingsStore.sideTheme">
    <div v-if="settingsStore.sidebarLogo" class="sidebar__brand">
      <span class="sidebar__mark">R</span>
      <span v-show="!collapsed" class="sidebar__title">{{ appEnv.title }}</span>
    </div>
    <el-scrollbar class="sidebar__scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        :background-color="menuBackground"
        :text-color="menuText"
        :active-text-color="settingsStore.theme"
        unique-opened
        @select="handleSelect"
      >
        <SidebarItem
          v-for="item in routes"
          :key="`${item.path}:${String(item.name ?? '')}`"
          :item="item"
          :base-path="item.path"
        />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: var(--sidebar-bg);
}

.sidebar.theme-light {
  color: #334155;
  background: var(--app-surface);
  border-right: 1px solid var(--app-border);
}

.sidebar__brand {
  display: flex;
  height: var(--navbar-height);
  flex: none;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  overflow: hidden;
  color: #fff;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
}

.theme-light .sidebar__brand {
  color: var(--app-text);
  border-bottom-color: var(--app-border);
}

.sidebar__mark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  background: var(--app-primary);
  border-radius: 8px;
}

.sidebar__title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__scroll {
  min-height: 0;
  flex: 1;
}

.sidebar :deep(.el-menu) {
  width: 100%;
  border: 0;
}

.sidebar :deep(.el-menu-item),
.sidebar :deep(.el-sub-menu__title) {
  gap: 2px;
}

.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background: var(--sidebar-hover) !important;
}
</style>
