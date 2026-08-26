# 第 18 轮：工具域、代码生成器与复杂第三方集成

## 主要变量

本轮处理迁移难度最高但核心业务依赖相对较低的工具页面，避免它们阻塞前面的管理端闭环。

## 页面范围

- swagger
- generator list/import/create/edit
- basicInfoForm
- genInfoForm
- 表单构建器及其 dialogs/panels
- 代码预览和格式化

## 学习目标

- 类型化动态 schema、字段配置和代码生成模型。
- 迁移 draggable 的 Vue 3 分支。
- 处理 `js-beautify` 主版本变化。
- 隔离第三方弱类型或无类型 API。

## 依赖专项

### vuedraggable

默认 `latest` 指向 Vue 2；Vue 3 使用 `next` 分支。验证：

- list/modelValue 绑定方式。
- clone、move、change 事件类型。
- 跨容器拖拽。
- key 稳定性。
- 拖拽取消和只读状态。

### js-beautify

从旧 1.x 升到 2.x，验证 JS/HTML/CSS 格式化输出。代码生成快照变化要人工审阅，不能盲目更新快照。

### 动态表单 schema

使用判别联合表达组件类型，例如 input/select/radio/upload/tree。每种类型拥有自己的 options，避免一个包含几十个可选字段的 `FormItem`。

## 实操顺序

拆成子批次，一轮只做一块，不要一次做完 18.a—18.e。

### 18.a Swagger 外链/iframe

- swagger。

### 18.b generator 查询、导入和基本信息

- generator list / import / create / basicInfoForm。

### 18.c generator 编辑配置和代码预览

- editTable / genInfoForm / preview / 下载。

### 18.d 表单构建器

- 判别联合 schema、vuedraggable 画布、dialogs / TreeNode / RightPanel。

### 18.e 生成结果对照

- js-beautify 2.x 输出与旧快照人工审阅。

## 必须测试

- 数据库字段到前端控件映射。
- 表单 schema 序列化/反序列化。
- 拖拽排序和 clone。
- 非法/未知组件类型。
- js-beautify 输出。
- 代码下载与预览。
- 大 schema 性能和递归深度。

## 练习

1. 用判别联合建模三种表单组件并写穷尽 switch。
2. 模拟未知 schema type，确保不会静默生成错误代码。
3. 比较旧、新 beautifier 输出并解释每个差异。

## 验证

```bash
bun run typecheck
bun run test -- tests/tools tests/codegen
bun run build:stage
```

## 本轮记录

### 18.a Swagger 外链/iframe（工作区，未单独提交）

