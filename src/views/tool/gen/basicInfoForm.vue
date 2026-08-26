<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { ref } from "vue";
import type { GeneratorBasicInfo } from "./model";

defineProps<{
  info: GeneratorBasicInfo;
}>();

const formRef = ref<FormInstance>();
const rules: FormRules<GeneratorBasicInfo> = {
  tableName: [{ required: true, message: "请输入表名称", trigger: "blur" }],
  tableComment: [{ required: true, message: "请输入表描述", trigger: "blur" }],
  className: [{ required: true, message: "请输入实体类名称", trigger: "blur" }],
  functionAuthor: [{ required: true, message: "请输入作者", trigger: "blur" }],
};

defineExpose({
  formRef,
});
</script>

<template>
  <el-form ref="formRef" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="info.tableName" placeholder="请输入表名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表描述" prop="tableComment">
          <el-input v-model="info.tableComment" placeholder="请输入表描述" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="实体类名称" prop="className">
          <el-input v-model="info.className" placeholder="请输入实体类名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="作者" prop="functionAuthor">
          <el-input v-model="info.functionAuthor" placeholder="请输入作者" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="info.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
