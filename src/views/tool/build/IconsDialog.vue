<script setup lang="ts">
import { computed, ref } from "vue";
import { resolveBuildIcon } from "./icon-map";
import { ICON_CHOICES } from "./schema";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  select: [name: string];
}>();

const keyword = ref("");
const icons = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) {
    return [...ICON_CHOICES];
  }
  return ICON_CHOICES.filter((name) => name.toLowerCase().includes(query));
});

function select(name: string): void {
  emit("select", name);
  open.value = false;
}
</script>

<template>
  <el-dialog v-model="open" width="640px" title="选择图标">
    <el-input v-model="keyword" placeholder="请输入图标名称" clearable style="margin-bottom: 12px" />
    <ul class="icon-ul">
      <li v-for="name in icons" :key="name" @click="select(name)">
        <el-icon :size="22"><component :is="resolveBuildIcon(name)" /></el-icon>
        <span>{{ name }}</span>
      </li>
    </ul>
  </el-dialog>
</template>

<style scoped>
.icon-ul {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.icon-ul li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px;
}
.icon-ul li:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
</style>
