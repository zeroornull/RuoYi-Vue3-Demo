<script setup lang="ts">
import { computed } from "vue";
import { CopyDocument, Delete } from "@element-plus/icons-vue";
import draggable from "vuedraggable";
import FieldPreview from "./FieldPreview.vue";
import type { DrawingItem, FormConf } from "./schema";
import { isRowItem } from "./schema";

defineOptions({ name: "DraggableItem" });

const props = defineProps<{
  element: DrawingItem;
  index: number;
  drawingList: DrawingItem[];
  activeId: number;
  formConf: FormConf;
}>();

const emit = defineEmits<{
  activeItem: [item: DrawingItem];
  copyItem: [item: DrawingItem, parent: DrawingItem[]];
  deleteItem: [index: number, parent: DrawingItem[]];
}>();

const className = computed(() => {
  const base = isRowItem(props.element) ? "drawing-row-item" : "drawing-item";
  return props.activeId === props.element.formId ? `${base} active-from-item` : base;
});

function active(item: DrawingItem): void {
  emit("activeItem", item);
}

function copy(item: DrawingItem, parent?: DrawingItem[]): void {
  emit("copyItem", item, parent ?? props.drawingList);
}

function remove(index: number, parent?: DrawingItem[]): void {
  emit("deleteItem", index, parent ?? props.drawingList);
}
</script>

<template>
  <el-col :span="element.span" :class="className" @click.stop="active(element)">
    <el-form-item
      v-if="element.kind !== 'row'"
      :label="element.label"
      :required="element.required"
    >
      <FieldPreview :element="element" />
    </el-form-item>
    <el-row v-else :gutter="element.gutter" @click.stop="active(element)">
      <span class="component-name">{{ element.componentName }}</span>
      <draggable
        class="drag-wrapper"
        :list="element.children"
        :animation="340"
        group="componentsGroup"
        item-key="formId"
      >
        <template #item="{ element: child, index: childIndex }">
          <DraggableItem
            :element="child"
            :index="childIndex"
            :drawing-list="element.children"
            :active-id="activeId"
            :form-conf="formConf"
            @active-item="active"
            @copy-item="copy"
            @delete-item="remove"
          />
        </template>
      </draggable>
    </el-row>
    <span class="drawing-item-copy" title="复制" @click.stop="copy(element)">
      <el-icon><CopyDocument /></el-icon>
    </span>
    <span class="drawing-item-delete" title="删除" @click.stop="remove(index)">
      <el-icon><Delete /></el-icon>
    </span>
  </el-col>
</template>
