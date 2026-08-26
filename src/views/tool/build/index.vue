<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Delete, DocumentCopy, Download } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { saveAs } from "file-saver";
import draggable from "vuedraggable";
import SvgIcon from "../../../components/SvgIcon.vue";
import { generateVueSource, type GenerateMode } from "./codegen";
import CodeTypeDialog from "./CodeTypeDialog.vue";
import DraggableItem from "./DraggableItem.vue";
import RightPanel from "./RightPanel.vue";
import {
  BUILD_PAGE_NAME,
  changeKind,
  cloneDrawing,
  createIdAllocator,
  defaultDrawingList,
  emptyFormConf,
  paletteItems,
  replaceByFormId,
  type DrawingItem,
  type DrawingKind,
} from "./schema";

defineOptions({ name: BUILD_PAGE_NAME });

const nextId = createIdAllocator(100);
const palettes = paletteItems();
const drawingList = ref<DrawingItem[]>(defaultDrawingList());
const formConf = reactive(emptyFormConf());
const activeId = ref(drawingList.value[0]?.formId ?? 0);
const activeData = computed(
  () =>
    drawingList.value.flatMap(flatten).find((item) => item.formId === activeId.value) ?? drawingList.value[0] ?? null,
);
const dialogVisible = ref(false);
const showFileName = ref(false);
const operationType = ref<"copy" | "download">("copy");
let pendingClone: DrawingItem | null = null;

function flatten(item: DrawingItem): DrawingItem[] {
  return item.kind === "row" ? [item, ...item.children.flatMap(flatten)] : [item];
}

function activeFormItem(item: DrawingItem): void {
  activeId.value = item.formId;
}

function cloneFromPalette(origin: DrawingItem): DrawingItem {
  pendingClone = cloneDrawing(origin, nextId);
  return pendingClone;
}

function onPaletteEnd(): void {
  if (pendingClone) {
    activeFormItem(pendingClone);
  }
  pendingClone = null;
}

function addComponent(origin: DrawingItem): void {
  const clone = cloneDrawing(origin, nextId);
  drawingList.value.push(clone);
  activeFormItem(clone);
}

function copyItem(item: DrawingItem, parent: DrawingItem[]): void {
  const clone = cloneDrawing(item, nextId);
  parent.push(clone);
  activeFormItem(clone);
}

function deleteItem(index: number, parent: DrawingItem[]): void {
  parent.splice(index, 1);
  const fallback = drawingList.value[drawingList.value.length - 1];
  if (fallback) {
    activeFormItem(fallback);
  } else {
    activeId.value = 0;
  }
}

function onTagChange(kind: DrawingKind): void {
  const current = activeData.value;
  if (!current) {
    return;
  }
  const next = changeKind(current, kind, nextId);
  drawingList.value = replaceByFormId(drawingList.value, current.formId, next);
  activeFormItem(next);
}

async function empty(): Promise<void> {
  await ElMessageBox.confirm("确定要清空所有组件吗？", "提示", { type: "warning" });
  drawingList.value = [];
  activeId.value = 0;
}

function openCopy(): void {
  showFileName.value = false;
  operationType.value = "copy";
  dialogVisible.value = true;
}

function openDownload(): void {
  showFileName.value = true;
  operationType.value = "download";
  dialogVisible.value = true;
}

async function generate(payload: { type: GenerateMode; fileName: string }): Promise<void> {
  const code = generateVueSource(formConf, drawingList.value, payload.type);
  if (operationType.value === "download") {
    saveAs(new Blob([code], { type: "text/plain;charset=utf-8" }), payload.fileName);
    ElMessage.success("导出成功");
    return;
  }
  await navigator.clipboard.writeText(code);
  ElNotification({ title: "成功", message: "代码已复制到剪切板，可粘贴。", type: "success" });
}
</script>

