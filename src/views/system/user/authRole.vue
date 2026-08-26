<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { TableInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { getAuthRole, updateAuthRole } from "../../../api/system/user";
import Pagination from "../../../components/Pagination/index.vue";
import { useTagsViewStore } from "../../../stores/modules/tags-view";
import { parseTime } from "../../../utils/parse-time";
import { parseSingleRouteParam } from "../../../router/params";
import { closeCurrentPage } from "../../profile/close";
import type { SystemUser } from "../../../types/api/system";
import {
  AUTH_ROLE_PAGE_NAME,
  assignedRoleIds,
  type AuthRoleRow,
} from "./model";

defineOptions({ name: AUTH_ROLE_PAGE_NAME });

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsViewStore();
const roleRef = ref<TableInstance>();
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const roleIds = ref<string[]>([]);
const roles = ref<AuthRoleRow[]>([]);
const form = ref<Pick<SystemUser, "userId" | "userName" | "nickName"> | null>(null);

const pagedRoles = () =>
  roles.value.slice((pageNum.value - 1) * pageSize.value, pageNum.value * pageSize.value);

function clickRow(row: AuthRoleRow): void {
  if (row.status === "0") {
    roleRef.value?.toggleRowSelection(row);
  }
}

function handleSelectionChange(selection: AuthRoleRow[]): void {
  roleIds.value = selection.map((row) => row.roleId);
}

function checkSelectable(row: AuthRoleRow): boolean {
  return row.status === "0";
}

function close(): void {
  closeCurrentPage(router, route, tagsStore);
}

async function submit(): Promise<void> {
  const userId = form.value?.userId;
  if (!userId) {
    return;
  }
  await updateAuthRole({ userId, roleIds: roleIds.value.join(",") });
  ElMessage.success("授权成功");
  close();
}

async function load(): Promise<void> {
  const userId = parseSingleRouteParam(route.params.userId);
  if (!userId) {
    return;
  }
  loading.value = true;
  try {
    const response = await getAuthRole(userId);
    form.value = {
      userId: response.user.userId,
      userName: response.user.userName,
      nickName: response.user.nickName,
    };
    roles.value = response.roles as AuthRoleRow[];
    total.value = roles.value.length;
    roleIds.value = assignedRoleIds(roles.value);
    await nextTick();
    for (const row of roles.value) {
      if (row.flag) {
        roleRef.value?.toggleRowSelection(row, true);
      }
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="app-container">
    <h4 class="form-header">基本信息</h4>
    <el-form :model="form ?? {}" label-width="80px">
      <el-row>
        <el-col :span="8" :offset="2">
          <el-form-item label="用户昵称">
            <el-input :model-value="form?.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <el-form-item label="登录账号">
            <el-input :model-value="form?.userName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <h4 class="form-header">角色信息</h4>
    <el-table
      ref="roleRef"
      v-loading="loading"
      :data="pagedRoles()"
      row-key="roleId"
      @row-click="clickRow"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="序号" width="55" align="center">
        <template #default="{ $index }">{{ (pageNum - 1) * pageSize + $index + 1 }}</template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true" :selectable="checkSelectable" width="55" />
      <el-table-column label="角色编号" align="center" prop="roleId" />
      <el-table-column label="角色名称" align="center" prop="roleName" />
      <el-table-column label="权限字符" align="center" prop="roleKey" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
    <div class="auth-actions">
      <el-button v-hasPermi="['system:user:edit']" type="primary" @click="submit">提交</el-button>
      <el-button @click="close">返回</el-button>
    </div>
  </div>
</template>

<style scoped>
.form-header {
  padding-bottom: 8px;
  margin: 8px 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.auth-actions {
  margin-top: 30px;
  text-align: center;
}
</style>
