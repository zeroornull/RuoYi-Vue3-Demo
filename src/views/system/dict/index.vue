<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Edit, Operation, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import {
  addType,
  delType,
  getType,
  listType,
  refreshCache,
  updateType,
} from "../../../api/system/dict/type";
import { download } from "../../../http";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { submitForm } from "../../../components/form";
import { useDict } from "../../../composables/useDict";
import { useDictStore } from "../../../stores/modules/dict";
import {
  asSingleId,
  confirmDeleteMessage,
  emptySelection,
  firstPage,
  idsForAction,
  replaceObject,
  selectionFromRows,
} from "../../../composables/crud";
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import type { DictType, DictTypeUpsertRequest } from "../../../types/api/system";
import DictDetail from "./detail.vue";
import {
  DICT_PAGE_NAME,
  dictTypeToForm,
  emptyDictTypeForm,
  emptyDictTypeQuery,
} from "./model";

defineOptions({ name: DICT_PAGE_NAME });

const router = useRouter();
const dictStore = useDictStore();
const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const dictRef = ref<FormInstance>();
const list = ref<DictType[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const dateRange = ref<[string, string] | []>([]);
const drawerVisible = ref(false);
const drawerRow = ref<Partial<DictType>>({});
const queryParams = reactive(emptyDictTypeQuery());
const form = reactive<DictTypeUpsertRequest>(emptyDictTypeForm());
const selection = ref(emptySelection<string>());
const rules: FormRules<DictTypeUpsertRequest> = {
  dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
  dictType: [{ required: true, message: "字典类型不能为空", trigger: "blur" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listType(addDateRange({ ...queryParams }, dateRange.value));
    list.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function handleAdd(): void {
  replaceObject(form, emptyDictTypeForm());
  title.value = "添加字典类型";
  open.value = true;
}

function resetQuery(): void {
  dateRange.value = [];
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyDictTypeQuery());
  handleQuery();
}

async function handleUpdate(row?: DictType): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.dictId, selection.value.ids));
  if (id === undefined) {
    return;
  }
  const response = await getType(id);
  replaceObject(form, dictTypeToForm(response.data));
  title.value = "修改字典类型";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(dictRef.value))) return;
  if (form.dictId) {
    await updateType(form);
    ElMessage.success("修改成功");
  } else {
    await addType(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: DictType): Promise<void> {
  const ids = idsForAction(row, (item) => item.dictId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("字典", ids), "警告", { type: "warning" });
  await delType(ids);
  ElMessage.success("删除成功");
  await getList();
}

function handleViewData(row: DictType): void {
  drawerRow.value = row;
  drawerVisible.value = true;
}

function handleDataList(row: DictType): void {
  void router.push(`/system/dict-data/index/${row.dictId}`);
}

async function handleRefreshCache(): Promise<void> {
  await refreshCache();
  dictStore.cleanDict();
  ElMessage.success("刷新缓存成功");
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="字典状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button v-hasPermi="['system:dict:add']" type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button></el-col>
      <el-col :span="1.5"><el-button v-hasPermi="['system:dict:edit']" type="success" plain :icon="Edit" :disabled="selection.single" @click="handleUpdate()">修改</el-button></el-col>
      <el-col :span="1.5"><el-button v-hasPermi="['system:dict:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete()">删除</el-button></el-col>
      <el-col :span="1.5"><el-button v-hasPermi="['system:dict:export']" type="warning" plain :icon="Download" @click="download('system/dict/type/export', { ...queryParams }, `dict_${Date.now()}.xlsx`)">导出</el-button></el-col>
      <el-col :span="1.5"><el-button v-hasPermi="['system:dict:remove']" type="danger" plain :icon="Refresh" @click="handleRefreshCache">刷新缓存</el-button></el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table v-loading="loading" :data="list" @selection-change="(rows: DictType[]) => (selection = selectionFromRows(rows, (row) => row.dictId))">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编号" align="center" prop="dictId" />
      <el-table-column label="字典名称" align="center" prop="dictName" show-overflow-tooltip />
      <el-table-column label="字典类型" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <a class="link-type" @click="handleViewData(row)">{{ row.dictType }}</a>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="{ row }"><DictTag :options="sys_normal_disable" :value="row.status" /></template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:dict:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button v-hasPermi="['system:dict:edit']" link type="primary" :icon="Operation" @click="handleDataList(row)">列表</el-button>
          <el-button v-hasPermi="['system:dict:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog v-model="open" :title="title" width="500px" append-to-body>
      <el-form ref="dictRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName"><el-input v-model="form.dictName" /></el-form-item>
        <el-form-item label="字典类型" prop="dictType"><el-input v-model="form.dictType" /></el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
    <DictDetail v-model:visible="drawerVisible" :row="drawerRow" />
  </div>
</template>
