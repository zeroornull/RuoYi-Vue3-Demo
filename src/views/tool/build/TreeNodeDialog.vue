<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  confirm: [value: { label: string; value: string | number }];
}>();

type NodeForm = { label: string; value: string };
type ValueKind = "string" | "number";

const formRef = ref<FormInstance>();
const valueKind = ref<ValueKind>("string");
const form = reactive<NodeForm>({ label: "", value: "" });
const rules: FormRules<NodeForm> = {
  label: [{ required: true, message: "请输入选项名", trigger: "blur" }],
  value: [{ required: true, message: "请输入选项值", trigger: "blur" }],
};

watch(open, (visible) => {
  if (visible) {
    form.label = "";
    form.value = "";
    valueKind.value = "string";
  }
});

async function confirm(): Promise<void> {
  const valid = await formRef.value?.validate().then(() => true).catch(() => false);
  if (!valid) {
    return;
  }
  emit("confirm", {
    label: form.label,
    value: valueKind.value === "number" ? Number(form.value) : form.value,
  });
  open.value = false;
}
</script>

<template>
  <el-dialog v-model="open" title="添加选项" width="520px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="选项名" prop="label">
        <el-input v-model="form.label" placeholder="请输入选项名" clearable />
      </el-form-item>
      <el-form-item label="选项值" prop="value">
        <el-input v-model="form.value" placeholder="请输入选项值" clearable>
          <template #append>
            <el-select v-model="valueKind" style="width: 110px">
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="open = false">取 消</el-button>
    </template>
  </el-dialog>
</template>
