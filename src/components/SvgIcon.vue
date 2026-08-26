<script setup lang="ts">
import { computed } from "vue";
import { Grid } from "@element-plus/icons-vue";
import {
  resolveCustomIcon,
  resolveElementIcon,
} from "../icons/registry";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    color?: string;
    label?: string;
  }>(),
  { size: 16, color: "currentColor", label: "" },
);

const elementIcon = computed(() => resolveElementIcon(props.name));
const customIcon = computed(() => resolveCustomIcon(props.name));
const iconStyle = computed(() => ({
  width: typeof props.size === "number" ? `${props.size}px` : props.size,
  height: typeof props.size === "number" ? `${props.size}px` : props.size,
  color: props.color,
}));
</script>

<template>
  <span
    class="svg-icon"
    :style="iconStyle"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <component :is="elementIcon" v-if="elementIcon" />
    <img v-else-if="customIcon" :src="customIcon" alt="" />
    <Grid v-else class="svg-icon__fallback" />
  </span>
</template>

<style scoped>
.svg-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.svg-icon :deep(svg),
.svg-icon img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
