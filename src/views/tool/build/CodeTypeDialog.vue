<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import type { GenerateMode } from "./codegen";

const open = defineModel<boolean>({ default: false });
const props = defineProps<{
  showFileName: boolean;
}>();
const emit = defineEmits<{
  confirm: [value: { type: GenerateMode; fileName: string }];
}>();

type CodeTypeForm = { type: GenerateMode; fileName: string };

const formRef = ref<FormInstance>();
const form = reactive<CodeTypeForm>({ type: "file", fileName: "" });
const rules: FormRules<CodeTypeForm> = {
  type: [{ required: true, message: "生成类型不能为空", trigger: "change" }],
  fileName: [{ required: true, message: "请输入文件名", trigger: "blur" }],
};

watch(open, (visible) => {
  if (visible && props.showFileName) {
    form.fileName = `${Date.now()}.vue`;
  }
});

async function confirm(): Promise<void> {
  if (props.showFileName) {
    const valid = await formRef.value?.validate().then(() => true).catch(() => false);
    if (!valid) {
      return;
    }
  }
  emit("confirm", { type: form.type, fileName: form.fileName });
  open.value = false;
}
</script>

<template>
  <el-dialog v-model="open" width="500px" title="选择生成类型">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="生成类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio-button value="file">页面</el-radio-button>
          <el-radio-button value="dialog">弹窗</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="showFileName" label="文件名" prop="fileName">
        <el-input v-model="form.fileName" placeholder="请输入文件名" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>
