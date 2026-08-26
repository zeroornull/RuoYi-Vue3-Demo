<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { CircleClose, Close, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { allocatedUserList, authUserCancel, authUserCancelAll } from "../../../api/system/role";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import { useDict } from "../../../composables/useDict";
import { emptySelection, firstPage, replaceObject, selectionFromRows } from "../../../composables/crud";
import { parseSingleRouteParam } from "../../../router/params";
import { useTagsViewStore } from "../../../stores/modules/tags-view";
import { parseTime } from "../../../utils/parse-time";
import { closeCurrentPage } from "../../profile/close";
import type { SystemUser } from "../../../types/api/system";
import { AUTH_USER_PAGE_NAME } from "./model";
import SelectUser from "./selectUser.vue";

defineOptions({ name: AUTH_USER_PAGE_NAME });

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsViewStore();
const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const selectRef = ref<{ show: () => void } | null>(null);
const userList = ref<SystemUser[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const selection = ref(emptySelection<string>());
const roleId = parseSingleRouteParam(route.params.roleId) ?? "";
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId,
  userName: "",
  phonenumber: "",
});

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await allocatedUserList({ ...queryParams });
    userList.value = response.rows;
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
  queryRef.value?.resetFields();
  replaceObject(queryParams, {
    pageNum: 1,
    pageSize: 10,
    roleId,
    userName: "",
    phonenumber: "",
  });
  handleQuery();
}

function handleClose(): void {
  closeCurrentPage(router, route, tagsStore);
}

async function cancelAuthUser(row: SystemUser): Promise<void> {
  await ElMessageBox.confirm(`确认要取消该用户"${row.userName}"角色吗？`, "警告", {
    type: "warning",
  });
  await authUserCancel({ userId: row.userId, roleId: queryParams.roleId });
  ElMessage.success("取消授权成功");
  await getList();
}

async function cancelAuthUserAll(): Promise<void> {
  if (selection.value.ids.length === 0) {
    ElMessage.error("请选择要取消授权的用户");
    return;
  }
  await ElMessageBox.confirm("是否取消选中用户授权数据项?", "警告", {
    type: "warning",
  });
  await authUserCancelAll({
    roleId: queryParams.roleId,
    userIds: selection.value.ids.join(","),
  });
  ElMessage.success("取消授权成功");
  await getList();
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:add']" type="primary" plain :icon="Plus" @click="selectRef?.show()"
          >添加用户</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:remove']"
          type="danger"
          plain
          :icon="CircleClose"
          :disabled="selection.multiple"
          @click="cancelAuthUserAll"
          >批量取消授权</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain :icon="Close" @click="handleClose">关闭</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="(rows: SystemUser[]) => (selection = selectionFromRows(rows, (row) => row.userId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['system:role:remove']"
            link
            type="primary"
            :icon="CircleClose"
            @click="cancelAuthUser(row)"
            >取消授权</el-button
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
    <SelectUser ref="selectRef" :role-id="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>
