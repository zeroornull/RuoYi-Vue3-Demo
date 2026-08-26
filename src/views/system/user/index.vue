<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { CircleCheck, Delete, Download, Edit, Key, Plus, Refresh, Search, Upload } from "@element-plus/icons-vue";
import {
  addUser,
  changeUserStatus,
  delUser,
  deptTreeSelect,
  getUser,
  listUser,
  resetUserPwd,
  updateUser,
} from "../../../api/system/user";
import { getConfigKey } from "../../../api/system/config";
import { download } from "../../../http";
import ExcelImportDialog from "../../../components/ExcelImportDialog/index.vue";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import TreePanel from "../../../components/TreePanel/index.vue";
import { submitForm } from "../../../components/form";
import type { TreePanelNode } from "../../../components/TreePanel/model";
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
import { useUserStore } from "../../../stores/modules/user";
import { addDateRange } from "../../../utils/params";
import { parseTime } from "../../../utils/parse-time";
import type { TreeSelectNode } from "../../../types/api/common";
import type { Post, Role, SystemUser, UserUpsertRequest } from "../../../types/api/system";
import UserView from "./view.vue";
import {
  USER_PAGE_NAME,
  USER_PHONE_PATTERN,
  defaultColumnVisibility,
  emptyUserForm,
  emptyUserQuery,
  filterEnabledDeptTree,
  isProtectedUser,
  passwordFieldError,
  passwordPromptError,
  statusChangeText,
  toTreePanelData,
  userToForm,
} from "./model";

defineOptions({ name: USER_PAGE_NAME });

