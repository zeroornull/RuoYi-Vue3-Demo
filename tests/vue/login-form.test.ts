import { defineComponent, nextTick, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { afterEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { LOGIN_REQUIRED_MESSAGES, type LoginFormModel } from "../../src/views/auth/model";
import { mountPage } from "./mount";

const LoginFields = defineComponent({
  name: "LoginFieldsProbe",
  setup() {
    const formRef = ref<FormInstance>();
    const form = reactive<LoginFormModel>({
      username: "",
      password: "",
      rememberMe: false,
      code: "",
      uuid: "",
    });
    const rules: FormRules<LoginFormModel> = {
      username: [{ required: true, trigger: "blur", message: LOGIN_REQUIRED_MESSAGES.username }],
      password: [{ required: true, trigger: "blur", message: LOGIN_REQUIRED_MESSAGES.password }],
      code: [{ required: true, trigger: "change", message: LOGIN_REQUIRED_MESSAGES.code }],
    };
    async function submit(): Promise<void> {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
    }
    return { formRef, form, rules, submit };
  },
  template: `
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item prop="username"><el-input v-model="form.username" /></el-form-item>
      <el-form-item prop="password"><el-input v-model="form.password" /></el-form-item>
      <el-form-item prop="code"><el-input v-model="form.code" /></el-form-item>
      <el-button class="login-submit" @click="submit">登 录</el-button>
    </el-form>
  `,
});

describe("Login form", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("marks username, password and captcha as required", async () => {
    const wrapper = mountPage(LoginFields, { attachTo: document.body });
    await nextTick();
    await flushPromises();
    await wrapper.get(".login-submit").trigger("click");
    await vi.waitFor(() => {
      expect(wrapper.findAll(".el-form-item.is-error")).toHaveLength(3);
    });
    expect(wrapper.get(".login-submit").text()).toBe("登 录");
    wrapper.unmount();
  });
});