<template>
  <div class="form-builder">
    <div class="left-board">
      <div class="logo">Form Generator</div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div class="components-title"><SvgIcon name="edit" /> 输入型组件</div>
          <draggable
            class="components-draggable"
            :list="palettes.inputs"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneFromPalette"
            :sort="false"
            item-key="tagIcon"
            @end="onPaletteEnd"
          >
            <template #item="{ element }">
              <div class="components-item" @click="addComponent(element)">
                <div class="components-body">{{ element.kind === "row" ? "行容器" : element.label }}</div>
              </div>
            </template>
          </draggable>
          <div class="components-title"><SvgIcon name="list" /> 选择型组件</div>
          <draggable
            class="components-draggable"
            :list="palettes.selects"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneFromPalette"
            :sort="false"
            item-key="tagIcon"
            @end="onPaletteEnd"
          >
            <template #item="{ element }">
              <div class="components-item" @click="addComponent(element)">
                <div class="components-body">
                  {{ element.kind === "row" ? "行容器" : "label" in element ? element.label : element.kind }}
                </div>
              </div>
            </template>
          </draggable>
          <div class="components-title"><SvgIcon name="component" /> 布局型组件</div>
          <draggable
            class="components-draggable"
            :list="palettes.layouts"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneFromPalette"
            :sort="false"
            item-key="tagIcon"
            @end="onPaletteEnd"
          >
            <template #item="{ element }">
              <div class="components-item" @click="addComponent(element)">
                <div class="components-body">行容器</div>
              </div>
            </template>
          </draggable>
        </div>
      </el-scrollbar>
    </div>
    <div class="center-board">
      <div class="action-bar">
        <el-button :icon="Download" type="primary" text @click="openDownload">导出vue文件</el-button>
        <el-button :icon="DocumentCopy" type="primary" text @click="openCopy">复制代码</el-button>
        <el-button :icon="Delete" type="danger" text @click="empty">清空</el-button>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-form
          class="drawing-form"
          :size="formConf.size"
          :label-position="formConf.labelPosition"
          :disabled="formConf.disabled"
          :label-width="`${formConf.labelWidth}px`"
        >
          <draggable
            class="drawing-board"
            :list="drawingList"
            :animation="340"
            group="componentsGroup"
            item-key="formId"
          >
            <template #item="{ element, index }">
              <DraggableItem
                :element="element"
                :index="index"
                :drawing-list="drawingList"
                :active-id="activeId"
                :form-conf="formConf"
                @active-item="activeFormItem"
                @copy-item="copyItem"
                @delete-item="deleteItem"
              />
            </template>
          </draggable>
          <div v-show="drawingList.length === 0" class="empty-info">从左侧拖入或点选组件进行表单设计</div>
        </el-form>
      </el-scrollbar>
    </div>
    <RightPanel
      :active-data="activeData"
      :form-conf="formConf"
      :show-field="drawingList.length > 0"
      @tag-change="onTagChange"
    />
    <CodeTypeDialog v-model="dialogVisible" :show-file-name="showFileName" @confirm="generate" />
  </div>
</template>

<style scoped>
.form-builder {
  position: relative;
  height: calc(100vh - 90px);
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}
.left-board {
  position: absolute;
  left: 0;
  top: 0;
  width: 260px;
  height: 100%;
  border-right: 1px solid var(--el-border-color-extra-light);
}
.logo {
  height: 42px;
  line-height: 42px;
  padding-left: 12px;
  font-weight: 600;
  color: #00afff;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.left-scrollbar {
  height: calc(100% - 42px);
}
.components-list {
  padding: 8px;
}
.components-title {
  margin: 8px 2px;
  font-size: 14px;
}
.components-draggable {
  padding-bottom: 12px;
}
.components-item {
  display: inline-block;
  width: 48%;
  margin: 1%;
}
.components-body {
  padding: 8px 10px;
  font-size: 12px;
  cursor: move;
  border: 1px dashed var(--el-border-color-extra-light);
  background: var(--el-border-color-extra-light);
  border-radius: 3px;
}
.components-body:hover {
  border-color: #787be8;
  color: #787be8;
}
.center-board {
  margin: 0 350px 0 260px;
  height: 100%;
}
.action-bar {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.center-scrollbar {
  height: calc(100% - 42px);
}
.drawing-form {
  min-height: 100%;
  padding: 12px;
}
.drawing-board {
  min-height: 240px;
}
.empty-info {
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  text-align: center;
  color: var(--el-text-color-secondary);
}
:deep(.drawing-item),
:deep(.drawing-row-item) {
  position: relative;
  cursor: move;
}
:deep(.drawing-item-copy),
:deep(.drawing-item-delete) {
  display: none;
  position: absolute;
  top: -10px;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
  border: 1px solid;
  cursor: pointer;
  z-index: 1;
}
:deep(.drawing-item-copy) {
  right: 22px;
}
:deep(.drawing-item-delete) {
  right: 0;
}
:deep(.drawing-item:hover .drawing-item-copy),
:deep(.drawing-item:hover .drawing-item-delete),
:deep(.drawing-row-item:hover .drawing-item-copy),
:deep(.drawing-row-item:hover .drawing-item-delete),
:deep(.active-from-item > .drawing-item-copy),
:deep(.active-from-item > .drawing-item-delete) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
:deep(.drawing-row-item) {
  min-height: 80px;
  margin-bottom: 12px;
  padding: 18px 4px 4px;
  border: 1px dashed var(--el-border-color);
  border-radius: 3px;
}
:deep(.drag-wrapper) {
  min-height: 72px;
  width: 100%;
}
:deep(.component-name) {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 12px;
  color: #bbb;
  padding: 0 6px;
}
:deep(.active-from-item) {
  background: var(--el-border-color-extra-light);
  border-radius: 6px;
}
</style>
