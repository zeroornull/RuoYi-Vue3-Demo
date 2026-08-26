import { describe, expect, test } from "bun:test";
import { generateVueSource } from "../../src/views/tool/build/codegen";
import {
  changeKind,
  cloneDrawing,
  createIdAllocator,
  defaultDrawingList,
  emptyFormConf,
  parseDrawingItem,
  parseDrawingList,
  serializeDrawingList,
} from "../../src/views/tool/build/schema";
import { resolveBackendComponent } from "../../src/router/component-resolver";
import { migratedViewLoaders } from "../../src/router/view-registry";

describe("form builder schema", () => {
  test("serializes and deserializes a discriminated drawing list", () => {
    const list = defaultDrawingList();
    const json = serializeDrawingList(list);
    const parsed = parseDrawingList(JSON.parse(json) as unknown);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.kind).toBe("input");
    if (parsed[0]?.kind === "input") {
      expect(parsed[0].vModel).toBe("mobile");
      expect(parsed[0].prefixIcon).toBe("Iphone");
    }
  });

  test("clones items with new ids and reorders without sharing references", () => {
    const allocate = createIdAllocator(200);
    const [mobile] = defaultDrawingList();
    if (!mobile) {
      throw new Error("missing default");
    }
    const cloned = cloneDrawing(mobile, allocate);
    expect(cloned.formId).not.toBe(mobile.formId);
    if (cloned.kind === "input" && mobile.kind === "input") {
      expect(cloned.vModel).not.toBe(mobile.vModel);
      cloned.label = "克隆";
      expect(mobile.label).toBe("手机号");
    }
  });

  test("rejects unknown kinds instead of generating code", () => {
    expect(() => parseDrawingItem({ kind: "magic-input", formId: 1 })).toThrow("未知组件类型");
    const nest = (depth: number): unknown =>
      depth === 0 ? { kind: "input" } : { kind: "row", children: [nest(depth - 1)] };
    expect(() => parseDrawingItem(nest(9))).toThrow("嵌套过深");
  });

  test("generates vue for input/select/radio exhaustively", () => {
    const allocate = createIdAllocator(10);
    const input = parseDrawingItem({ kind: "input", label: "姓名", vModel: "name", placeholder: "请输入姓名" });
    const select = parseDrawingItem({
      kind: "select",
      label: "角色",
      vModel: "role",
      options: [{ label: "管理员", value: "admin" }],
    });
    const radio = parseDrawingItem({
      kind: "radio",
      label: "性别",
      vModel: "sex",
      options: [{ label: "男", value: 1 }],
    });
    const source = generateVueSource(emptyFormConf(), [input, select, radio], "file");
    expect(source).toContain("el-input");
    expect(source).toContain("el-select");
    expect(source).toContain("el-radio");
    expect(source).toContain("name:");
    expect(source).toContain("role:");
    expect(source).toContain(`:value='"admin"'`);
    expect(source).toContain("  <div class=\"app-container\">");
    expect(source).not.toContain("js-beautify");
    const dialog = generateVueSource(emptyFormConf(), [cloneDrawing(input, allocate)], "dialog");
    expect(dialog).toContain("el-dialog");
    const switched = changeKind(input, "upload", allocate);
    expect(switched.kind).toBe("upload");
    if (switched.kind !== "row" && input.kind !== "row") {
      expect(switched.vModel).toBe(input.vModel);
    }
  });

  test("registers the typed build view", () => {
    const resolved = resolveBackendComponent({
      component: "tool/build/index",
      hasChildren: false,
      link: undefined,
      hasRedirect: false,
    });
    expect(resolved.component).toBe(migratedViewLoaders["tool/build/index"]);
  });
});
