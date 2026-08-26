<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Delete, Edit, Plus, QuestionFilled, Refresh, Search, Sort } from "@element-plus/icons-vue";
import { addMenu, delMenu, getMenu, listMenu, updateMenu, updateMenuSort } from "../../../api/system/menu";
import IconSelect from "../../../components/IconSelect/index.vue";
import RightToolbar from "../../../components/RightToolbar/index.vue";
import SvgIcon from "../../../components/SvgIcon.vue";
import { submitForm } from "../../../components/form";
import { useDict } from "../../../composables/useDict";
import { replaceObject } from "../../../composables/crud";
import {
  collectChangedSort,
  confirmDeleteName,
  excludeSelfAndDescendants,
  recordOrders,
} from "../../../utils/tree-edit";
import type { Menu, MenuUpsertRequest } from "../../../types/api/system";
import {
  MENU_PAGE_NAME,
  MENU_ROOT_ID,
  emptyMenuForm,
  emptyMenuQuery,
  menuToForm,
  toMenuParentOptions,
  toMenuTree,
  withMenuRoot,
  type MenuParentOption,
  type MenuTreeNode,
} from "./model";

defineOptions({ name: MENU_PAGE_NAME });

const { sys_normal_disable, sys_show_hide } = useDict("sys_normal_disable", "sys_show_hide");
const queryRef = ref<FormInstance>();
const menuRef = ref<FormInstance>();
const iconSelectRef = ref<{ reset: () => void } | null>(null);
const menuList = ref<MenuTreeNode[]>([]);
const menuOptions = ref<MenuParentOption[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const isExpandAll = ref(false);
const refreshTable = ref(true);
const originalOrders = ref<Record<string, number>>({});
const queryParams = reactive(emptyMenuQuery());
const form = reactive<MenuUpsertRequest>(emptyMenuForm());

const rules = computed<FormRules<MenuUpsertRequest>>(() => ({
  menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
  path: form.menuType === "F" ? [] : [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
}));

function rememberOrders(nodes: readonly MenuTreeNode[]): void {
  originalOrders.value = recordOrders(
    nodes,
    (row) => row.menuId,
    (row) => row.orderNum,
    (row) => row.children,
  );
}

async function getList(): Promise<void> {
  loading.value = true;
  try {
    const response = await listMenu({ ...queryParams });
    menuList.value = toMenuTree(response.data ?? []);
    rememberOrders(menuList.value);
  } finally {
    loading.value = false;
  }
}

function resetFormModel(parentId = MENU_ROOT_ID): void {
  replaceObject(form, emptyMenuForm(parentId));
  menuRef.value?.resetFields();
}

function handleQuery(): void {
  void getList();
}

function resetQuery(): void {
  queryRef.value?.resetFields();
  replaceObject(queryParams, emptyMenuQuery());
  handleQuery();
}

async function loadParentOptions(excludeId?: string): Promise<void> {
  const response = await listMenu();
  let options = toMenuParentOptions(toMenuTree(response.data ?? []));
  if (excludeId) {
    options = excludeSelfAndDescendants(
      options,
      excludeId,
      (row) => row.menuId,
      (row) => row.children,
    );
  }
  menuOptions.value = withMenuRoot(options);
}

function handleAdd(row?: Menu): void {
  resetFormModel(row?.menuId ?? MENU_ROOT_ID);
  title.value = "添加菜单";
  open.value = true;
  void loadParentOptions();
}

function toggleExpandAll(): void {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  void nextTick(() => {
    refreshTable.value = true;
  });
}

async function handleUpdate(row: Menu): Promise<void> {
  resetFormModel();
  await loadParentOptions(row.menuId);
  const response = await getMenu(row.menuId);
  replaceObject(form, menuToForm(response.data));
  title.value = "修改菜单";
  open.value = true;
}

function selectedIcon(name: string): void {
  form.icon = name;
}

function showSelectIcon(): void {
  iconSelectRef.value?.reset();
}

async function submit(): Promise<void> {
  if (!(await submitForm(menuRef.value))) {
    return;
  }
  if (form.menuId) {
    await updateMenu(form);
    ElMessage.success("修改成功");
  } else {
    await addMenu(form);
    ElMessage.success("新增成功");
  }
  open.value = false;
  await getList();
}

async function handleSaveSort(): Promise<void> {
  const change = collectChangedSort(
    menuList.value,
    originalOrders.value,
    (row) => row.menuId,
    (row) => row.orderNum,
    (row) => row.children,
  );
  if (!change) {
    ElMessage.warning("未检测到排序修改");
    return;
  }
  await updateMenuSort(change);
  ElMessage.success("排序保存成功");
  rememberOrders(menuList.value);
}

async function handleDelete(row: Menu): Promise<void> {
  await ElMessageBox.confirm(confirmDeleteName("菜单", row.menuName), "警告", {
    type: "warning",
  });
  await delMenu(row.menuId);
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
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
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
        <el-button v-hasPermi="['system:menu:add']" type="primary" plain :icon="Plus" @click="handleAdd()"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:menu:edit']" type="warning" plain :icon="Check" @click="handleSaveSort"
          >保存排序</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain :icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="220">
        <template #default="{ row }">
          <SvgIcon v-if="row.icon" :name="row.icon" :size="14" />
          <span class="ml5">{{ row.menuName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.menuType === 'M' && row.isFrame === '0'" type="danger" size="small">外链</el-tag>
          <el-tag v-else-if="row.menuType === 'M'" type="primary" size="small">目录</el-tag>
          <el-tag v-else-if="row.menuType === 'C' && row.isFrame === '0'" type="danger" size="small">外链</el-tag>
          <el-tag v-else-if="row.menuType === 'C'" type="success" size="small">菜单</el-tag>
          <el-tag v-else type="warning" size="small">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200">
        <template #default="{ row }">
          <el-input-number v-model="row.orderNum" controls-position="right" :min="0" style="width: 88px" />
        </template>
      </el-table-column>
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true" />
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <DictTag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="210">
        <template #default="{ row }">
          <el-button v-hasPermi="['system:menu:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)"
            >修改</el-button
          >
          <el-button v-hasPermi="['system:menu:add']" link type="primary" :icon="Plus" @click="handleAdd(row)"
            >新增</el-button
          >
          <el-button v-hasPermi="['system:menu:remove']" link type="primary" :icon="Delete" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="open" :title="title" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">目录</el-radio>
                <el-radio value="C">菜单</el-radio>
                <el-radio value="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" :width="540" trigger="click">
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly @blur="showSelectIcon">
                    <template #prefix>
                      <SvgIcon v-if="form.icon" :name="form.icon" :size="16" />
                      <el-icon v-else :size="16"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <IconSelect ref="iconSelectRef" :active-icon="form.icon ?? ''" @selected="selectedIcon" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item prop="routeName">
              <template #label>
                <span>
                  <el-tooltip
                    content="默认不填则和路由地址相同。router 会删除名称相同的路由，请保证唯一。"
                    placement="top"
                  >
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由名称
                </span>
              </template>
              <el-input v-model="form.routeName" placeholder="请输入路由名称" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择是外链则路由地址需要以 http(s):// 开头" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  是否外链
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio value="0">是</el-radio>
                <el-radio value="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip content="访问的路由地址，如 user；外网地址需以 http(s):// 开头" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip content="访问的组件路径，如 system/user/index" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'M'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如 system:user:list" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content='访问路由的默认参数，如 {"id": 1}' placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由参数
                </span>
              </template>
              <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择是则会被 keep-alive 缓存，需要匹配组件 name" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio value="0">缓存</el-radio>
                <el-radio value="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择隐藏则路由不会出现在侧边栏，但仍可访问" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in sys_show_hide" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择停用则路由不会出现在侧边栏，也不能被访问" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
