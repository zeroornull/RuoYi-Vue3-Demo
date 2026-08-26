<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getGenTable, updateGenTable } from "../../../api/tool/gen";
import { optionselect } from "../../../api/system/dict/type";
import { submitForm } from "../../../components/form";
import { bindSortableList } from "../../../components/upload/sortable";
import { replaceObject } from "../../../composables/crud";
import { routeToTagView } from "../../../layout/model";
import { useTagsViewStore } from "../../../stores/modules/tags-view";
import type { DictType, GeneratorTable } from "../../../types/api";
import BasicInfoForm from "./basicInfoForm.vue";
import GenInfoForm from "./genInfoForm.vue";
import {
  GEN_EDIT_PAGE_NAME,
  HTML_TYPE_OPTIONS,
  JAVA_TYPE_OPTIONS,
  QUERY_TYPE_OPTIONS,
  emptyGenEditForm,
  formToUpdateRequest,
  reorderColumns,
  tableInfoToForm,
  type GenEditForm,
} from "./model";

defineOptions({ name: GEN_EDIT_PAGE_NAME });

type FormHandle = { formRef?: { validate: () => Promise<unknown>; resetFields: () => void } };

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsViewStore();
const activeName = ref("columnInfo");
const tableHeight = ref(520);
const tables = ref<GeneratorTable[]>([]);
const dictOptions = ref<DictType[]>([]);
const form = reactive<GenEditForm>(emptyGenEditForm());
const basicInfo = ref<FormHandle>();
const genInfo = ref<FormHandle>();
const dragTable = ref<HTMLElement | null>(null);
let sortable: { destroy: () => void } | null = null;

function close(): void {
  const view = routeToTagView(route);
  if (view) {
    tagsStore.delView(view);
  }
  void router.push({
    path: "/tool/gen",
    query: {
      t: String(Date.now()),
      pageNum: String(route.query.pageNum ?? "1"),
    },
  });
}

async function load(): Promise<void> {
  const tableId = route.params.tableId;
  if (typeof tableId !== "string" || tableId.length === 0) {
    ElMessage.error("缺少表编号");
    close();
    return;
  }
  const [table, dicts] = await Promise.all([getGenTable(tableId), optionselect()]);
  replaceObject(form, tableInfoToForm(table.data.info, table.data.rows ?? []));
  tables.value = table.data.tables ?? [];
  dictOptions.value = dicts.data ?? [];
}

async function submit(): Promise<void> {
  const basicOk = await submitForm(basicInfo.value?.formRef);
  const genOk = await submitForm(genInfo.value?.formRef);
  if (!basicOk || !genOk) {
    ElMessage.error("表单校验未通过，请重新检查提交内容");
    return;
  }
  const response = await updateGenTable(formToUpdateRequest(form));
  ElMessage.success(response.msg ?? "修改成功");
  close();
}

onMounted(() => {
  tableHeight.value = Math.max(360, window.innerHeight - 280);
  void load().then(() => {
    void nextTick(() => {
      const body = dragTable.value?.querySelector(".el-table__body tbody");
      sortable = bindSortableList(
        body instanceof HTMLElement ? body : null,
        (from, to) => {
          form.columns = reorderColumns(form.columns, from, to);
        },
        undefined,
        ".allowDrag",
      );
    });
  });
});

onUnmounted(() => {
  sortable?.destroy();
});
</script>

<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <BasicInfoForm ref="basicInfo" :info="form" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columnInfo">
        <div ref="dragTable">
          <el-table :data="form.columns" row-key="columnId" :max-height="tableHeight">
            <el-table-column label="序号" type="index" min-width="5%" class-name="allowDrag" />
            <el-table-column
              label="字段列名"
              prop="columnName"
              min-width="10%"
              show-overflow-tooltip
              class-name="allowDrag"
            />
            <el-table-column label="字段描述" min-width="10%">
              <template #default="{ row }">
                <el-input v-model="row.columnComment" />
              </template>
            </el-table-column>
            <el-table-column label="物理类型" prop="columnType" min-width="10%" show-overflow-tooltip />
            <el-table-column label="Java类型" min-width="11%">
              <template #default="{ row }">
                <el-select v-model="row.javaType">
                  <el-option v-for="item in JAVA_TYPE_OPTIONS" :key="item" :label="item" :value="item" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="java属性" min-width="10%">
              <template #default="{ row }">
                <el-input v-model="row.javaField" />
              </template>
            </el-table-column>
            <el-table-column label="插入" min-width="5%">
              <template #default="{ row }">
                <el-checkbox v-model="row.isInsert" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="编辑" min-width="5%">
              <template #default="{ row }">
                <el-checkbox v-model="row.isEdit" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="列表" min-width="5%">
              <template #default="{ row }">
                <el-checkbox v-model="row.isList" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="查询" min-width="5%">
              <template #default="{ row }">
                <el-checkbox v-model="row.isQuery" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="查询方式" min-width="10%">
              <template #default="{ row }">
                <el-select v-model="row.queryType">
                  <el-option
                    v-for="item in QUERY_TYPE_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="必填" min-width="5%">
              <template #default="{ row }">
                <el-checkbox v-model="row.isRequired" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="显示类型" min-width="12%">
              <template #default="{ row }">
                <el-select v-model="row.htmlType">
                  <el-option
                    v-for="item in HTML_TYPE_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="字典类型" min-width="12%">
              <template #default="{ row }">
                <el-select v-model="row.dictType" clearable filterable placeholder="请选择">
                  <el-option
                    v-for="dict in dictOptions"
                    :key="dict.dictType"
                    :label="dict.dictName"
                    :value="dict.dictType"
                  />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <GenInfoForm ref="genInfo" :info="form" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <div class="edit-actions">
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button @click="close">返回</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.edit-actions {
  margin-top: 12px;
  text-align: center;
}
</style>
