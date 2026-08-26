<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { Refresh, Search } from "@element-plus/icons-vue";
import type { TableInstance } from "element-plus";
import { authUserSelectAll, unallocatedUserList } from "../../../api/system/role";
import Pagination from "../../../components/Pagination/index.vue";
import { useDict } from "../../../composables/useDict";
import { firstPage, replaceObject } from "../../../composables/crud";
import { parseTime } from "../../../utils/parse-time";
import type { SystemUser } from "../../../types/api/system";
import { SELECT_USER_PAGE_NAME } from "./model";

defineOptions({ name: SELECT_USER_PAGE_NAME });

const props = defineProps<{
  roleId: string;
}>();

const emit = defineEmits<{
  ok: [];
}>();

const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const tableRef = ref<TableInstance>();
const visible = ref(false);
const total = ref(0);
const userList = ref<SystemUser[]>([]);
const userIds = ref<string[]>([]);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: props.roleId,
  userName: "",
  phonenumber: "",
});

async function getList(): Promise<void> {
  queryParams.roleId = props.roleId;
  const response = await unallocatedUserList({ ...queryParams });
  userList.value = response.rows;
  total.value = response.total;
}

function show(): void {
  queryParams.roleId = props.roleId;
  queryParams.pageNum = 1;
  userIds.value = [];
  visible.value = true;
  void getList();
}

function clickRow(row: SystemUser): void {
  tableRef.value?.toggleRowSelection(row);
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
    roleId: props.roleId,
    userName: "",
    phonenumber: "",
  });
  handleQuery();
}

async function handleSelectUser(): Promise<void> {
  if (userIds.value.length === 0) {
    ElMessage.error("请选择要分配的用户");
    return;
  }
  const response = await authUserSelectAll({
    roleId: props.roleId,
    userIds: userIds.value.join(","),
  });
  ElMessage.success(response.msg ?? "授权成功");
  visible.value = false;
  emit("ok");
}

defineExpose({ show });
</script>

<template>
  <el-dialog v-model="visible" title="选择用户" width="800px" top="5vh" append-to-body>
    <el-form ref="queryRef" :model="queryParams" :inline="true">
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
    <el-table
      ref="tableRef"
      :data="userList"
      height="260px"
      @row-click="clickRow"
      @selection-change="(rows: SystemUser[]) => (userIds = rows.map((row) => row.userId))"
    >
      <el-table-column type="selection" width="55" />
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
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <template #footer>
      <el-button v-hasPermi="['system:role:add']" type="primary" @click="handleSelectUser">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>
