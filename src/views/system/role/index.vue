<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CircleCheck,
  Delete,
  Download,
  Edit,
  Plus,
  QuestionFilled,
  Refresh,
  Search,
  User,
} from "@element-plus/icons-vue";
import {
  addRole,
  changeRoleStatus,
  dataScope,
  delRole,
  deptTreeSelect,
  getRole,
  listRole,
  updateRole,
} from "../../../api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "../../../api/system/menu";
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
import type { TreeSelectNode } from "../../../types/api/common";
import type { Role, RoleUpsertRequest } from "../../../types/api/system";
import { statusChangeText } from "../user/model";
import {
  DATA_SCOPE_OPTIONS,
  ROLE_PAGE_NAME,
  collectCheckedTreeIds,
  emptyRoleForm,
  emptyRoleQuery,
  isProtectedRole,
  roleToForm,
  setRootTreeExpand,
  type RoleTreeInstance,
} from "./model";

defineOptions({ name: ROLE_PAGE_NAME });

const router = useRouter();
const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const roleFormRef = ref<FormInstance>();
const menuRef = ref<RoleTreeInstance>();
const deptRef = ref<RoleTreeInstance>();
const roleList = ref<Role[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const openDataScope = ref(false);
const title = ref("");
const dateRange = ref<[string, string] | []>([]);
const menuOptions = ref<TreeSelectNode[]>([]);
const deptOptions = ref<TreeSelectNode[]>([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const queryParams = reactive(emptyRoleQuery());
const form = reactive<RoleUpsertRequest>(emptyRoleForm());
const selection = ref(emptySelection<string>());

const rules: FormRules<RoleUpsertRequest> = {
  roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
  roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
  roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listRole(addDateRange({ ...queryParams }, dateRange.value));
    roleList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function resetQuery(): void {
  dateRange.value = [];
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyRoleQuery());
  handleQuery();
}

function resetFormModel(): void {
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  menuRef.value?.setCheckedKeys([]);
  deptRef.value?.setCheckedKeys([]);
  replaceObject(form, emptyRoleForm());
  roleFormRef.value?.resetFields();
}

async function getMenuTreeselect(): Promise<void> {
  const response = await menuTreeselect();
  menuOptions.value = response.data ?? [];
}

async function getRoleMenuTreeselect(roleId: string) {
  const response = await roleMenuTreeselect(roleId);
  menuOptions.value = response.menus;
  return response;
}

async function getDeptTree(roleId: string) {
  const response = await deptTreeSelect(roleId);
  deptOptions.value = response.depts;
  return response;
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加角色";
  open.value = true;
  void getMenuTreeselect();
}

async function handleUpdate(row?: Role): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.roleId, selection.value.ids));
  if (id === undefined || isProtectedRole(id)) {
    return;
  }
  resetFormModel();
  const roleMenu = getRoleMenuTreeselect(id);
  const response = await getRole(id);
  replaceObject(form, roleToForm(response.data));
  title.value = "修改角色";
  open.value = true;
  await nextTick();
  const tree = await roleMenu;
  await nextTick();
  for (const key of tree.checkedKeys) {
    menuRef.value?.setChecked(key, true, false);
  }
}

