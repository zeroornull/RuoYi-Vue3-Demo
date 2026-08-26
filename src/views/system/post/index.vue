<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Edit, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { addPost, delPost, getPost, listPost, updatePost } from "../../../api/system/post";
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
import { parseTime } from "../../../utils/parse-time";
import type { Post, PostUpsertRequest } from "../../../types/api/system";
import { POST_PAGE_NAME, emptyPostForm, emptyPostQuery, postToForm } from "./model";

defineOptions({ name: POST_PAGE_NAME });

const { sys_normal_disable } = useDict("sys_normal_disable");
const queryRef = ref<FormInstance>();
const postRef = ref<FormInstance>();
const list = ref<Post[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const queryParams = reactive(emptyPostQuery());
const form = reactive<PostUpsertRequest>(emptyPostForm());
const selection = ref(emptySelection<string>());
const rules: FormRules<PostUpsertRequest> = {
  postName: [{ required: true, message: "岗位名称不能为空", trigger: "blur" }],
  postCode: [{ required: true, message: "岗位编码不能为空", trigger: "blur" }],
  postSort: [{ required: true, message: "岗位顺序不能为空", trigger: "blur" }],
};

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listPost({ ...queryParams });
    list.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function resetFormModel(): void {
  replaceObject(form, emptyPostForm());
  postRef.value?.resetFields();
}

function handleQuery(): void {
  Object.assign(queryParams, firstPage(queryParams));
  void getList();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyPostQuery());
  handleQuery();
}

function handleAdd(): void {
  resetFormModel();
  title.value = "添加岗位";
  open.value = true;
}

async function handleUpdate(row?: Post): Promise<void> {
  const id = asSingleId(idsForAction(row, (item) => item.postId, selection.value.ids));
  if (id === undefined) {
    return;
  }
  const response = await getPost(id);
  replaceObject(form, postToForm(response.data));
  title.value = "修改岗位";
  open.value = true;
}

async function submit(): Promise<void> {
  if (!(await submitForm(postRef.value))) return;
  if (form.postId) {
    await updatePost(form);
    ElMessage.success("修改成功");
  } else {
    await addPost(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleDelete(row?: Post): Promise<void> {
  const ids = idsForAction(row, (item) => item.postId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("岗位", ids), "警告", { type: "warning" });
  await delPost(ids);
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
      <el-form-item label="岗位编码" prop="postCode">
        <el-input v-model="queryParams.postCode" placeholder="请输入岗位编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="queryParams.postName" placeholder="请输入岗位名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable>
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
        <el-button v-hasPermi="['system:post:add']" type="primary" plain :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:post:edit']"
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
          v-hasPermi="['system:post:remove']"
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
          v-hasPermi="['system:post:export']"
          type="warning"
          plain
          :icon="Download"
          @click="download('system/post/export', { ...queryParams }, `post_${Date.now()}.xlsx`)"
          >导出</el-button
        >
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-loading="loading"
      :data="list"
      @selection-change="(rows: Post[]) => (selection = selectionFromRows(rows, (row) => row.postId))"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="岗位编号" align="center" prop="postId" />
      <el-table-column label="岗位编码" align="center" prop="postCode" />
      <el-table-column label="岗位名称" align="center" prop="postName" />
      <el-table-column label="岗位排序" align="center" prop="postSort" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }"><DictTag :options="sys_normal_disable" :value="row.status" /></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">{{ parseTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:post:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)"
            >修改</el-button
          >
          <el-button v-hasPermi="['system:post:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)"
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
      <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位名称" prop="postName"
          ><el-input v-model="form.postName" placeholder="请输入岗位名称"
        /></el-form-item>
        <el-form-item label="岗位编码" prop="postCode"
          ><el-input v-model="form.postCode" placeholder="请输入编码名称"
        /></el-form-item>
        <el-form-item label="岗位顺序" prop="postSort"
          ><el-input-number v-model="form.postSort" controls-position="right" :min="0"
        /></el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
