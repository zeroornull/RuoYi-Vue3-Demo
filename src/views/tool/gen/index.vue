<script setup lang="ts">
import { computed, onActivated, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance, TableInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Edit, Plus, Refresh, Search, Upload, View } from "@element-plus/icons-vue";
import { saveAs } from "file-saver";
import { delTable, downloadGeneratedCode, genCode, listTable, previewTable, synchDb } from "../../../api/tool/gen";
import Pagination from "../../../components/Pagination/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
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
import { checkRole } from "../../../utils/permission";
import type { GeneratorTable } from "../../../types/api/tool";
import CreateTable from "./createTable.vue";
import ImportTable from "./importTable.vue";
import {
  GEN_DEFAULT_SORT,
  GEN_PAGE_NAME,
  emptyGenQuery,
  genEditPath,
  tableSortToQuery,
  toPreviewFiles,
  zipDownloadName,
  type PreviewFile,
  type TableSortEvent,
} from "./model";

defineOptions({ name: GEN_PAGE_NAME });

type DialogHandle = { show: () => void };

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const canCreateTable = computed(() => checkRole(userStore.roles, ["admin"]));
const queryRef = ref<FormInstance>();
const tableRef = ref<TableInstance>();
const importRef = ref<DialogHandle>();
const createRef = ref<DialogHandle>();
const tableList = ref<GeneratorTable[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[string, string] | []>([]);
const queryParams = reactive(emptyGenQuery());
const selection = ref(emptySelection<string>());
const previewOpen = ref(false);
const previewActive = ref("");
const previewFiles = ref<PreviewFile[]>([]);
const listStamp = ref("");

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listTable(addDateRange({ ...queryParams }, dateRange.value));
    tableList.value = response.rows;
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
  replaceObject(queryParams, emptyGenQuery());
  tableRef.value?.sort(GEN_DEFAULT_SORT.prop, GEN_DEFAULT_SORT.order);
  handleQuery();
}

function handleSortChange(sort: TableSortEvent): void {
  const mapped = tableSortToQuery(sort);
  queryParams.orderByColumn = mapped.orderByColumn ?? GEN_DEFAULT_SORT.prop;
  queryParams.isAsc = mapped.isAsc ?? "desc";
  void getList();
}

function openImportTable(): void {
  importRef.value?.show();
}

function openCreateTable(): void {
  createRef.value?.show();
}

function handleEditTable(row?: GeneratorTable): void {
  const tableId = row?.tableId ?? asSingleId(selection.value.ids);
  if (tableId === undefined) {
    return;
  }
  void router.push({
    path: genEditPath(String(tableId)),
    query: { pageNum: String(queryParams.pageNum) },
  });
}

async function handleDelete(row?: GeneratorTable): Promise<void> {
  const ids = idsForAction(row, (item) => item.tableId, selection.value.ids);
  await ElMessageBox.confirm(confirmDeleteMessage("表", ids), "警告", { type: "warning" });
  await delTable(ids);
  ElMessage.success("删除成功");
  await getList();
}

async function handleSynchDb(row: GeneratorTable): Promise<void> {
  await ElMessageBox.confirm(`确认要强制同步"${row.tableName}"表结构吗？`, "警告", {
    type: "warning",
  });
  await synchDb(row.tableName);
  ElMessage.success("同步成功");
}

function selectedNames(row?: GeneratorTable): string[] {
  if (row) {
    return [row.tableName];
  }
  return (selection.value.rows as GeneratorTable[]).map((item) => item.tableName);
}

async function handlePreview(row: GeneratorTable): Promise<void> {
  const response = await previewTable(row.tableId);
  previewFiles.value = toPreviewFiles(response.data ?? {});
  previewActive.value = previewFiles.value[0]?.key ?? "";
  previewOpen.value = true;
}

async function copyPreview(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
  ElMessage.success("复制成功");
}

async function handleGenTable(row?: GeneratorTable): Promise<void> {
  const names = selectedNames(row);
  if (names.length === 0) {
    ElMessage.error("请选择要生成的数据");
    return;
  }
  if (row?.genType === "1") {
    await genCode(row.tableName);
    ElMessage.success(`成功生成到自定义路径：${row.genPath ?? "/"}`);
    return;
  }
  const blob = await downloadGeneratedCode(names);
  saveAs(blob, zipDownloadName(names));
}

onActivated(() => {
  const stamp = route.query.t;
  if (typeof stamp === "string" && stamp !== listStamp.value) {
    listStamp.value = stamp;
    if (typeof route.query.pageNum === "string") {
      queryParams.pageNum = Number(route.query.pageNum) || 1;
    }
    void getList();
  }
});

onMounted(() => {
  void getList();
});
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="请输入表描述"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
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
        <el-button
          v-hasPermi="['tool:gen:code']"
          type="primary"
          plain
          :icon="Download"
          :disabled="selection.multiple"
          @click="handleGenTable()"
        >
          生成
        </el-button>
      </el-col>
      <el-col v-if="canCreateTable" :span="1.5">
        <el-button type="primary" plain :icon="Plus" @click="openCreateTable">创建</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['tool:gen:import']" type="info" plain :icon="Upload" @click="openImportTable"
          >导入</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['tool:gen:edit']"
          type="success"
          plain
          :icon="Edit"
          :disabled="selection.single"
          @click="handleEditTable()"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['tool:gen:remove']"
          type="danger"
          plain
          :icon="Delete"
          :disabled="selection.multiple"
          @click="handleDelete()"
        >
          删除
        </el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableList"
      :default-sort="GEN_DEFAULT_SORT"
      @selection-change="(rows: GeneratorTable[]) => (selection = selectionFromRows(rows, (row) => row.tableId))"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="表名称" align="center" prop="tableName" show-overflow-tooltip />
      <el-table-column label="表描述" align="center" prop="tableComment" show-overflow-tooltip />
      <el-table-column label="实体" align="center" prop="className" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="160"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        width="160"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-hasPermi="['tool:gen:preview']" link type="primary" :icon="View" @click="handlePreview(row)">
            预览
          </el-button>
          <el-button v-hasPermi="['tool:gen:edit']" link type="primary" :icon="Edit" @click="handleEditTable(row)">
            编辑
          </el-button>
          <el-button v-hasPermi="['tool:gen:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
          <el-button v-hasPermi="['tool:gen:edit']" link type="primary" :icon="Refresh" @click="handleSynchDb(row)">
            同步
          </el-button>
          <el-button v-hasPermi="['tool:gen:code']" link type="primary" :icon="Download" @click="handleGenTable(row)">
            生成
          </el-button>
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

    <ImportTable ref="importRef" @ok="handleQuery" />
    <CreateTable ref="createRef" @ok="handleQuery" />

    <el-dialog v-model="previewOpen" title="代码预览" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="previewActive">
        <el-tab-pane v-for="file in previewFiles" :key="file.key" :label="file.label" :name="file.key">
          <el-button link type="primary" style="float: right" @click="copyPreview(file.content)">复制</el-button>
          <pre>{{ file.content }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