- 页面：`src/views/tool/swagger/index.vue`。沙箱 iframe 指向 `swaggerUiUrl(appEnv.baseApi)`（`/swagger-ui/index.html`），与 Druid 同一套 sandbox / referrer 策略。
- Mock：`vite/mock/tool.ts` 在鉴权前放行 `GET /swagger-ui/index.html`；`getRouters` 增加系统工具 / 系统接口；菜单 `3` / `116`。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools`（177）；`bun run build:stage`（独立 `swagger-*.js` 0.67 kB）。浏览器：`/tool/swagger` iframe 显示 Swagger UI / 本地 Mock OpenAPI；390px 仍铺满；回归 `/monitor/cache` Redis 7.2.4。

### 18.b generator 查询、导入和基本信息（工作区，未单独提交）

- 页面：`src/views/tool/gen/{index,importTable,createTable,basicInfoForm}`。列表查询/排序/分页；导入 DB 表；SQL 建表（解析 `CREATE TABLE`）；删除确认；同步确认；编辑跳 `/tool/gen-edit/index/:tableId`（18.c 仍占位）。`v-hasRole` 未装，创建按钮用 `checkRole(roles, ["admin"])`。
- Query / BasicInfo / Row 分模型；`parseCreateTableNames` / `tableNameToClassName` 无 `Record<string, any>`。`basicInfoForm` 已迁供 18.c 编辑页使用。
- Mock：`vite/mock/tool.ts` 鉴权后处理 `/tool/gen/*`；无 token 返回 401。预览/下载未做（属 18.c）。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools`（182）；`bun run build:stage`（`gen-*.js` 10.18 kB）。浏览器：搜 `user` 只剩 `sys_user`；导入 `sys_notice`；SQL 创建 `sys_demo`；编辑进占位「修改生成配置」；回归 Swagger UI。

### 18.c generator 编辑配置和代码预览（工作区，未单独提交）

- 页面：`editTable.vue` / `genInfoForm.vue`；列表补预览对话框与 zip/`genCode` 下载。隐藏路由 `/tool/gen-edit/index/:tableId` 接到真实编辑页。字段表用已有 `sortablejs` 按 `.allowDrag` 排序。
- Query / BasicInfo / GenEditForm / PreviewFile 分模型；`formToUpdateRequest` 带 `params.genView`，没有 `Record<string, any>`。查询方式用 API 的 `GE`/`LE`。`js-beautify` 留给 18.e。
- Mock：PUT `/tool/gen`、GET preview、`batchGenCode` zip、`genCode` 自定义路径。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools`（184）；`bun run build:stage`（`editTable-*.js` 16.95 kB）。浏览器：预览 `domain.java`/`mapper.xml`/`index.vue`；编辑改表描述为「用户信息」并提交；`GET /tool/gen/batchGenCode?tables=sys_user` 200；回归 Swagger UI。

### 18.d 表单构建器（工作区，未单独提交）

- 页面：`src/views/tool/build/{index,DraggableItem,FieldPreview,RightPanel,CodeTypeDialog,TreeNodeDialog,IconsDialog}`。判别联合 `kind`: input/textarea/select/radio/upload/tree/row，每种自有字段，没有超级可选 `FormItem`。未知 kind 与嵌套过深会抛错。`vuedraggable@4.1.0` 克隆调色板到画布。导出/复制生成未 beautify 的 SFC（属 18.e）。
- Mock：菜单 `114` 表单构建。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools`（189）；`bun run build:stage`（`build-*.js` 208.73 kB，含 draggable）。浏览器：默认手机号；点选下拉选择；复制代码成功；树选择添加「部门」节点；清空后空画布；回归代码生成列表。

### 18.e 生成结果对照 / js-beautify 2.x（工作区，未单独提交）

- 适配器：`src/views/tool/build/beautify.ts`。把旧 `beautifierConf` 的字符串 `indent_size` / `wrap_line_length` / `max_preserve_newlines` 收成 number；HTML 2.x 没有 `e4x`（丢弃，不转发）；JS 仍保留 `e4x: true`。`generateVueSource` 经 `beautifyVueSfc`（走 HTML beautify，与旧 `beautifier.html(html + script + css)` 一致）。
- 人工审阅：同一默认 SFC 与压缩 HTML/JS/CSS 样本，`js-beautify@1.15.4` 与 `2.0.3` 输出逐字节相同。`indent_scripts: "separate"` 仍会把 `import { reactive } from "vue"` 拆行，这是 1.x 行为不是 2.x 回归。审阅时发现字符串 option 写成 `:value=""admin""`，已改为单引号包裹的 JSON 字面量（`:value='"admin"'` / `:value='1'`）。
- 依赖：`js-beautify@2.0.3`，类型 `@types/js-beautify@1.14.3`（钉死，无 caret）。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools tests/codegen`（195）；`bun run build:stage`（`build-*.js` 310.02 kB，含 js-beautify）。浏览器：`/tool/build` 复制默认表单得到缩进 SFC（`<template>` 换行、`app-container` 两空格缩进、拆行 import）；点选下拉后再复制含 `el-select` 与 `:value='1'`；390px 仍可复制；回归 `/tool/gen` 列表 `sys_user` / `sys_role`。

## 停止条件

- [x] 工具域所有页面完成或有明确不迁移决定。（18.a—18.e 已迁；未跳过 CRUD）
- [x] draggable 使用 Vue 3 分支并经过交互验证。
- [x] 动态 schema 使用判别联合，不是超级可选接口。
- [x] 代码生成差异经过人工和自动双重审阅。（1.15.4 与 2.0.3 默认样本相同；快照在 `tests/codegen/fixtures`）
- [x] 第三方弱类型被窄适配器隔离。（`beautify.ts` 只暴露 typed options + 四个函数）

## 推荐提交

```text
refactor: migrate typed generator and form builder tools
```
