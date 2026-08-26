<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Plus, Refresh, Search, User } from "@element-plus/icons-vue";
import { addNotice, delNotice, getNotice, listNotice, updateNotice } from "../../../api/system/notice";
import Editor from "../../../components/Editor/index.vue";
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
import { parseTime } from "../../../utils/parse-time";
import type { Notice, NoticeUpsertRequest } from "../../../types/api/system";
import {
  NOTICE_PAGE_NAME,
  emptyNoticeForm,
  emptyNoticeQuery,
  noticeToForm,
} from "./model";
import ReadUsers from "./ReadUsers.vue";

defineOptions({ name: NOTICE_PAGE_NAME });

const { sys_notice_status, sys_notice_type } = useDict(
  "sys_notice_status",
  "sys_notice_type",
);
const queryRef = ref<FormInstance>();
const noticeRef = ref<FormInstance>();
const readUsersRef = ref<InstanceType<typeof ReadUsers>>();
const list = ref<Notice[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const preview = ref(false);
const previewRow = ref<Notice | null>(null);
const title = ref("");
const queryParams = reactive(emptyNoticeQuery());
const form = reactive<NoticeUpsertRequest>(emptyNoticeForm());
const selection = ref(emptySelection<string>());
const rules: FormRules<NoticeUpsertRequest> = {
  noticeTitle: [{ required: true, message: "公告标题不能为空", trigger: "blur" }],
  noticeType: [{ required: true, message: "公告类型不能为空", trigger: "change" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listNotice({ ...queryParams });
    list.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function resetFormModel(): void {
  replaceObject(form, emptyNoticeForm());
  noticeRef.value?.resetFields();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyNoticeQuery());
  handleQuery();
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加公告";
  open.value = true;
}

async function handleUpdate(row?: Notice): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.noticeId, selection.value.ids));
  if (id === undefined) {
    return;
  }
  const response = await getNotice(id);
  replaceObject(form, noticeToForm(response.data));
  title.value = "修改公告";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(noticeRef.value))) return;
  if (form.noticeId) {
    await updateNotice(form);
    ElMessage.success("修改成功");
  } else {
    await addNotice(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: Notice): Promise<void> {
  const ids = idsForAction(row, (item) => item.noticeId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("公告", ids), "警告", { type: "warning" });
  await delNotice(ids);
  ElMessage.success("删除成功");
  await getList();
}

function handleViewData(row: Notice): void {
  previewRow.value = row;
  preview.value = true;
}

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input v-model="queryParams.createBy" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
          <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:notice:add']" type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:notice:edit']" type="success" plain :icon="Edit" :disabled="selection.single" @click="handleUpdate()">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:notice:remove']" type="danger" plain :icon="Delete" :disabled="selection.multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table v-loading="loading" :data="list" @selection-change="(rows: Notice[]) => (selection = selectionFromRows(rows, (row) => row.noticeId))">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="noticeId" width="100" />
      <el-table-column label="公告标题" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <a class="link-type" @click="handleViewData(row)">{{ row.noticeTitle }}</a>
        </template>
      </el-table-column>
      <el-table-column label="公告类型" align="center" width="100">
        <template #default="{ row }"><DictTag :options="sys_notice_type" :value="row.noticeType" /></template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }"><DictTag :options="sys_notice_status" :value="row.status" /></template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" width="120">
        <template #default="{ row }">{{ parseTime(row.createTime, "{y}-{m}-{d}") }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:notice:list']" link type="primary" :icon="User" @click="readUsersRef?.open(row)">阅读用户</el-button>
          <el-button v-hasPermi="['system:notice:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button v-hasPermi="['system:notice:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog v-model="open" :title="title" width="780px" append-to-body>
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告类型" prop="noticeType">
          <el-select v-model="form.noticeType" placeholder="请选择">
            <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_notice_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容">
          <Editor v-model="form.noticeContent" :min-height="192" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="preview" title="公告预览" width="700px" append-to-body>
      <h3>{{ previewRow?.noticeTitle }}</h3>
      <div v-html="previewRow?.noticeContent" />
    </el-dialog>
    <ReadUsers ref="readUsersRef" />
  </div>
</template>
