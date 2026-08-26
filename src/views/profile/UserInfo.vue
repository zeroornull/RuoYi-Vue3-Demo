<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { updateUserProfile } from "../../api/system/user";
import { submitForm } from "../../components/form";
import { useTagsViewStore } from "../../stores/modules/tags-view";
import { useUserStore } from "../../stores/modules/user";
import type { SystemUser } from "../../types/api/system";
import { closeCurrentPage } from "./close";
import {
  isValidPhone,
  profileInfoFromUser,
  toProfileUpdateRequest,
  type ProfileInfoForm,
} from "./model";

const props = defineProps<{
  user: Partial<SystemUser> | null;
}>();

const emit = defineEmits<{
  updated: [form: ProfileInfoForm];
}>();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tagsStore = useTagsViewStore();
const userRef = ref<FormInstance>();
const form = reactive<ProfileInfoForm>(profileInfoFromUser(props.user));
const submitting = ref(false);

const rules: FormRules<ProfileInfoForm> = {
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] },
  ],
  phonenumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    {
      validator: (_rule, value: string, callback) => {
        if (!isValidPhone(value)) {
          callback(new Error("请输入正确的手机号码"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

watch(
  () => props.user,
  (user) => {
    Object.assign(form, profileInfoFromUser(user));
  },
  { immediate: true, deep: true },
);

async function submit(): Promise<void> {
  if (submitting.value || !(await submitForm(userRef.value))) {
    return;
  }
  submitting.value = true;
  const payload = toProfileUpdateRequest(form);
  try {
    await updateUserProfile(payload);
    userStore.applyProfile(payload);
    emit("updated", { ...form });
    try {
      await userStore.getInfo();
    } catch {
      // Keep the patched local profile when refresh fails.
    }
    ElMessage.success("修改成功");
  } finally {
    submitting.value = false;
  }
}

function close(): void {
  closeCurrentPage(router, route, tagsStore);
}
</script>

<template>
  <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="form.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="form.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.sex">
        <el-radio value="0">男</el-radio>
        <el-radio value="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>
