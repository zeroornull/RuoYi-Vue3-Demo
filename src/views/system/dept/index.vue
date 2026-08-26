<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Delete, Edit, Plus, Refresh, Search, Sort } from "@element-plus/icons-vue";
import {
  addDept,
  delDept,
  getDept,
  listDept,
  listDeptExcludeChild,
  updateDept,
  updateDeptSort,
} from "../../../api/system/dept";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { submitForm } from "../../../components/form";
import { useDict } from "../../../composables/useDict";
import { replaceObject } from "../../../composables/crud";
import { parseTime } from "../../../utils/parse-time";
import {
  collectChangedSort,
  confirmDeleteName,
  excludeSelfAndDescendants,
  recordOrders,
} from "../../../utils/tree-edit";
import type { Department, DepartmentUpsertRequest } from "../../../types/api/system";
import {
  DEPT_PAGE_NAME,
  DEPT_PHONE_PATTERN,
  ROOT_PARENT_ID,
  deptToForm,
  emptyDeptForm,
  emptyDeptQuery,
  isRootDept,
  toDeptTree,
  type DeptTreeNode,
} from "./model";

defineOptions({ name: DEPT_PAGE_NAME });

const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const deptRef = ref<FormInstance>();
const deptList = ref<DeptTreeNode[]>([]);
const deptOptions = ref<DeptTreeNode[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const originalOrders = ref<Record<string, number>>({});
const queryParams = reactive(emptyDeptQuery());
const form = reactive<DepartmentUpsertRequest>(emptyDeptForm());

const hideParentSelect = computed(
  () => Boolean(form.deptId) && form.parentId === ROOT_PARENT_ID,
);

const rules: FormRules<DepartmentUpsertRequest> = {
  parentId: [{ required: true, message: "上级部门不能为空", trigger: "blur" }],
  deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
  phone: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || DEPT_PHONE_PATTERN.test(value)) {
          callback();
          return;
        }
        callback(new Error("请输入正确的手机号码"));
      },
      trigger: "blur",
    },
  ],
  email: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          callback();
          return;
        }
        callback(new Error("请输入正确的邮箱地址"));
      },
      trigger: ["blur", "change"],
    },
  ],
};

function rememberOrders(nodes: readonly DeptTreeNode[]): void {
  originalOrders.value = recordOrders(
    nodes,
    (row) => row.deptId,
    (row) => row.orderNum,
    (row) => row.children,
  );
}

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listDept({ ...queryParams });
    deptList.value = toDeptTree(response.data ?? []);
    rememberOrders(deptList.value);
  } finally {
    loading.value = false;
  }
}

function resetFormModel(parentId = ROOT_PARENT_ID): void {
  replaceObject(form, emptyDeptForm(parentId));
  deptRef.value?.resetFields();
}

function handleQuery(): void {
  void getList();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyDeptQuery());
  handleQuery();
}

async function loadParentOptions(excludeId?: string): Promise<void> {
  const response = excludeId
    ? await listDeptExcludeChild(excludeId)
    : await listDept();
  deptOptions.value = toDeptTree(response.data ?? []);
  if (excludeId) {
    deptOptions.value = excludeSelfAndDescendants(
      deptOptions.value,
      excludeId,
      (row) => row.deptId,
      (row) => row.children,
    );
  }
}

function handleAdd(row?: Department): void {
  resetFormModel(row?.deptId ?? ROOT_PARENT_ID);
  title.value = "添加部门";
  open.value = true;
  void loadParentOptions();
}

function toggleExpandAll(): void {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  void nextTick(() => {
    refreshTable.value = true;
  });
}

async function handleUpdate(row: Department): Promise<void> {
  resetFormModel();
  await loadParentOptions(row.deptId);
  const response = await getDept(row.deptId);
  replaceObject(form, deptToForm(response.data));
  title.value = "修改部门";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(deptRef.value))) {
    return;
  }
  if (form.deptId) {
    await updateDept(form);
    ElMessage.success("修改成功");
  } else {
    await addDept(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleSaveSort(): Promise<void> {
  const change = collectChangedSort(
    deptList.value,
    originalOrders.value,
    (row) => row.deptId,
    (row) => row.orderNum,
    (row) => row.children,
  );
  if (!change) {
    ElMessage.warning("未检测到排序修改");
    return;
  }
  await updateDeptSort(change);
  ElMessage.success("排序保存成功");
  rememberOrders(deptList.value);
}

async function handleDelete(row: Department): Promise<void> {
  await ElMessageBox.confirm(confirmDeleteName("部门", row.deptName), "警告", {
    type: "warning",
  });
  await delDept(row.deptId);
  ElMessage.success("删除成功");
  await getList();
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:dept:add']" type="primary" plain :icon="Plus" @click="handleAdd()">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:dept:edit']" type="warning" plain :icon="Check" @click="handleSaveSort">保存排序</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain :icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="deptName" label="部门名称" width="260" />
      <el-table-column prop="orderNum" label="排序" width="200">
        <template #default="{ row }">
          <el-input-number v-model="row.orderNum" controls-position="right" :min="0" style="width: 88px" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <DictTag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:dept:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button v-hasPermi="['system:dept:add']" link type="primary" :icon="Plus" @click="handleAdd(row)">新增</el-button>
          <el-button
            v-if="!isRootDept(row)"
            v-hasPermi="['system:dept:remove']"
            link
            type="primary"
            :icon="Delete"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="!hideParentSelect" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
