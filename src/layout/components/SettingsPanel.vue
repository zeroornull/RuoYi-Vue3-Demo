<script setup lang="ts">
import { ref } from "vue";
import type { NavigationType } from "../../stores/modules/settings";
import { useSettingsStore } from "../../stores/modules/settings";
import { useAppStore } from "../../stores/modules/app";
import { useTagsViewStore } from "../../stores/modules/tags-view";

const open = ref(false);
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const tagsStore = useTagsViewStore();

function openSetting(): void {
  open.value = true;
}

function checked(event: Event): boolean {
  return event.target instanceof HTMLInputElement && event.target.checked;
}

function value(event: Event): string {
  return event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement
    ? event.target.value
    : "";
}

function changeNavType(event: Event): void {
  const parsed = Number(value(event));
  if (parsed !== 1 && parsed !== 2 && parsed !== 3) return;
  const navType: NavigationType = parsed;
  settingsStore.changeSetting({ key: "navType", value: navType });
  appStore.toggleSideBarHide(navType === 3);
  if (navType === 3) {
    appStore.closeSideBar({ withoutAnimation: true });
  }
}

function changeTheme(event: Event): void {
  settingsStore.changeSetting({ key: "theme", value: value(event) });
}

function changeSideTheme(event: Event): void {
  const next = value(event);
  if (next !== "theme-dark" && next !== "theme-light") return;
  settingsStore.changeSetting({ key: "sideTheme", value: next });
}

function changeTagsStyle(event: Event): void {
  const next = value(event);
  if (next !== "card" && next !== "chrome") return;
  settingsStore.changeSetting({ key: "tagsViewStyle", value: next });
}

function toggleTagsPersist(event: Event): void {
  const enabled = checked(event);
  settingsStore.changeSetting({ key: "tagsViewPersist", value: enabled });
  if (!enabled) tagsStore.clearPersistedViews();
}

function reset(): void {
  settingsStore.restoreDefaults();
  appStore.toggleSideBarHide(false);
  tagsStore.clearPersistedViews();
}

defineExpose({ openSetting });
</script>

<template>
  <el-drawer v-model="open" title="布局设置" size="320px" append-to-body>
    <div class="settings-panel">
      <label class="settings-panel__row">
        <span>主题色</span>
        <input type="color" :value="settingsStore.theme" @input="changeTheme" />
      </label>

      <label class="settings-panel__row">
        <span>侧栏主题</span>
        <select :value="settingsStore.sideTheme" @change="changeSideTheme">
          <option value="theme-dark">深色</option>
          <option value="theme-light">浅色</option>
        </select>
      </label>

      <label class="settings-panel__row">
        <span>导航模式</span>
        <select :value="settingsStore.navType" @change="changeNavType">
          <option :value="1">左侧导航</option>
          <option :value="2">混合导航</option>
          <option :value="3">顶部导航</option>
        </select>
      </label>

      <label class="settings-panel__row">
        <span>标签样式</span>
        <select :value="settingsStore.tagsViewStyle" @change="changeTagsStyle">
          <option value="card">卡片</option>
          <option value="chrome">浏览器</option>
        </select>
      </label>

      <label class="settings-panel__row"><span>暗色模式</span><input type="checkbox" :checked="settingsStore.isDark" @change="settingsStore.changeSetting({ key: 'isDark', value: checked($event) })" /></label>
      <label class="settings-panel__row"><span>显示 TagsView</span><input type="checkbox" :checked="settingsStore.tagsView" @change="settingsStore.changeSetting({ key: 'tagsView', value: checked($event) })" /></label>
      <label class="settings-panel__row"><span>持久化 TagsView</span><input type="checkbox" :checked="settingsStore.tagsViewPersist" @change="toggleTagsPersist" /></label>
      <label class="settings-panel__row"><span>显示标签图标</span><input type="checkbox" :checked="settingsStore.tagsIcon" @change="settingsStore.changeSetting({ key: 'tagsIcon', value: checked($event) })" /></label>
      <label class="settings-panel__row"><span>固定头部</span><input type="checkbox" :checked="settingsStore.fixedHeader" @change="settingsStore.changeSetting({ key: 'fixedHeader', value: checked($event) })" /></label>
      <label class="settings-panel__row"><span>显示 Logo</span><input type="checkbox" :checked="settingsStore.sidebarLogo" @change="settingsStore.changeSetting({ key: 'sidebarLogo', value: checked($event) })" /></label>
      <label class="settings-panel__row"><span>显示页脚</span><input type="checkbox" :checked="settingsStore.footerVisible" @change="settingsStore.changeSetting({ key: 'footerVisible', value: checked($event) })" /></label>

      <button type="button" class="settings-panel__reset" @click="reset">恢复默认设置</button>
    </div>
  </el-drawer>
</template>

<style scoped>
.settings-panel {
  display: grid;
  gap: 4px;
}

.settings-panel__row {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--app-text);
  border-bottom: 1px solid var(--app-border);
}

.settings-panel select,
.settings-panel input[type="color"] {
  min-width: 112px;
  height: 30px;
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 5px;
}

.settings-panel__reset {
  height: 36px;
  margin-top: 18px;
  color: #fff;
  cursor: pointer;
  background: var(--app-primary);
  border: 0;
  border-radius: 6px;
}
</style>