const router = useRouter();
const userStore = useUserStore();
const { sys_normal_disable, sys_user_sex } = useDict("sys_normal_disable", "sys_user_sex");
const queryRef = ref<FormInstance>();
const userRef = ref<FormInstance>();
const deptTreeRef = ref<{ setCurrentKey: (key: string | number | null) => void } | null>(null);
const userViewRef = ref<{ open: (userId: string) => void } | null>(null);
const importUserRef = ref<{ open: () => void } | null>(null);
const userList = ref<SystemUser[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const dateRange = ref<[string, string] | []>([]);
const initPassword = ref("123456");
const deptOptions = ref<TreeSelectNode[]>([]);
const enabledDeptOptions = ref<TreeSelectNode[]>([]);
const postOptions = ref<Post[]>([]);
const roleOptions = ref<Role[]>([]);
const queryParams = reactive(emptyUserQuery());
const form = reactive<UserUpsertRequest>(emptyUserForm());
const selection = ref(emptySelection<string>());
const columns = reactive(defaultColumnVisibility());
const deptTreeData = computed(() => toTreePanelData(deptOptions.value));

const passwordRules: FormRules<UserUpsertRequest> = {
  password: [
    {
      validator: (_rule, value: string, callback) => {
        if (form.userId) {
          callback();
          return;
        }
        const message = passwordFieldError(value, userStore.passwordCharacterType ?? "0");
        if (message) {
          callback(new Error(message));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

const rules: FormRules<UserUpsertRequest> = {
  userName: [
    { required: true, message: "用户名称不能为空", trigger: "blur" },
    { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" },
  ],
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  phonenumber: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || USER_PHONE_PATTERN.test(value)) {
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

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listUser(addDateRange({ ...queryParams }, dateRange.value));
    userList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

async function getDeptTree(): Promise<void> {
  const response = await deptTreeSelect();
  deptOptions.value = response.data ?? [];
  enabledDeptOptions.value = filterEnabledDeptTree(deptOptions.value);
}

function handleNodeClick(data: TreePanelNode): void {
  const id = data.id;
  if (typeof id !== "string" && typeof id !== "number") {
    return;
  }
  queryParams.deptId = String(id);
  handleQuery();
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function resetQuery(): void {
  dateRange.value = [];
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyUserQuery());
  deptTreeRef.value?.setCurrentKey(null);
  handleQuery();
}

function resetFormModel(): void {
  replaceObject(form, emptyUserForm(initPassword.value));
  userRef.value?.resetFields();
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加用户";
  open.value = true;
  void getUser().then((response) => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.password = initPassword.value;
  });
}

async function handleUpdate(row?: SystemUser): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.userId, selection.value.ids));
  if (id === undefined || isProtectedUser(id)) {
    return;
  }
  resetFormModel();
  const response = await getUser(id);
  if (!response.data) {
    return;
  }
  replaceObject(form, userToForm(response.data, response.postIds ?? [], response.roleIds ?? []));
  postOptions.value = response.posts;
  roleOptions.value = response.roles;
  title.value = "修改用户";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(userRef.value))) {
    return;
  }
  if (form.userId) {
    await updateUser(form);
    ElMessage.success("修改成功");
  } else {
    await addUser(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: SystemUser): Promise<void> {
  const ids = idsForAction(row, (item) => item.userId, selection.value.ids);
  const values = Array.isArray(ids) ? ids : [ids];
  if (values.some((id) => isProtectedUser(id))) {
    ElMessage.warning("不允许操作超级管理员用户");
    return;
  }
  await ElMessageBox.confirm(confirmDeleteMessage("用户", ids), "警告", {
    type: "warning",
  });
  await delUser(ids);
  ElMessage.success("删除成功");
  await getList();
}

function handleExport(): void {
  void download("system/user/export", { ...queryParams }, `user_${Date.now()}.xlsx`);
}

async function handleStatusChange(row: SystemUser): Promise<void> {
  if (isProtectedUser(row.userId)) {
    row.status = row.status === "0" ? "1" : "0";
    return;
  }
  const text = statusChangeText(row.status);
  try {
    await ElMessageBox.confirm(`确认要"${text}""${row.userName}"用户吗?`, "警告", {
      type: "warning",
    });
    await changeUserStatus(row.userId, row.status);
    ElMessage.success(`${text}成功`);
  } catch {
    row.status = row.status === "0" ? "1" : "0";
  }
}

async function handleResetPwd(row: SystemUser): Promise<void> {
  if (isProtectedUser(row.userId)) {
    return;
  }
  let value: string;
  try {
    const result = await ElMessageBox.prompt(`请输入「${row.userName}」的新密码`, "重置密码", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      closeOnClickModal: false,
      inputValidator: passwordPromptError,
    });
    value = result.value;
  } catch {
    return;
  }
  await resetUserPwd(row.userId, value);
  ElMessage.success(`修改成功，新密码是：${value}`);
}

function handleAuthRole(row: SystemUser): void {
  if (isProtectedUser(row.userId)) {
    return;
  }
  void router.push(`/system/user-auth/role/${row.userId}`);
}

function handleViewData(row: SystemUser): void {
  userViewRef.value?.open(row.userId);
}

onMounted(() => {
  void getDeptTree();
  void getList();
  void getConfigKey("sys.user.initPassword").then((response) => {
    if (response.data) {
      initPassword.value = response.data;
    }
  });
});
</script>

<template>
  <div class="app-container tree-sidebar-manage-wrap">
    <TreePanel
      ref="deptTreeRef"
      title="组织机构"
      :tree-data="deptTreeData"
      search-placeholder="请输入部门名称"
      storage-key="dept-sidebar-width"
      :default-expand-all="true"
      @node-click="handleNodeClick"
      @refresh="getDeptTree"
    />
    <div class="tree-sidebar-content">
      <div class="content-inner">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
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
            <el-button v-hasPermi="['system:user:add']" type="primary" plain :icon="Plus" @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:edit']"
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
              v-hasPermi="['system:user:remove']"
              type="danger"
              plain
              :icon="Delete"
              :disabled="selection.multiple"
              @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:import']"
              type="info"
              plain
              :icon="Upload"
              @click="importUserRef?.open()"
              >导入</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:user:export']" type="warning" plain :icon="Download" @click="handleExport"
              >导出</el-button
            >
          </el-col>
          <RightToolbar
            v-model:show-search="showSearch"
            :columns="columns"
            storage-key="user-list-columns"
            @query-table="getList"
          />
        </el-row>
        <el-table
          v-loading="loading"
          :data="userList"
          @selection-change="(rows: SystemUser[]) => (selection = selectionFromRows(rows, (row) => row.userId))"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column v-if="columns.userId.visible" label="用户编号" align="center" prop="userId" />
          <el-table-column
            v-if="columns.userName.visible"
            label="用户名称"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template #default="{ row }">
              <a class="link-type" @click="handleViewData(row)">{{ row.userName }}</a>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.nickName.visible"
            label="用户昵称"
            align="center"
            prop="nickName"
            :show-overflow-tooltip="true"
          />
          <el-table-column v-if="columns.deptName.visible" label="部门" align="center" :show-overflow-tooltip="true">
            <template #default="{ row }">{{ row.dept?.deptName }}</template>
          </el-table-column>
          <el-table-column
            v-if="columns.phonenumber.visible"
            label="手机号码"
            align="center"
            prop="phonenumber"
            width="120"
          />
          <el-table-column v-if="columns.status.visible" label="状态" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.createTime.visible"
            label="创建时间"
            align="center"
            prop="createTime"
            width="160"
          >
            <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150">
            <template #default="{ row }">
              <template v-if="!isProtectedUser(row.userId)">
                <el-tooltip content="修改" placement="top">
                  <el-button
                    v-hasPermi="['system:user:edit']"
                    link
                    type="primary"
                    :icon="Edit"
                    @click="handleUpdate(row)"
                  />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button
                    v-hasPermi="['system:user:remove']"
                    link
                    type="primary"
                    :icon="Delete"
                    @click="handleDelete(row)"
                  />
                </el-tooltip>
                <el-tooltip content="重置密码" placement="top">
                  <el-button
                    v-hasPermi="['system:user:resetPwd']"
                    link
                    type="primary"
                    :icon="Key"
                    @click="handleResetPwd(row)"
                  />
                </el-tooltip>
                <el-tooltip content="分配角色" placement="top">
                  <el-button
                    v-hasPermi="['system:user:edit']"
                    link
                    type="primary"
                    :icon="CircleCheck"
                    @click="handleAuthRole(row)"
                  />
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
      </div>
    </div>
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                clearable
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="!form.userId" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="!form.userId" label="用户密码" prop="password" :rules="passwordRules.password">
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
    <UserView ref="userViewRef" />
    <ExcelImportDialog
      ref="importUserRef"
      title="用户导入"
      action="/system/user/importData"
      template-action="/system/user/importTemplate"
      template-file-name="user_template"
      update-support-label="是否更新已经存在的用户数据"
      @success="getList"
    />
  </div>
</template>
