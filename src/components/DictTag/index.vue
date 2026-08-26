<script setup lang="ts">
import { computed } from "vue";
import type { TagProps } from "element-plus";
import type { DictItem } from "@/types/dict";
import { formatUnmatchedValues, isPlainDictTag, matchDictTagValues, type DictTagValue } from "./model";

const props = withDefaults(
  defineProps<{
    options?: DictItem[] | null;
    value?: DictTagValue | null;
    showValue?: boolean;
    separator?: string;
  }>(),
  {
    options: null,
    value: null,
    showValue: true,
    separator: ",",
  },
);

const matched = computed(() => matchDictTagValues(props.options, props.value, props.separator).matched);
const unmatched = computed(() => matchDictTagValues(props.options, props.value, props.separator).unmatched);

function tagType(item: DictItem): TagProps["type"] | undefined {
  const type = item.elTagType;
  if (type === "primary" || type === "success" || type === "info" || type === "warning" || type === "danger") {
    return type;
  }
  return undefined;
}
</script>

<template>
  <div class="dict-tag">
    <template v-for="item in matched" :key="String(item.value)">
      <span v-if="isPlainDictTag(item)" :class="item.elTagClass">{{ item.label }} </span>
      <el-tag v-else :disable-transitions="true" :type="tagType(item)" :class="item.elTagClass">
        {{ item.label }}
      </el-tag>
    </template>
    <template v-if="unmatched.length > 0 && showValue">
      {{ formatUnmatchedValues(unmatched) }}
    </template>
  </div>
</template>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
