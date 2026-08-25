# 第 14 轮：通用组件、表单与上传能力

## 主要变量

本轮迁移业务页面复用的组件，不开始大规模业务页搬迁。

## 学习目标

- 完整类型化 props、emits、slots、model 和 exposed methods。
- 正确使用 Element Plus 公开实例与事件类型。
- 为文件、图片、编辑器和复杂表单建立边界测试。

## 组件批次

### 基础展示

- DictTag
- Pagination
- RightToolbar
- ImagePreview
- ParentView

### 输入与文件

- FileUpload
- ImageUpload
- ExcelImportDialog
- IconSelect

### 复杂组件

- Editor/Quill
- Crontab
- TreePanel
- HeaderSearch
- Screenfull

## 每个组件的迁移卡

```md
| 项目 | 内容 |
| --- | --- |
| Props | 类型、默认值、必填性 |
| Emits | 事件名和参数 tuple |
| Slots | 名称和 slot props |
| Model | value 类型和更新语义 |
| Refs | Element Plus/DOM 公开类型 |
| Expose | 对父组件公开的方法 |
| Errors | 错误与空状态 |
| Tests | 正常、边界、失败路径 |
```

## 专项验收

- Pagination：页码、页大小、总数边界。
- Upload：类型、大小、数量、进度、失败、token。
- Editor：空值、HTML、只读、toolbar、图片、销毁。
- Crontab：每个字段组合与表达式结果。
- TreePanel：选择、半选、懒加载和空节点。

## 本轮不要做

- 不为消除模板错误使用 `ref<any>()`。
- 不将组件内部 Element Plus 实例暴露给所有调用者。
- 不同时替换第三方编辑器或上传协议。
- 不迁移具体业务 CRUD 页面。

## 练习

1. 为一个双向绑定组件写类型化 `defineModel` 或 props/emits。
2. 为 FormInstance 写安全提交函数。
3. 模拟上传失败与取消，确认状态可恢复。

## 验证

```bash
bun run typecheck
bun run test -- tests/components/shared
bun run build:stage
```

## 停止条件

- [ ] 业务页面依赖的公共组件均有迁移状态。
- [ ] props/emits/slots/ref 无大面积 `any`。
- [ ] 上传、编辑器、Crontab 有失败路径测试。
- [ ] 全局组件只保留确有跨域价值的少量项。
- [ ] 业务页可以在下一轮直接消费这些类型。

## 推荐提交

```text
refactor: migrate typed shared components and forms
```

