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

1. Swagger 外链/iframe。
2. generator 查询、导入和基本信息。
3. generator 编辑配置和代码预览。
4. 表单 schema 类型。
5. draggable 画布。
6. dialogs、TreeNode、RightPanel。
7. 生成结果对照测试。

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

## 停止条件

- [ ] 工具域所有页面完成或有明确不迁移决定。
- [ ] draggable 使用 Vue 3 分支并经过交互验证。
- [ ] 动态 schema 使用判别联合，不是超级可选接口。
- [ ] 代码生成差异经过人工和自动双重审阅。
- [ ] 第三方弱类型被窄适配器隔离。

## 推荐提交

```text
refactor: migrate typed generator and form builder tools
```

