<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { getCodeImg, register } from "../../api/login";
import { appEnv } from "../../config/env";
import { useSettingsStore } from "../../stores/modules/settings";
import SvgIcon from "../../components/SvgIcon.vue";
import { submitForm } from "../../components/form";
import {
  applyCaptcha,
  canSubmitAuth,
  emptyRegisterForm,
  nextAuthStatus,
  passwordsMatch,
  registerPasswordMessage,
  type AuthSubmitStatus,
  type RegisterFormModel,
} from "../auth/model";

defineOptions({ name: "Register" });

const router = useRouter();
const settingsStore = useSettingsStore();
const registerRef = ref<FormInstance>();
const registerForm = reactive<RegisterFormModel>(emptyRegisterForm());
const codeUrl = ref("");
const captchaEnabled = ref(true);
const status = ref<AuthSubmitStatus>("idle");
const loading = computed(() => status.value === "submitting");

const registerRules = computed<FormRules<RegisterFormModel>>(() => ({
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" },
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    {
      validator: (_rule, value: string, callback) => {
        const message = registerPasswordMessage(value);
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
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    {
      validator: (_rule, value: string, callback) => {
        if (!passwordsMatch(registerForm.password, value)) {
          callback(new Error("两次输入的密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
}));

async function getCode(): Promise<void> {
  try {
    const response = await getCodeImg();
    const next = applyCaptcha(registerForm, response);
    captchaEnabled.value = next.captchaEnabled;
    codeUrl.value = next.codeUrl;
  } catch {
    captchaEnabled.value = true;
  }
}

async function handleRegister(): Promise<void> {
  if (!canSubmitAuth(status.value)) {
    return;
  }
  const valid = await submitForm(registerRef.value);
  if (!valid) {
    return;
  }
  status.value = nextAuthStatus(status.value, "submit");
  try {
    await register({
      username: registerForm.username.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      code: registerForm.code,
      uuid: registerForm.uuid,
    });
    status.value = nextAuthStatus(status.value, "success");
    await ElMessageBox.alert(
      `<font color="red">恭喜你，您的账号 ${registerForm.username} 注册成功！</font>`,
      "系统提示",
      { dangerouslyUseHTMLString: true, type: "success" },
    );
    await router.push("/login");
  } catch {
    status.value = nextAuthStatus(status.value, "error");
    if (captchaEnabled.value) {
      await getCode();
    }
  }
}

onMounted(() => {
  void getCode();
});
</script>

<template>
  <div class="register">
    <el-form
      ref="registerRef"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
    >
      <h3 class="title">{{ appEnv.title }}</h3>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" size="large" placeholder="账号">
          <template #prefix><SvgIcon name="user" class="input-icon" :size="14" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          show-password
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><SvgIcon name="password" class="input-icon" :size="14" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          show-password
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><SvgIcon name="password" class="input-icon" :size="14" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="registerForm.code"
          size="large"
          placeholder="验证码"
          class="register-code-input"
          @keyup.enter="handleRegister"
        >
          <template #prefix><SvgIcon name="validCode" class="input-icon" :size="14" /></template>
        </el-input>
        <button type="button" class="register-code" aria-label="刷新验证码" @click="getCode">
          <img v-if="codeUrl" :src="codeUrl" alt="验证码" class="register-code-img" />
        </button>
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="register-submit"
          @click.prevent="handleRegister"
        >
          {{ loading ? "注 册 中..." : "注 册" }}
        </el-button>
        <div class="register-login">
          <router-link class="link-type" to="/login">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <div class="el-register-footer">
      <span>{{ settingsStore.footerContent }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-image: url("../../assets/images/login-background.jpg");
  background-size: cover;
}

.title {
  margin: 0 auto 30px;
  color: #707070;
  text-align: center;
}

.register-form {
  width: 400px;
  padding: 25px 25px 5px;
  background: #fff;
  border-radius: 6px;
}

.register-code-input {
  width: 63%;
}

.register-code {
  float: right;
  width: 33%;
  height: 40px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
  vertical-align: middle;
}

.register-submit {
  width: 100%;
}

.register-login {
  float: right;
}

.el-register-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 40px;
  color: #fff;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 40px;
  letter-spacing: 1px;
  text-align: center;
}
</style>
