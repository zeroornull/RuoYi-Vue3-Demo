<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Edit, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { optionselect } from "../../../api/system/dict/type";
import { addData, delData, getData, listData, updateData } from "../../../api/system/dict/data";
import { download } from "../../../http";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { submitForm } from "../../../components/form";
import { useDict } from "../../../composables/useDict";
import {
  asSingleId,
  confirmDeleteMessage,
  emptySelection,
  firstPage,
  idsForAction,
  replaceObject,
  selectionFromRows,
} from "../../../composables/crud";
import { parseTime } from "../../../utils/parse-time";
import type { DictData, DictDataUpsertRequest, DictType } from "../../../types/api/system";
import { DICT_DATA_PAGE_NAME, dictDataToForm, emptyDictDataForm, emptyDictDataQuery } from "./model";

defineOptions({ name: DICT_DATA_PAGE_NAME });

const route = useRoute();
const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const dataRef = ref<FormInstance>();
const list = ref<DictData[]>([]);
const typeOptions = ref<DictType[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const queryParams = reactive(emptyDictDataQuery());
const form = reactive<DictDataUpsertRequest>(emptyDictDataForm());
const selection = ref(emptySelection<string>());
const rules: FormRules<DictDataUpsertRequest> = {
  dictLabel: [{ required: true, message: "数据标签不能为空", trigger: "blur" }],
  dictValue: [{ required: true, message: "数据键值不能为空", trigger: "blur" }],
  dictSort: [{ required: true, message: "数据顺序不能为空", trigger: "blur" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listData({ ...queryParams });
    list.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

async function loadTypes(): Promise<void> {
  const response = await optionselect();
  typeOptions.value = response.data ?? [];
  const matched = typeOptions.value.find((item) => item.dictId === String(route.params.dictId));
  if (matched) {
    queryParams.dictType = matched.dictType;
  } else if (!queryParams.dictType && typeOptions.value[0]) {
    queryParams.dictType = typeOptions.value[0].dictType;
  }
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function handleAdd(): void {
  replaceObject(form, emptyDictDataForm(queryParams.dictType ?? ""));
  title.value = "添加字典数据";
  open.value = true;
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyDictDataQuery(queryParams.dictType ?? ""));
  handleQuery();
}

async function handleUpdate(row?: DictData): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.dictCode, selection.value.ids));
  if (id === undefined) {
    return;
  }
  const response = await getData(id);
  replaceObject(form, dictDataToForm(response.data));
  title.value = "修改字典数据";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(dataRef.value))) return;
  if (form.dictCode) {
    await updateData(form);
    ElMessage.success("修改成功");
  } else {
    await addData(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: DictData): Promise<void> {
  const ids = idsForAction(row, (item) => item.dictCode, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("字典数据", ids), "警告", { type: "warning" });
  await delData(ids);
  ElMessage.success("删除成功");
  await getList();
}

watch(
  () => route.params.dictId,
  async () => {
    await loadTypes();
    await getList();
  },
);

onMounted(async () => {
  await loadTypes();
  await getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType" @change="handleQuery">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"
        ><el-button v-hasPermi="['system:dict:add']" type="primary" plain :icon="Plus" @click="handleAdd"
          >新增</el-button
        ></el-col
      >
      <el-col :span="1.5"
        ><el-button
          v-hasPermi="['system:dict:edit']"
          type="success"
          plain
          :icon="Edit"
          :disabled="selection.single"
          @click="handleUpdate()"
          >修改</el-button
        ></el-col
      >
      <el-col :span="1.5"
        ><el-button
          v-hasPermi="['system:dict:remove']"
          type="danger"
          plain
          :icon="Delete"
          :disabled="selection.multiple"
          @click="handleDelete()"
          >删除</el-button
        ></el-col
      >
      <el-col :span="1.5"
        ><el-button
          v-hasPermi="['system:dict:export']"
          type="warning"
          plain
          :icon="Download"
          @click="download('system/dict/data/export', { ...queryParams }, `dict_data_${Date.now()}.xlsx`)"
          >导出</el-button
        ></el-col
      >
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="list"
      @selection-change="(rows: DictData[]) => (selection = selectionFromRows(rows, (row) => row.dictCode))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编码" align="center" prop="dictCode" />
      <el-table-column label="字典标签" align="center" prop="dictLabel" />
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }"><DictTag :options="sys_normal_disable" :value="row.status" /></template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:dict:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)"
            >修改</el-button
          >
          <el-button v-hasPermi="['system:dict:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog v-model="open" :title="title" width="500px" append-to-body>
      <el-form ref="dataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型"><el-input v-model="form.dictType" disabled /></el-form-item>
        <el-form-item label="数据标签" prop="dictLabel"><el-input v-model="form.dictLabel" /></el-form-item>
        <el-form-item label="数据键值" prop="dictValue"><el-input v-model="form.dictValue" /></el-form-item>
        <el-form-item label="样式属性" prop="cssClass"><el-input v-model="form.cssClass" /></el-form-item>
        <el-form-item label="显示排序" prop="dictSort"
          ><el-input-number v-model="form.dictSort" :min="0"
        /></el-form-item>
        <el-form-item label="回显样式" prop="listClass"><el-input v-model="form.listClass" /></el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
