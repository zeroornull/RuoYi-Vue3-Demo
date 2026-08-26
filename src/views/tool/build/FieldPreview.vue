<script setup lang="ts">
import { resolveBuildIcon } from "./icon-map";
import type { DrawingItem } from "./schema";

defineProps<{
  element: DrawingItem;
}>();
</script>

<template>
  <el-input
    v-if="element.kind === 'input'"
    :disabled="element.disabled"
    :clearable="element.clearable"
    :maxlength="element.maxlength ?? undefined"
    :show-word-limit="element.showWordLimit"
    :placeholder="element.placeholder"
  >
    <template v-if="element.prefixIcon" #prefix>
      <el-icon><component :is="resolveBuildIcon(element.prefixIcon)" /></el-icon>
    </template>
  </el-input>
  <el-input
    v-else-if="element.kind === 'textarea'"
    type="textarea"
    :rows="element.minRows"
    :disabled="element.disabled"
    :placeholder="element.placeholder"
  />
  <el-select
    v-else-if="element.kind === 'select'"
    :placeholder="element.placeholder"
    :disabled="element.disabled"
    :clearable="element.clearable"
    :multiple="element.multiple"
  >
    <el-option
      v-for="option in element.options"
      :key="String(option.value)"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
  <el-radio-group v-else-if="element.kind === 'radio'" :disabled="element.disabled">
    <el-radio v-for="option in element.options" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </el-radio>
  </el-radio-group>
  <el-upload v-else-if="element.kind === 'upload'" :action="element.action" :accept="element.accept" :disabled="element.disabled">
    <el-button type="primary">{{ element.buttonText }}</el-button>
  </el-upload>
  <el-tree
    v-else-if="element.kind === 'tree'"
    :data="element.data"
    :props="{ label: 'label', children: 'children' }"
    :show-checkbox="element.showCheckbox"
  />
  <span v-else-if="element.kind === 'row'" class="component-name">{{ element.componentName }}</span>
</template>
