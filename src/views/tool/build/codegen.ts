import { beautifyVueSfc } from "./beautify";
import type { DrawingItem, FormConf, RowItem } from "./schema";

export type GenerateMode = "file" | "dialog";

export function generateVueSource(
  conf: FormConf,
  fields: readonly DrawingItem[],
  mode: GenerateMode,
): string {
  const body = fields.map((item) => fieldTemplate(item)).join("\n");
  const buttons =
    conf.formBtns && mode === "file"
      ? `    <el-form-item>\n      <el-button type="primary">提交</el-button>\n      <el-button>重置</el-button>\n    </el-form-item>`
      : "";
  const form = `<el-form ref="${conf.formRef}" :model="${conf.formModel}" size="${conf.size}" label-width="${conf.labelWidth}px" label-position="${conf.labelPosition}"${conf.disabled ? " disabled" : ""}>
${body}
${buttons}
  </el-form>`;
  const wrapped = mode === "dialog" ? dialogWrapper(form) : form;
  const script = fieldsScript(conf, fields);
  return beautifyVueSfc(`<template>
  <div class="app-container">
    ${wrapped}
  </div>
</template>
<script setup lang="ts">
${script}
</script>
`);
}

function dialogWrapper(inner: string): string {
  return `<el-dialog v-model="dialogVisible" title="Dialog Title">
    ${inner}
  </el-dialog>`;
}

function fieldsScript(conf: FormConf, fields: readonly DrawingItem[]): string {
  const names = collectModels(fields);
  const init = names.map((name) => `    ${name}: "",`).join("\n");
  return `import { reactive } from "vue";
const ${conf.formModel} = reactive({
${init}
});
`;
}

function collectModels(fields: readonly DrawingItem[]): string[] {
  const names: string[] = [];
  for (const item of fields) {
    if (item.kind === "row") {
      names.push(...collectModels(item.children));
    } else if (item.vModel) {
      names.push(item.vModel);
    }
  }
  return names;
}

function fieldTemplate(item: DrawingItem): string {
  switch (item.kind) {
    case "input":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-input v-model="${item.vModel}" placeholder="${item.placeholder}" ${item.clearable ? "clearable" : ""} ${item.disabled ? "disabled" : ""} />
    </el-form-item>`,
      );
    case "textarea":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-input v-model="${item.vModel}" type="textarea" :rows="${item.minRows}" placeholder="${item.placeholder}" ${item.disabled ? "disabled" : ""} />
    </el-form-item>`,
      );
    case "select":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-select v-model="${item.vModel}" placeholder="${item.placeholder}" ${item.multiple ? "multiple" : ""}>
${item.options.map((option) => `        <el-option label="${option.label}" ${vueBoundAttr("value", option.value)} />`).join("\n")}
      </el-select>
    </el-form-item>`,
      );
    case "radio":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-radio-group v-model="${item.vModel}">
${item.options.map((option) => `        <el-radio ${vueBoundAttr("value", option.value)}>${option.label}</el-radio>`).join("\n")}
      </el-radio-group>
    </el-form-item>`,
      );
    case "upload":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-upload action="${item.action}" ${item.accept ? `accept="${item.accept}"` : ""}>
        <el-button type="primary">${item.buttonText}</el-button>
      </el-upload>
    </el-form-item>`,
      );
    case "tree":
      return col(
        item.span,
        `    <el-form-item label="${item.label}" prop="${item.vModel}">
      <el-tree ${vueBoundAttr("data", item.data)} ${item.showCheckbox ? "show-checkbox" : ""} />
    </el-form-item>`,
      );
    case "row":
      return rowTemplate(item);
    default: {
      const unexpected: never = item;
      throw new Error(`未知组件类型: ${String(unexpected)}`);
    }
  }
}

function rowTemplate(item: RowItem): string {
  const children = item.children.map((child) => fieldTemplate(child)).join("\n");
  return `    <el-row :gutter="${item.gutter}">
${children}
    </el-row>`;
}

function col(span: number, inner: string): string {
  if (span === 24) {
    return inner;
  }
  return `    <el-col :span="${span}">\n${inner}\n    </el-col>`;
}

/** JSON literals inside single-quoted Vue bindings, so strings do not become `:value=""admin""`. */
function vueBoundAttr(name: string, value: unknown): string {
  return `:${name}='${JSON.stringify(value)}'`;
}
