<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { getCodeImg } from "../../api/login";
import { appEnv } from "../../config/env";
import { useSettingsStore } from "../../stores/modules/settings";
import { useUserStore } from "../../stores/modules/user";
import SvgIcon from "../../components/SvgIcon.vue";
import { rememberMeCipher } from "../../utils/jsencrypt";
import { submitForm } from "../../components/form";
import { browserCookieJar } from "../auth/cookies";
import {
  applyCaptcha,
  canSubmitAuth,
  emptyLoginForm,
  nextAuthStatus,
  readRememberMe,
  safeLoginRedirect,
  toLoginRequest,
  writeRememberMe,
  type AuthSubmitStatus,
  type LoginFormModel,
} from "../auth/model";

defineOptions({ name: "Login" });

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const loginRef = ref<FormInstance>();
const loginForm = reactive<LoginFormModel>(emptyLoginForm());
const codeUrl = ref("");
const captchaEnabled = ref(true);
const registerEnabled = ref(false);
const status = ref<AuthSubmitStatus>("idle");

const loginRules: FormRules<LoginFormModel> = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

const loading = computed(() => status.value === "submitting");
const usingMock = import.meta.env.VITE_MOCK_API === "true";

async function getCode(): Promise<void> {
  try {
    const response = await getCodeImg();
    const next = applyCaptcha(loginForm, response);
    captchaEnabled.value = next.captchaEnabled;
    codeUrl.value = next.codeUrl;
  } catch {
    captchaEnabled.value = true;
  }
}

async function handleLogin(): Promise<void> {
  if (!canSubmitAuth(status.value)) {
    return;
  }
  const valid = await submitForm(loginRef.value);
  if (!valid) {
    return;
  }
  status.value = nextAuthStatus(status.value, "submit");
  writeRememberMe(browserCookieJar, rememberMeCipher, loginForm);
  try {
    await userStore.login(toLoginRequest(loginForm));
    status.value = nextAuthStatus(status.value, "success");
    await router.push(safeLoginRedirect(route.query));
  } catch {
    status.value = nextAuthStatus(status.value, "error");
    if (captchaEnabled.value) {
      await getCode();
    }
  }
}

onMounted(() => {
  Object.assign(loginForm, readRememberMe(browserCookieJar, rememberMeCipher));
  void getCode();
});
</script>

<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{ appEnv.title }}</h3>
      <p v-if="usingMock" class="login-mock-hint">
        本地 Mock 后端已开启。账号 admin / admin123，验证码任意非空。接真实服务请设 VITE_MOCK_API=false 后重启。
      </p>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" size="large" autocomplete="username" placeholder="账号">
          <template #prefix>
            <SvgIcon name="user" class="input-icon" :size="14" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          autocomplete="current-password"
          placeholder="密码"
          show-password
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <SvgIcon name="password" class="input-icon" :size="14" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="loginForm.code"
          size="large"
          autocomplete="off"
          placeholder="验证码"
          class="login-code-input"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <SvgIcon name="validCode" class="input-icon" :size="14" />
          </template>
        </el-input>
        <button type="button" class="login-code" aria-label="刷新验证码" @click="getCode">
          <img v-if="codeUrl" :src="codeUrl" alt="验证码" class="login-code-img" />
        </button>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" class="login-remember">记住密码</el-checkbox>
      <el-form-item>
        <el-button :loading="loading" size="large" type="primary" class="login-submit" @click.prevent="handleLogin">
          {{ loading ? "登 录 中..." : "登 录" }}
        </el-button>
        <div v-if="registerEnabled" class="login-register">
          <router-link class="link-type" to="/register">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <div class="el-login-footer">
      <span>{{ settingsStore.footerContent }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-image: url("../../assets/images/login-background.jpg");
  background-size: cover;
}

.title {
  margin: 0 auto 16px;
  color: #707070;
  text-align: center;
}

.login-mock-hint {
  margin: 0 0 20px;
  color: #e6a23c;
  font-size: 12px;
  line-height: 1.5;
}

.login-form {
  z-index: 1;
  width: 400px;
  padding: 25px 25px 5px;
  background: #fff;
  border-radius: 6px;
}

.input-icon {
  margin-left: 0;
}

.login-code-input {
  width: 63%;
}

.login-code {
  float: right;
  width: 33%;
  height: 40px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
  vertical-align: middle;
}

.login-remember {
  margin: 0 0 25px;
}

.login-submit {
  width: 100%;
}

.login-register {
  float: right;
}

.el-login-footer {
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

html.dark .login {
  background-image:
    linear-gradient(rgb(0 0 0 / 55%), rgb(0 0 0 / 55%)), url("../../assets/images/login-background.jpg");

  .login-form {
    background: var(--el-bg-color-overlay) !important;
    box-shadow: 0 12px 40px rgb(0 0 0 / 50%);
  }
}
</style>
