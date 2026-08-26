<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Refresh, Search } from "@element-plus/icons-vue";
import { forceLogout, list as listOnline } from "../../../api/monitor/online";
import Pagination from "../../../components/Pagination/index.vue";
import { replaceObject } from "../../../composables/crud";
import { parseTime } from "../../../utils/parse-time";
import type { OnlineUser } from "../../../types/api/monitor";
import { ONLINE_PAGE_NAME, emptyOnlineQuery, paginateOnline } from "./model";

defineOptions({ name: ONLINE_PAGE_NAME });

const queryRef = ref<FormInstance>();
const onlineList = ref<OnlineUser[]>([]);
const loading = ref(false);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const queryParams = reactive(emptyOnlineQuery());
const pagedRows = computed(() => paginateOnline(onlineList.value, pageNum.value, pageSize.value));

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listOnline({ ...queryParams });
    onlineList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  pageNum.value = 1;
  void getList();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyOnlineQuery());
  handleQuery();
}

async function handleForceLogout(row: OnlineUser): Promise<void> {
  await ElMessageBox.confirm(`是否确认强退名称为"${row.userName}"的用户?`, "警告", {
    type: "warning",
  });
  await forceLogout(row.tokenId);
  ElMessage.success("删除成功");
  await getList();
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="pagedRows" style="width: 100%">
      <el-table-column label="序号" width="50" type="index" align="center">
        <template #default="{ $index }">{{ (pageNum - 1) * pageSize + $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="所属部门" align="center" prop="deptName" :show-overflow-tooltip="true" />
      <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
        <template #default="{ row }">{{ parseTime(row.loginTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['monitor:online:forceLogout']"
            link
            type="primary"
            :icon="Delete"
            @click="handleForceLogout(row)"
            >强退</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
  </div>
</template>
