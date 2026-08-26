<script setup lang="ts">
import { computed, ref } from "vue";
import { CirclePlus, Link, Rank, Remove } from "@element-plus/icons-vue";
import draggable from "vuedraggable";
import IconsDialog from "./IconsDialog.vue";
import TreeNodeDialog from "./TreeNodeDialog.vue";
import {
  paletteItems,
  type DrawingItem,
  type DrawingKind,
  type FormConf,
  type SelectOption,
} from "./schema";

const props = defineProps<{
  activeData: DrawingItem | null;
  formConf: FormConf;
  showField: boolean;
}>();

const emit = defineEmits<{
  tagChange: [kind: DrawingKind];
}>();

const currentTab = ref<"field" | "form">("field");
const iconOpen = ref(false);
const treeOpen = ref(false);
const tagList = computed(() => {
  const palettes = paletteItems();
  return [
    { label: "输入型", options: palettes.inputs },
    { label: "选择型", options: palettes.selects },
    { label: "布局型", options: palettes.layouts },
  ];
});

const documentLink = computed(() => props.activeData?.document ?? "");

function onKindChange(kind: string): void {
  if (kind === "input" || kind === "textarea" || kind === "select" || kind === "radio" || kind === "upload" || kind === "tree" || kind === "row") {
    emit("tagChange", kind);
  }
}

function addOption(): void {
  const active = props.activeData;
  if (active && (active.kind === "select" || active.kind === "radio")) {
    const next = active.options.length + 1;
    active.options.push({ label: `选项${next}`, value: next });
  }
}

function removeOption(index: number): void {
  const active = props.activeData;
  if (active && (active.kind === "select" || active.kind === "radio")) {
    active.options.splice(index, 1);
  }
}

function addTreeNode(payload: { label: string; value: string | number }): void {
  const active = props.activeData;
  if (active?.kind !== "tree") {
    return;
  }
  const id = Math.max(0, ...active.data.map((node) => node.id)) + 1;
  active.data.push({ id, label: payload.label, value: payload.value });
}

function onIconSelect(name: string): void {
  const active = props.activeData;
  if (active?.kind === "input") {
    active.prefixIcon = name;
  }
}

function kindOf(item: DrawingItem | null): DrawingKind | "" {
  return item?.kind ?? "";
}
</script>

<template>
  <div class="right-board">
    <el-tabs v-model="currentTab" stretch>
      <el-tab-pane label="组件属性" name="field" />
      <el-tab-pane label="表单属性" name="form" />
    </el-tabs>
    <el-scrollbar class="right-scrollbar">
      <el-form v-show="currentTab === 'field' && showField && activeData" label-width="90px" label-position="top">
        <el-form-item v-if="activeData && activeData.kind !== 'row'" label="组件类型">
          <el-select :model-value="kindOf(activeData)" style="width: 100%" @change="onKindChange">
            <el-option-group v-for="group in tagList" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.kind"
                :label="item.kind === 'row' ? '行容器' : item.label"
                :value="item.kind"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <template v-if="activeData && activeData.kind !== 'row'">
          <el-form-item label="字段名">
            <el-input v-model="activeData.vModel" />
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="activeData.label" />
          </el-form-item>
          <el-form-item label="表单栅格">
            <el-slider v-model="activeData.span" :min="1" :max="24" />
          </el-form-item>
          <el-form-item label="必填">
            <el-switch v-model="activeData.required" />
          </el-form-item>
          <el-form-item label="禁用">
            <el-switch v-model="activeData.disabled" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'input'">
          <el-form-item label="占位提示">
            <el-input v-model="activeData.placeholder" />
          </el-form-item>
          <el-form-item label="前图标">
            <el-input v-model="activeData.prefixIcon">
              <template #append>
                <el-button @click="iconOpen = true">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="最多输入">
            <el-input-number v-model="activeData.maxlength" :min="0" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'textarea'">
          <el-form-item label="占位提示">
            <el-input v-model="activeData.placeholder" />
          </el-form-item>
          <el-form-item label="最小行数">
            <el-input-number v-model="activeData.minRows" :min="1" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'select'">
          <el-form-item label="占位提示">
            <el-input v-model="activeData.placeholder" />
          </el-form-item>
          <el-form-item label="多选">
            <el-switch v-model="activeData.multiple" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'upload'">
          <el-form-item label="上传地址">
            <el-input v-model="activeData.action" />
          </el-form-item>
          <el-form-item label="按钮文字">
            <el-input v-model="activeData.buttonText" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'tree'">
          <el-form-item label="显示复选框">
            <el-switch v-model="activeData.showCheckbox" />
          </el-form-item>
        </template>
        <template v-if="activeData?.kind === 'row'">
          <el-form-item label="组件名">
            <span>{{ activeData.componentName }}</span>
          </el-form-item>
          <el-form-item label="栅格间隔">
            <el-input-number v-model="activeData.gutter" :min="0" />
          </el-form-item>
        </template>
        <template v-if="activeData && (activeData.kind === 'select' || activeData.kind === 'radio')">
          <el-divider>选项</el-divider>
          <draggable :list="activeData.options" :animation="340" handle=".option-drag" item-key="label">
            <template #item="{ element, index }">
              <div class="select-item">
                <el-icon class="option-drag"><Rank /></el-icon>
                <el-input v-model="(element as SelectOption).label" size="small" />
                <el-input :model-value="String((element as SelectOption).value)" size="small" disabled />
                <el-icon class="close-btn" @click="removeOption(index)"><Remove /></el-icon>
              </div>
            </template>
          </draggable>
          <el-button :icon="CirclePlus" text type="primary" @click="addOption">添加选项</el-button>
        </template>
        <template v-if="activeData?.kind === 'tree'">
          <el-divider>树节点</el-divider>
          <el-tree :data="activeData.data" :props="{ label: 'label', children: 'children' }" />
          <el-button :icon="CirclePlus" text type="primary" @click="treeOpen = true">添加父级</el-button>
        </template>
        <a v-if="documentLink" class="document-link" :href="documentLink" target="_blank">
          <el-icon><Link /></el-icon> 组件文档
        </a>
      </el-form>
      <el-form v-show="currentTab === 'form'" label-width="90px" label-position="top">
        <el-form-item label="表单尺寸">
          <el-radio-group v-model="formConf.size">
            <el-radio-button value="large">较大</el-radio-button>
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="small">较小</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签对齐">
          <el-radio-group v-model="formConf.labelPosition">
            <el-radio-button value="left">左对齐</el-radio-button>
            <el-radio-button value="right">右对齐</el-radio-button>
            <el-radio-button value="top">顶部对齐</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签宽度">
          <el-input-number v-model="formConf.labelWidth" :min="0" />
        </el-form-item>
        <el-form-item label="禁用表单">
          <el-switch v-model="formConf.disabled" />
        </el-form-item>
        <el-form-item label="显示按钮">
          <el-switch v-model="formConf.formBtns" />
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <IconsDialog v-model="iconOpen" @select="onIconSelect" />
    <TreeNodeDialog v-model="treeOpen" @confirm="addTreeNode" />
  </div>
</template>

<style scoped>
.right-board {
  width: 350px;
  position: absolute;
  right: 0;
  top: 0;
  padding-top: 3px;
  height: calc(100vh - 90px);
  border-left: 1px solid var(--el-border-color-extra-light);
}
.right-scrollbar {
  height: calc(100vh - 150px);
  padding: 0 12px;
}
.select-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.option-drag {
  cursor: move;
}
.close-btn {
  cursor: pointer;
}
.document-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 13px;
}
</style>
