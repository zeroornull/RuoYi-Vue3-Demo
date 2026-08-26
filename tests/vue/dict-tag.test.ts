import { describe, expect, test } from "vitest";
import DictTag from "../../src/components/DictTag/index.vue";
import { mountPage } from "./mount";

const options = [
  { label: "正常", value: "0", elTagType: "success" },
  { label: "停用", value: "1", elTagType: "danger" },
  { label: "默认", value: "2" },
];

describe("DictTag component", () => {
  test("renders matched labels and unmatched tokens", () => {
    const wrapper = mountPage(DictTag, {
      props: { options, value: "0,9" },
    });
    expect(wrapper.text()).toContain("正常");
    expect(wrapper.text()).toContain("9");
    expect(wrapper.find(".el-tag").exists()).toBe(true);
  });

  test("uses a plain span when the dict item has no tag type", () => {
    const wrapper = mountPage(DictTag, {
      props: { options, value: "2" },
    });
    expect(wrapper.text()).toContain("默认");
    expect(wrapper.find(".el-tag").exists()).toBe(false);
  });
});
