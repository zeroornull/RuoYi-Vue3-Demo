<script setup lang="ts">
import { computed } from "vue";
import type { AppRouteRecordRaw } from "../../router/types";
import { joinRoutePath, visibleMenuRoutes } from "../model";
import SvgIcon from "../../components/SvgIcon.vue";

defineOptions({ name: "SidebarItem" });

const props = defineProps<{
  item: AppRouteRecordRaw;
  basePath: string;
}>();

const children = computed(() => visibleMenuRoutes(props.item.children ?? []));
const onlyChild = computed(() => children.value[0]);

function itemPath(item: AppRouteRecordRaw): string {
  return item.meta?.link ?? joinRoutePath(props.basePath, item.path);
}

function childBase(item: AppRouteRecordRaw): string {
  return joinRoutePath(props.basePath, item.path);
}
</script>

<template>
  <el-menu-item
    v-if="children.length === 1 && !item.alwaysShow && onlyChild"
    :index="itemPath(onlyChild)"
  >
    <SvgIcon :name="onlyChild.meta?.icon || item.meta?.icon || 'grid'" />
    <template #title>{{ onlyChild.meta?.title || onlyChild.name || onlyChild.path }}</template>
  </el-menu-item>

  <el-sub-menu v-else-if="children.length > 0" :index="itemPath(item)">
    <template #title>
      <SvgIcon :name="item.meta?.icon || 'grid'" />
      <span>{{ item.meta?.title || item.name || item.path }}</span>
    </template>
    <SidebarItem
      v-for="child in children"
      :key="`${itemPath(child)}:${String(child.name ?? '')}`"
      :item="child"
      :base-path="childBase(item)"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="itemPath(item)">
    <SvgIcon :name="item.meta?.icon || 'grid'" />
    <template #title>{{ item.meta?.title || item.name || item.path }}</template>
  </el-menu-item>
</template>

<style scoped>
.svg-icon {
  margin-right: 10px;
}
</style>
