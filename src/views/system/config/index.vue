<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Edit, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { addConfig, delConfig, getConfig, listConfig, refreshCache, updateConfig } from "../../../api/system/config";
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
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import type { Config, ConfigUpsertRequest } from "../../../types/api/system";
import { CONFIG_PAGE_NAME, configToForm, emptyConfigForm, emptyConfigQuery } from "./model";

defineOptions({ name: CONFIG_PAGE_NAME });

const { sys_yes_no } = useDict("sys_yes_no");
const queryRef = ref<FormInstance>();
const configRef = ref<FormInstance>();
const list = ref<Config[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const dateRange = ref<[string, string] | []>([]);
const queryParams = reactive(emptyConfigQuery());
const form = reactive<ConfigUpsertRequest>(emptyConfigForm());
const selection = ref(emptySelection<string>());

const rules: FormRules<ConfigUpsertRequest> = {
  configName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
  configKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
  configValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listConfig(addDateRange({ ...queryParams }, dateRange.value));
    list.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function resetFormModel(): void {
  replaceObject(form, emptyConfigForm());
  configRef.value?.resetFields();
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function resetQuery(): void {
  dateRange.value = [];
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyConfigQuery());
  handleQuery();
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加参数";
  open.value = true;
}

async function handleUpdate(row?: Config): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.configId, selection.value.ids));
  if (id === undefined) {
    return;
  }
  const response = await getConfig(id);
  replaceObject(form, configToForm(response.data));
  title.value = "修改参数";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(configRef.value))) {
    return;
  }
  if (form.configId) {
    await updateConfig(form);
    ElMessage.success("修改成功");
  } else {
    await addConfig(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: Config): Promise<void> {
  const ids = idsForAction(row, (item) => item.configId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("参数", ids), "警告", {
    type: "warning",
  });
  await delConfig(ids);
  ElMessage.success("删除成功");
  await getList();
}

function handleExport(): void {
  void download("system/config/export", { ...queryParams }, `config_${Date.now()}.xlsx`);
}

async function handleRefreshCache(): Promise<void> {
  await refreshCache();
  ElMessage.success("刷新缓存成功");
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="queryParams.configName" placeholder="请输入参数名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="系统内置" clearable>
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:add']" type="primary" plain :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:edit']"
          type="success"
          plain
          :icon="Edit"
          :disabled="selection.single"
          @click="handleUpdate()"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:remove']"
          type="danger"
          plain
          :icon="Delete"
          :disabled="selection.multiple"
          @click="handleDelete()"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:export']" type="warning" plain :icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:remove']" type="danger" plain :icon="Refresh" @click="handleRefreshCache"
          >刷新缓存</el-button
        >
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      @selection-change="(rows: Config[]) => (selection = selectionFromRows(rows, (row) => row.configId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" />
      <el-table-column label="参数名称" align="center" prop="configName" show-overflow-tooltip />
      <el-table-column label="参数键名" align="center" prop="configKey" show-overflow-tooltip />
      <el-table-column label="参数键值" align="center" prop="configValue" show-overflow-tooltip />
      <el-table-column label="系统内置" align="center" prop="configType">
        <template #default="{ row }">
          <DictTag :options="sys_yes_no" :value="row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:config:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)"
            >修改</el-button
          >
          <el-button v-hasPermi="['system:config:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)"
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
      <el-form ref="configRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
