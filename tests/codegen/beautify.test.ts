import { describe, expect, test } from "bun:test";
import {
  CSS_BEAUTIFY_OPTIONS,
  HTML_BEAUTIFY_OPTIONS,
  JS_BEAUTIFY_OPTIONS,
  beautifyCss,
  beautifyHtml,
  beautifyJs,
} from "../../src/views/tool/build/beautify";
import { generateVueSource } from "../../src/views/tool/build/codegen";
import {
  defaultDrawingList,
  emptyFormConf,
  parseDrawingItem,
} from "../../src/views/tool/build/schema";

async function fixture(name: string): Promise<string> {
  return Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).text();
}

/** Compact inputs that were formatted with js-beautify 1.15.4 using the mapped numeric options. */
const HTML_SAMPLE = `<template><div class="app-container"><el-form ref="formRef" :model="formData"><el-form-item label="手机号" prop="mobile"><el-input v-model="mobile" placeholder="请输入手机号" clearable /></el-form-item></el-form></div></template>
<script setup lang="ts">
import { reactive } from "vue";
const formData = reactive({
    mobile: "",
});
</script>
`;

const JS_SAMPLE = `import { reactive } from "vue";
const formData = reactive({ mobile: "", role: "" });
function submit(){if(formData.mobile){console.log(formData)}}`;

const CSS_SAMPLE = `.form-builder{display:flex;height:100%}.left-board{width:260px}`;

describe("js-beautify 2.x adapter", () => {
  test("maps 1.x stringy options to numbers and drops HTML e4x", () => {
    expect(HTML_BEAUTIFY_OPTIONS.indent_size).toBe(2);
    expect(HTML_BEAUTIFY_OPTIONS.wrap_line_length).toBe(110);
    expect(HTML_BEAUTIFY_OPTIONS.max_preserve_newlines).toBe(-1);
    expect(HTML_BEAUTIFY_OPTIONS.indent_scripts).toBe("separate");
    expect("e4x" in HTML_BEAUTIFY_OPTIONS).toBe(false);
    expect(JS_BEAUTIFY_OPTIONS.e4x).toBe(true);
    expect(JS_BEAUTIFY_OPTIONS.indent_size).toBe(2);
    expect(CSS_BEAUTIFY_OPTIONS.indent_size).toBe(2);
  });

  test("HTML 2.x matches the reviewed 1.15.4 snapshot", async () => {
    expect(beautifyHtml(HTML_SAMPLE)).toBe(await fixture("v1.15.4-html.vue"));
  });

  test("JS 2.x matches the reviewed 1.15.4 snapshot", async () => {
    expect(beautifyJs(JS_SAMPLE)).toBe(await fixture("v1.15.4-js.js"));
  });

  test("CSS 2.x matches the reviewed 1.15.4 snapshot", async () => {
    expect(beautifyCss(CSS_SAMPLE)).toBe(await fixture("v1.15.4-css.css"));
  });

  test("form-builder default SFC matches the reviewed beautified snapshot", async () => {
    const source = generateVueSource(emptyFormConf(), defaultDrawingList(), "file");
    expect(source).toBe(await fixture("default-form.vue"));
    expect(source).toContain("  <div class=\"app-container\">");
    expect(source).toContain("import {\n  reactive\n} from \"vue\";");
    expect(source).not.toContain("js-beautify");
  });

  test("string option values stay valid Vue literals after beautify", () => {
    const source = generateVueSource(
      emptyFormConf(),
      [
        parseDrawingItem({
          kind: "select",
          label: "角色",
          vModel: "role",
          options: [{ label: "管理员", value: "admin" }],
        }),
        parseDrawingItem({
          kind: "radio",
          label: "性别",
          vModel: "sex",
          options: [{ label: "男", value: 1 }],
        }),
      ],
      "file",
    );
    expect(source).toContain(`:value='"admin"'`);
    expect(source).not.toContain(`:value=""admin""`);
    expect(source).toContain(`:value='1'`);
  });
});
