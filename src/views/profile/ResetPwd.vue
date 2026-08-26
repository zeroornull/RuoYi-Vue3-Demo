<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { updateUserPwd } from "../../api/system/user";
import { submitForm } from "../../components/form";
import { useTagsViewStore } from "../../stores/modules/tags-view";
import { useUserStore } from "../../stores/modules/user";
import { closeCurrentPage } from "./close";
import {
  emptyPasswordForm,
  profilePasswordError,
  type ProfilePasswordForm,
} from "./model";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tagsStore = useTagsViewStore();
const pwdRef = ref<FormInstance>();
const form = reactive<ProfilePasswordForm>(emptyPasswordForm());
const submitting = ref(false);

const rules: FormRules<ProfilePasswordForm> = {
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    {
      validator: (_rule, value: string, callback) => {
        const message = profilePasswordError(
          value,
          userStore.passwordCharacterType ?? "0",
        );
        if (message) {
          callback(new Error(message));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    {
      validator: (_rule, value: string, callback) => {
        if (form.newPassword !== value) {
          callback(new Error("两次输入的密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

async function submit(): Promise<void> {
  if (submitting.value || !(await submitForm(pwdRef.value))) {
    return;
  }
  submitting.value = true;
  try {
    await updateUserPwd(form.oldPassword, form.newPassword);
    ElMessage.success("修改成功");
    Object.assign(form, emptyPasswordForm());
  } finally {
    submitting.value = false;
  }
}

function close(): void {
  closeCurrentPage(router, route, tagsStore);
}
</script>

<template>
  <el-form ref="pwdRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" placeholder="请确认新密码" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>
