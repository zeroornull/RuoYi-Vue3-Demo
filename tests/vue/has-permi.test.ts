import { defineComponent } from "vue";
import { beforeEach, describe, expect, test } from "vitest";
import { pinia } from "../../src/stores";
import { useUserStore } from "../../src/stores/modules/user";
import { mountPage } from "./mount";

const Probe = defineComponent({
  name: "HasPermiProbe",
  template: `
    <div>
      <button v-hasPermi="['system:user:add']">新增</button>
      <button v-hasPermi="['system:user:remove']">删除</button>
    </div>
  `,
});

describe("v-hasPermi directive", () => {
  beforeEach(() => {
    useUserStore(pinia).resetSession();
  });

  test("keeps permitted controls and removes the rest", () => {
    useUserStore(pinia).permissions = ["system:user:add"];
    const wrapper = mountPage(Probe);
    expect(wrapper.text()).toContain("新增");
    expect(wrapper.text()).not.toContain("删除");
  });

  test("keeps every listed control for the wildcard owner", () => {
    useUserStore(pinia).permissions = ["*:*:*"];
    const wrapper = mountPage(Probe);
    expect(wrapper.text()).toContain("新增");
    expect(wrapper.text()).toContain("删除");
  });
});
