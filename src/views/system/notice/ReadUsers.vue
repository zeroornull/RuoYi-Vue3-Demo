<script setup lang="ts">
import { reactive, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { listNoticeReadUsers } from "../../../api/system/notice";
import Pagination from "../../../components/Pagination/index.vue";
import { parseTime } from "../../../utils/parse-time";
import type { Notice, NoticeReadUser } from "../../../types/api/system";
import { firstPage, replaceObject } from "../../../composables/crud";
import { emptyNoticeReadQuery } from "./model";

const visible = ref(false);
const loading = ref(false);
const noticeTitle = ref("");
const total = ref(0);
const userList = ref<NoticeReadUser[]>([]);
const queryParams = reactive(emptyNoticeReadQuery(""));

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listNoticeReadUsers({ ...queryParams });
    userList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function open(row: Notice): void {
  replaceObject(queryParams, emptyNoticeReadQuery(row.noticeId));
  noticeTitle.value = row.noticeTitle;
  visible.value = true;
  void getList();
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

defineExpose({ open });
</script>

<template>
  <el-dialog v-model="visible" :title="`「${noticeTitle}」已读用户`" width="760px" append-to-body>
    <el-form :model="queryParams" :inline="true">
      <el-form-item>
        <el-input v-model="queryParams.searchValue" placeholder="登录名称 / 用户名称" clearable :prefix-icon="Search" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <span>共 <strong>{{ total }}</strong> 人已读</span>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="userList" stripe height="340">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="登录名称" prop="userName" align="center" />
      <el-table-column label="用户名称" prop="nickName" align="center" />
      <el-table-column label="所属部门" prop="deptName" align="center" />
      <el-table-column label="手机号码" prop="phonenumber" align="center" width="120" />
      <el-table-column label="阅读时间" prop="readTime" align="center" width="160">
        <template #default="{ row }">{{ parseTime(row.readTime) }}</template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </el-dialog>
</template>
