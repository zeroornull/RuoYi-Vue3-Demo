<script setup lang="ts">
import { computed } from "vue";
import { ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { appEnv } from "../../config/env";
import HeaderSearch from "../../components/HeaderSearch/index.vue";
import Screenfull from "../../components/Screenfull/index.vue";
import SvgIcon from "../../components/SvgIcon.vue";
import { ROUTE_NAMES } from "../../router/types";
import { useAppStore, type AppSize } from "../../stores/modules/app";
import { useLockStore } from "../../stores/modules/lock";
import { usePermissionStore } from "../../stores/modules/permission";
import { useSettingsStore } from "../../stores/modules/settings";
import { useUserStore } from "../../stores/modules/user";
import { visibleMenuRoutes } from "../model";

const emit = defineEmits<{ openSettings: [] }>();

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const lockStore = useLockStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();

const breadcrumbs = computed(() =>
  route.matched.filter((item) => item.meta.title).map((item) => item.meta.title),
);
const topRoutes = computed(() => visibleMenuRoutes(permissionStore.topbarRouters));

function toggleSidebar(): void {
  appStore.toggleSideBar(false);
}

function cycleSize(): void {
  const sizes: AppSize[] = ["default", "small", "large"];
  const index = sizes.indexOf(appStore.size);
  appStore.setSize(sizes[(index + 1) % sizes.length] ?? "default");
}

function lockScreen(): void {
  lockStore.lockScreen(route.fullPath);
  void router.push({ name: ROUTE_NAMES.lock });
}

async function logout(): Promise<void> {
  try {
    await ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await userStore.logOut();
    await router.replace({ name: ROUTE_NAMES.login });
  } catch {
    // Cancelled confirmations and failed API logout preserve the current session.
  }
}
</script>

<template>
  <header class="navbar">
    <button class="navbar__icon-button" type="button" aria-label="切换侧栏" @click="toggleSidebar">
      <SvgIcon :name="appStore.sidebar.opened ? 'fold' : 'menu'" :size="19" />
    </button>

    <nav v-if="settingsStore.navType === 1" class="navbar__breadcrumbs" aria-label="面包屑">
      <span v-for="(title, index) in breadcrumbs" :key="`${title}:${index}`">
        <span v-if="index > 0" class="navbar__separator">/</span>
        {{ title }}
      </span>
    </nav>

    <nav v-else class="navbar__topnav" aria-label="顶部导航">
      <strong v-if="settingsStore.navType === 3" class="navbar__app-title">{{ appEnv.title }}</strong>
      <router-link
        v-for="item in topRoutes.slice(0, 6)"
        :key="item.path"
        :to="item.path"
        class="navbar__topnav-link"
      >
        {{ item.meta?.title || item.name || item.path }}
      </router-link>
    </nav>

    <div class="navbar__actions">
      <HeaderSearch class="navbar__icon-button navbar__desktop-action" />
      <Screenfull class="navbar__icon-button navbar__desktop-action" />
      <button class="navbar__icon-button navbar__desktop-action" type="button" aria-label="切换主题" @click="settingsStore.toggleTheme">
        <SvgIcon :name="settingsStore.isDark ? 'sunny' : 'moon'" :size="18" />
      </button>
      <button class="navbar__icon-button navbar__desktop-action" type="button" aria-label="切换尺寸" @click="cycleSize">
        <SvgIcon name="grid" :size="18" />
      </button>
      <button class="navbar__icon-button navbar__desktop-action" type="button" aria-label="消息通知">
        <SvgIcon name="bell" :size="18" />
      </button>
      <button class="navbar__icon-button" type="button" aria-label="布局设置" @click="emit('openSettings')">
        <SvgIcon name="setting" :size="18" />
      </button>

      <el-dropdown trigger="click">
        <button class="navbar__account" type="button">
          <img v-if="userStore.avatar" :src="userStore.avatar" alt="" class="navbar__avatar" />
          <span v-else class="navbar__avatar navbar__avatar--fallback">
            <SvgIcon name="custom-user" :size="22" />
          </span>
          <span class="navbar__nickname">{{ userStore.nickName || userStore.name || '用户' }}</span>
          <SvgIcon name="arrow-down" :size="13" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push({ name: ROUTE_NAMES.profile })">个人中心</el-dropdown-item>
            <el-dropdown-item @click="lockScreen">锁定屏幕</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  height: var(--navbar-height);
  align-items: center;
  padding: 0 10px;
  color: var(--app-text);
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
  box-shadow: var(--app-shadow);
}

.navbar__icon-button {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
}

.navbar__icon-button:hover {
  color: var(--app-text);
  background: var(--app-surface-muted);
}

.navbar__breadcrumbs,
.navbar__topnav {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 14px;
  white-space: nowrap;
}

.navbar__separator {
  margin-right: 8px;
  color: var(--app-border);
}

.navbar__app-title {
  margin-right: 10px;
  color: var(--app-text);
}

.navbar__topnav-link {
  padding: 7px 9px;
  border-radius: 6px;
}

.navbar__topnav-link.router-link-active {
  color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary) 10%, transparent);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.navbar__account {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
  color: var(--app-text);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.navbar__avatar {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  border-radius: 50%;
}

.navbar__avatar--fallback {
  color: #fff;
  font-weight: 700;
  background: var(--app-primary);
}

.navbar__nickname {
  max-width: 110px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (width < 768px) {
  .navbar__breadcrumbs,
  .navbar__topnav,
  .navbar__desktop-action,
  .navbar__nickname {
    display: none;
  }
}
</style>