async function submit(): Promise<void> {
  if (!(await submitForm(roleFormRef.value))) {
    return;
  }
  form.menuIds = collectCheckedTreeIds(menuRef.value);
  if (form.roleId) {
    await updateRole(form);
    ElMessage.success("修改成功");
  } else {
    await addRole(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: Role): Promise<void> {
  const ids = idsForAction(row, (item) => item.roleId, selection.value.ids);
  const values = Array.isArray(ids) ? ids : [ids];
  if (values.some((id) => isProtectedRole(id))) {
    ElMessage.warning("不允许操作超级管理员角色");
    return;
  }
  await ElMessageBox.confirm(confirmDeleteMessage("角色", ids), "警告", {
    type: "warning",
  });
  await delRole(ids);
  ElMessage.success("删除成功");
  await getList();
}

function handleExport(): void {
  void download("system/role/export", { ...queryParams }, `role_${Date.now()}.xlsx`);
}

async function handleStatusChange(row: Role): Promise<void> {
  if (isProtectedRole(row.roleId)) {
    row.status = row.status === "0" ? "1" : "0";
    return;
  }
  const text = statusChangeText(row.status);
  try {
    await ElMessageBox.confirm(`确认要"${text}""${row.roleName}"角色吗?`, "警告", {
      type: "warning",
    });
    await changeRoleStatus(row.roleId, row.status);
    ElMessage.success(`${text}成功`);
  } catch {
    row.status = row.status === "0" ? "1" : "0";
  }
}

function handleAuthUser(row: Role): void {
  if (isProtectedRole(row.roleId)) {
    return;
  }
  void router.push(`/system/role-auth/user/${row.roleId}`);
}

function handleCheckedTreeExpand(value: boolean | string | number, type: "menu" | "dept"): void {
  const expanded = Boolean(value);
  if (type === "menu") {
    setRootTreeExpand(menuRef.value, menuOptions.value, expanded);
  } else {
    setRootTreeExpand(deptRef.value, deptOptions.value, expanded);
  }
}

function handleCheckedTreeNodeAll(value: boolean | string | number, type: "menu" | "dept"): void {
  const checked = Boolean(value);
  if (type === "menu") {
    menuRef.value?.setCheckedNodes(checked ? menuOptions.value : []);
  } else {
    deptRef.value?.setCheckedNodes(checked ? deptOptions.value : []);
  }
}

function dataScopeSelectChange(value: string): void {
  if (value !== "2") {
    deptRef.value?.setCheckedKeys([]);
  }
}

async function handleDataScope(row: Role): Promise<void> {
  if (isProtectedRole(row.roleId)) {
    return;
  }
  resetFormModel();
  const deptTree = getDeptTree(row.roleId);
  const response = await getRole(row.roleId);
  replaceObject(form, roleToForm(response.data));
  title.value = "分配数据权限";
  openDataScope.value = true;
  const tree = await deptTree;
  await nextTick();
  deptRef.value?.setCheckedKeys(tree.checkedKeys);
}

async function submitDataScope(): Promise<void> {
  if (!form.roleId) {
    return;
  }
  form.deptIds = collectCheckedTreeIds(deptRef.value);
  await dataScope(form);
  ElMessage.success("修改成功");
  openDataScope.value = false;
  await getList();
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
        <el-button v-hasPermi="['system:role:add']" type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:edit']" type="success" plain :icon="Edit" :disabled="selection.single" @click="handleUpdate()">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:export']" type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="roleList"
      @selection-change="(rows: Role[]) => (selection = selectionFromRows(rows, (row) => row.roleId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="roleSort" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="{ row }">
          <template v-if="!isProtectedRole(row.roleId)">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:role:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
            <el-tooltip content="数据权限" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" :icon="CircleCheck" @click="handleDataScope(row)" />
            </el-tooltip>
            <el-tooltip content="分配用户" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" :icon="User" @click="handleAuthUser(row)" />
            </el-tooltip>
          </template>
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
      <el-form ref="roleFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如 admin" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="(value: boolean | string | number) => handleCheckedTreeExpand(value, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="(value: boolean | string | number) => handleCheckedTreeNodeAll(value, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly">父子联动</el-checkbox>
          <el-tree
            ref="menuRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="openDataScope" :title="title" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" disabled />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" disabled />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in DATA_SCOPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope === '2'" label="数据权限">
          <el-checkbox v-model="deptExpand" @change="(value: boolean | string | number) => handleCheckedTreeExpand(value, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="(value: boolean | string | number) => handleCheckedTreeNodeAll(value, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly">父子联动</el-checkbox>
          <el-tree
            ref="deptRef"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="openDataScope = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tree-border {
  margin-top: 5px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  border-radius: 4px;
}
</style>
