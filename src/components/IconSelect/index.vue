<script setup lang="ts">
import { ref } from "vue";
import { listSelectableIcons } from "@/icons/registry";
import SvgIcon from "../SvgIcon.vue";
import { filterIconNames } from "./model";

withDefaults(
  defineProps<{
    activeIcon?: string;
  }>(),
  { activeIcon: "" },
);

const emit = defineEmits<{
  selected: [name: string];
}>();

const allIcons = listSelectableIcons();
const iconName = ref("");
const iconList = ref([...allIcons]);

function filterIcons(): void {
  iconList.value = filterIconNames(allIcons, iconName.value);
}

function selectedIcon(name: string): void {
  emit("selected", name);
}

function reset(): void {
  iconName.value = "";
  iconList.value = [...allIcons];
}

defineExpose({ reset });
</script>

<template>
  <div class="icon-body">
    <el-input
      v-model="iconName"
      class="icon-search"
      clearable
      placeholder="请输入图标名称"
      @clear="filterIcons"
      @input="filterIcons"
    />
    <div class="icon-list">
      <div class="list-container">
        <button
          v-for="item in iconList"
          :key="item"
          type="button"
          class="icon-item-wrapper"
          @click="selectedIcon(item)"
        >
          <div :class="['icon-item', { active: activeIcon === item }]">
            <SvgIcon :name="item" :size="16" />
            <span>{{ item }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 10px;
}

.icon-search {
  margin-bottom: 5px;
}

.icon-list {
  height: 200px;
  overflow: auto;
}

.list-container {
  display: flex;
  flex-wrap: wrap;
}

.icon-item-wrapper {
  display: flex;
  width: calc(100% / 3);
  height: 25px;
  padding: 0;
  line-height: 25px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.icon-item {
  display: flex;
  max-width: 100%;
  height: 100%;
  padding: 0 5px;

  &:hover,
  &.active {
    background: var(--el-fill-color-light, #ececec);
    border-radius: 5px;
  }

  span {
    padding-left: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
