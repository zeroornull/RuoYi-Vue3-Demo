<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { QuestionFilled } from "@element-plus/icons-vue";
import { treeselect } from "../../../api/system/menu";
import type { TreeSelectNode } from "../../../types/api/common";
import type { GeneratorTable } from "../../../types/api/tool";
import {
  clearCategoryExtras,
  subTableColumns,
  type GenEditForm,
} from "./model";

const props = defineProps<{
  info: GenEditForm;
  tables: GeneratorTable[];
}>();

const formRef = ref<FormInstance>();
const menuOptions = ref<TreeSelectNode[]>([]);
const rules: FormRules<GenEditForm> = {
  tplCategory: [{ required: true, message: "请选择生成模板", trigger: "change" }],
  packageName: [{ required: true, message: "请输入生成包路径", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入生成模块名", trigger: "blur" }],
  businessName: [{ required: true, message: "请输入生成业务名", trigger: "blur" }],
  functionName: [{ required: true, message: "请输入生成功能名", trigger: "blur" }],
};

const subColumns = computed(() => subTableColumns(props.tables, props.info.subTableName));

function onTplChange(value: GenEditForm["tplCategory"]): void {
  clearCategoryExtras(props.info, value);
}

function onSubTableChange(): void {
  props.info.subTableFkName = "";
}

onMounted(async () => {
  const response = await treeselect();
  menuOptions.value = response.data ?? [];
});

watch(
  () => props.info.tplWebType,
  (value) => {
    if (!value) {
      props.info.tplWebType = "element-plus";
    }
  },
);

defineExpose({ formRef });
</script>

<template>
  <el-form ref="formRef" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>生成模板</template>
          <el-select v-model="info.tplCategory" @change="onTplChange">
            <el-option label="单表（增删改查）" value="crud" />
            <el-option label="树表（增删改查）" value="tree" />
            <el-option label="主子表（增删改查）" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>前端类型</template>
          <el-select v-model="info.tplWebType">
            <el-option label="Vue2 Element UI 模版" value="element-ui" />
            <el-option label="Vue3 Element Plus 模版" value="element-plus" />
            <el-option label="Vue3 Element Plus TypeScript 模版" value="element-plus-typescript" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            生成包路径
            <el-tooltip content="生成在哪个java包下，例如 com.ruoyi.system" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            生成模块名
            <el-tooltip content="可理解为子系统名，例如 system" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            生成业务名
            <el-tooltip content="可理解为功能英文名，例如 user" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            生成功能名
            <el-tooltip content="用作类描述，例如 用户" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="formColNum">
          <template #label>
            表单布局
            <el-tooltip content="选择表单的栅格布局方式" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.formColNum">
            <el-option label="单列" :value="1" />
            <el-option label="双列" :value="2" />
            <el-option label="三列" :value="3" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <template #label>扩展功能</template>
          <el-checkbox v-model="info.genView">生成详情页</el-checkbox>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            生成代码方式
            <el-tooltip content="默认为zip压缩包下载，也可以自定义生成路径" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio-group v-model="info.genType">
            <el-radio value="0">zip压缩包</el-radio>
            <el-radio value="1">自定义路径</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <template #label>
            上级菜单
            <el-tooltip content="分配到指定菜单下，例如 系统管理" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-tree-select
            v-model="info.parentMenuId"
            :data="menuOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            placeholder="请选择系统菜单"
            check-strictly
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col v-if="info.genType === '1'" :span="24">
        <el-form-item prop="genPath">
          <template #label>
            自定义路径
            <el-tooltip content="填写磁盘绝对路径，若不填写，则生成到当前Web项目下" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-button @click="info.genPath = '/'">恢复默认路径</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="info.tplCategory === 'tree'">
      <h4 class="form-header">其他信息</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              树编码字段
              <el-tooltip content="树显示的编码字段名， 如：dept_id" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" placeholder="请选择">
              <el-option
                v-for="column in info.columns"
                :key="column.columnId"
                :label="`${column.columnName}：${column.columnComment ?? ''}`"
                :value="column.columnName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              树父编码字段
              <el-tooltip content="树显示的父编码字段名， 如：parent_id" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" placeholder="请选择">
              <el-option
                v-for="column in info.columns"
                :key="column.columnId"
                :label="`${column.columnName}：${column.columnComment ?? ''}`"
                :value="column.columnName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              树名称字段
              <el-tooltip content="树节点的显示名称字段名， 如：dept_name" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" placeholder="请选择">
              <el-option
                v-for="column in info.columns"
                :key="column.columnId"
                :label="`${column.columnName}：${column.columnComment ?? ''}`"
                :value="column.columnName"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory === 'sub'">
      <h4 class="form-header">关联信息</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              关联子表的表名
              <el-tooltip content="关联子表的表名， 如：sys_user" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" placeholder="请选择" @change="onSubTableChange">
              <el-option
                v-for="table in tables"
                :key="table.tableId"
                :label="`${table.tableName}：${table.tableComment ?? ''}`"
                :value="table.tableName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              子表关联的外键名
              <el-tooltip content="子表关联的外键名， 如：user_id" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" placeholder="请选择">
              <el-option
                v-for="column in subColumns"
                :key="column.columnId"
                :label="`${column.columnName}：${column.columnComment ?? ''}`"
                :value="column.columnName"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </el-form>
</template>

<style scoped>
.form-header {
  margin: 12px 0;
  font-size: 15px;
  font-weight: 600;
}
</style>
