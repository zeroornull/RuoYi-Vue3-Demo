# 阶段 E 手册：组件与业务页面迁移

> 对应细分轮次：第 13—18 轮。本文件是阶段参考，不要求在一次学习会话中全部完成。

## 本阶段目标

在基础设施稳定后，按“布局 → 通用组件 → 业务域”的顺序迁移 97 个 Vue SFC，并把脚本逐步收敛为 `<script setup lang="ts">`。

## 核心原则

- 不按文件字母顺序迁移，按依赖方向迁移。
- 一批组件只处理一个业务域。
- 先保证行为一致，再做设计或交互重构。
- 组件 props、emits、slots、template refs 和服务返回值必须有真实类型。

## 步骤 1：迁移全局样式和静态资源

从 `legacy/src/assets/` 复制到新 `src/assets/` 时：

- 保持相对路径。
- 验证 SCSS module 导出类型的使用方式。
- 比较 favicon、logo、登录背景、401/404 图片。
- 不把未使用资源一股脑复制；先根据旧引用清单迁移。

SVG 插件应先用一个图标做 dev/build 双测试，再迁移全部图标。

## 步骤 2：迁移 Layout

推荐顺序：

1. `AppMain`
2. `Navbar`
3. Sidebar
4. TagsView
5. Settings/TopNav/TopBar
6. HeaderNotice、Iframe、InnerLink

Layout 验证：

- 桌面/移动布局。
- 菜单折叠。
- 标签页关闭、固定、刷新和持久化。
- 主题、尺寸和暗色模式。
- keep-alive include/exclude。
- 内链与外链。

## 步骤 3：迁移通用组件

按依赖由少到多：

- SvgIcon
- DictTag
- Pagination
- RightToolbar
- Breadcrumb
- Hamburger/HeaderSearch/SizeSelect/Screenfull
- FileUpload/ImageUpload/ImagePreview
- Editor
- Crontab/TreePanel/ExcelImportDialog

每个组件迁移表至少记录：

```md
| 组件 | Props | Emits | Slots | 暴露方法 | 第三方实例 | 测试 |
| --- | --- | --- | --- | --- | --- | --- |
```

## 步骤 4：减少全局属性

旧 `main.js` 全局挂载了 `useDict`、`download`、`parseTime`、`resetForm`、`handleTree`、`addDateRange`、`getConfigKey` 和字典选择工具。

迁移顺序：

1. 统计调用者。
2. 高频模板辅助短期保留并建立 `ComponentCustomProperties` 类型。
3. 新迁移页面优先显式 import 或 composable。
4. 当调用者为零时删除全局挂载和声明。

不要同时保留全局属性和同名自动导入，避免来源不清。

## 步骤 5：按业务域迁移页面

建议批次：

1. **认证域**：login、register、profile、lock。
2. **系统基础域**：config、dict、notice、post。
3. **组织与权限域**：user、role、menu、dept。
4. **监控域**：online、logininfor、operlog、job、cache、server、druid。
5. **工具域**：swagger、代码生成、表单构建。

每批必须完成：

- 页面与子组件。
- 对应 API 类型。
- 表单 model/rules 类型。
- 路由与权限元数据。
- 单元或浏览器验收。

## 步骤 6：Element Plus 类型

常见类型：

- `FormInstance`
- `FormRules<T>`
- `UploadInstance`
- `UploadProps`
- `TableInstance`
- `TreeInstance`

规则：

- template ref 使用公开实例类型。
- 表单规则字段名和 model key 保持一致。
- 事件参数根据组件公开类型标注。
- 不用 `ref<any>()` 解决所有模板错误。

## 步骤 7：第三方包专项迁移

### Editor / Quill

验证 HTML 值、空值、只读、toolbar、图片上传、粘贴与销毁。

### ECharts 6

先迁移单一静态图，再迁移实时/响应式图。按需引入时确认注册组件齐全。

### vuedraggable

Vue 3 分支使用 `next` dist-tag；不要安装默认 `latest` 的 Vue 2 分支。

### vue-cropper

同样检查 `next` dist-tag。对裁剪输出尺寸、格式和质量做视觉/文件验收。

### clipboard / file-saver / nprogress

先用适配器保留旧行为。若要换原生 API，另开提交和测试，不与 TS 改造混合。

## 步骤 8：每批的验证命令

```bash
bun run typecheck
bun run test -- <本批测试路径>
bun run lint -- <本批源码路径>
bun run build:stage
```

浏览器至少检查该域的一条成功路径、一条失败路径和权限不足路径。

## 本阶段练习

1. 给一个表单组件写完整 props/emits/ref 类型。
2. 把一个全局工具改成 composable，并比较调用方式。
3. 为一个表格页面建 `PageResponse<T>`，消除行对象 `any`。
4. 用截图或 DOM 断言比较迁移前后布局。

## 验收清单

- [ ] 新 SFC 脚本统一为 `<script setup lang="ts">`；例外已记录。
- [ ] 不存在大面积 `ref<any>()` 或无类型 API 数据。
- [ ] Layout、主题、菜单、TagsView 与 keep-alive 行为一致。
- [ ] 上传、下载、编辑器、图表、拖拽、裁剪均有专项验收。
- [ ] 每个业务域独立通过类型、测试、Lint 和 build。
- [ ] 全局属性数量逐批下降，新增页面不再依赖隐式全局。

## 推荐提交

按业务域拆分，不要把全部页面塞入一个提交：

```text
refactor: migrate typed shared components and layout
refactor: migrate typed auth and profile views
refactor: migrate typed system views
refactor: migrate typed monitor views
refactor: migrate typed tool views
```
