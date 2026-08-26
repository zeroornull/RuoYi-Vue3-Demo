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
bun test tests/unit/components/shared
bun run build:stage
```

## 停止条件

- [x] 业务页面依赖的公共组件均有迁移状态。
- [x] props/emits/slots/ref 无大面积 `any`。
- [x] 上传、编辑器、Crontab 有失败路径测试。
- [x] 全局组件只保留确有跨域价值的少量项。
- [x] 业务页可以在下一轮直接消费这些类型。

## 推荐提交

```text
refactor: migrate typed shared components and forms
```

## 组件迁移表

| 组件 | Props | Emits | Slots | 暴露方法 | 第三方实例 | 测试 |
| --- | --- | --- | --- | --- | --- | --- |
| DictTag | options/value/showValue/separator | 无 | 无 | 无 | ElTag | 匹配/未匹配/plain span |
| Pagination | total/page/limit/sizes | update:page/limit, pagination | 无 | 无 | ElPagination | 页码、页大小、移动端 pager |
| RightToolbar | columns/showSearch/storageKey | update:showSearch, queryTable | 无 | 无 | Transfer/Checkbox | 列显隐、全选、持久化 |
| ImagePreview | src/width/height | 无 | error | 无 | ElImage | 相对/外链、空值 |
| ParentView | 无 | 无 | RouterView | 无 | 无 | resolver 映射 |
| FileUpload | modelValue/action/limit/fileType | update:modelValue | 无 | 无 | ElUpload | 类型/大小/逗号/失败/排序 |
| ImageUpload | 同上 + drag | update:modelValue | 无 | 无 | ElUpload | 同上 |
| ExcelImportDialog | action/templateAction | success | 无 | open | ElUpload | excel URL、后缀 |
| IconSelect | activeIcon | selected | 无 | reset | 无 | 名称过滤 |
| Editor | modelValue/readOnly/type | update:modelValue | 无 | 无 | VueQuill | 空 HTML、图片类型/大小 |
| Crontab | expression/hideComponent | fill/hide | 无 | 无 | 无 | 解析/字段组合/预览 |
| TreePanel | treeData/lazy/load | node-click/check/search | node/actions | 选择/半选/过滤/宽度 | ElTree 不外泄 | 过滤、空节点、宽度 |
| HeaderSearch | 无 | 无 | 无 | 无 | Fuse | 索引、搜索、高亮转义 |
| Screenfull | 无 | 无 | 无 | 无 | Fullscreen API | toggle 状态 |
| submitForm/resetForm | FormInstance-like | 无 | 无 | 函数 | 不暴露 EP 内部 | 成功/失败/缺省 |

全局注册仅：`SvgIcon`、`DictTag`、`Pagination`、`RightToolbar`、`ImagePreview`、`FileUpload`、`ImageUpload`、`Editor`。其余显式 import。

## 本轮记录

- Git/工作区：HEAD 仍为 `cb50b8e`；第 12—13 轮未提交内容保留，第 14 轮叠加在同一工作区。
- 基础组件：DictTag 按字典项 type/class 选择 span/ElTag；Pagination 在页大小越界时回到第 1 页；RightToolbar 支持数组/对象列显隐和 localCache 记忆；ImagePreview 只拼接 `baseApi` 或保留外链；ParentView 为独立 `router-view`，动态路由 `ParentView` 映射到该组件。
- 上传：FileUpload/ImageUpload/ExcelImportDialog 共用校验与值序列化。拒绝逗号文件名、类型、大小和数量超限；成功响应必须 `code === 200` 且含 `fileName`。token 放在 `Authorization: Bearer`。拖拽排序使用 sortablejs，不改 `/common/upload` 协议。
- 编辑器：安装 `@vueup/vue-quill@1.5.5`，保留 snow toolbar 和 url 图片上传。空值规范化为 `<p></p>`；卸载时移除 paste 监听。不把 Quill 实例暴露给父组件。
- Crontab：纯函数解析/拼接字段（含 `?`、`L`、`W`、`#`、范围、步长、列表）；Result 预览最近运行时间。隐藏字段由 `hideComponent` 控制。
- TreePanel：空数据提示、可选 lazy/load、勾选/半选通过包装方法暴露，不 `expose` ElTree 实例。
- 壳层接入：Navbar 增加 HeaderSearch（fuse.js@7.5.0）和 Screenfull（原生 Fullscreen API，未装 `@vueuse/core`）。图标选择只列出显式 registry，不 glob 全部 SVG。
- 表单：`submitForm`/`resetForm` 只依赖 `{ validate, resetFields }`，失败返回 `false`。
- 测试：新增 22 条 `tests/unit/components/shared`。`bun test tests/unit tests/integration tests/contracts` 122 pass / 0 fail。`bun run typecheck` 与 `bun run build:stage` 通过；产物含 `ParentView` 与 `quill` chunk。
- 浏览器：现有 Vite 5173 上 `/login` 可打开，无控制台错误；未登录访问 `/index` 仍重定向到 `/login?redirect=/index`。HeaderSearch/Screenfull 位于受保护壳层，未做真实登录点击（与第 12 轮相同限制，留到第 15 轮认证页）。
- 源码 `src/components` 无 `any` / `ref<any>()`。

