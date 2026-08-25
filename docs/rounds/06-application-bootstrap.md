# 第 6 轮：应用装配与插件边界

> 状态：已完成。按要求未提交。未安装 Router、Pinia、权限副作用。

## 主要变量

本轮迁移 `main.ts` 的装配职责，不迁移完整 Router、Pinia 或业务页面。

## 学习目标

- 理解 `createApp`、Vue plugin、directive、global component 和 `globalProperties` 的区别。
- 让应用入口只负责装配，不承载业务逻辑。
- 为后续 Router、Pinia 和组件迁移预留明确插槽。

## 旧实现对照

`legacy/src/main.js` 当前装配了：

- Element Plus 与中文 locale。
- 全局样式和暗色主题。
- Router、Pinia、plugins、directives。
- SVG 图标和多个全局组件。
- `useDict`、`download`、`parseTime` 等全局方法。
- permission side-effect import。

## 实操范围

1. 安装并注册当前兼容版本 Element Plus。
2. 恢复全局样式入口，但不一次复制全部业务组件。
3. 建立小型安装函数：

   ```text
   src/bootstrap/
   ├── element-plus.ts
   ├── global-components.ts
   ├── global-properties.ts
   └── directives.ts
   ```

4. `main.ts` 只负责按明确顺序调用这些安装函数。
5. 为暂留 `globalProperties` 建立 `ComponentCustomProperties` 类型。
6. 建立全局能力清单，给每项写目标删除轮次。

## 本轮不要做

- 不把所有旧全局组件都迁入。
- 不引入 permission side-effect import。
- 不创建假的 Router/Pinia 实现来让代码通过。
- 不用一个巨大 `install(app)` 隐藏所有依赖。

## 练习

1. 将一个全局工具分别实现为 global property、plugin 和 composable，比较依赖可见性。
2. 解释插件注册顺序何时会影响运行行为。
3. 为一个全局属性写模块增强，然后用显式 import 替代并删除声明。

## 验证

```bash
bun run typecheck
bun run build
bun run dev
```

浏览器检查 Element Plus locale、基础样式和暗色 CSS 变量是否加载；此时不要求管理端布局完成。

2026-08-25 实测：

| 检查 | 结果 |
| --- | --- |
| `bun run typecheck` / `build` | 通过 |
| 浏览器 | 标题「若依管理系统」；按钮「确定」；分页「共 100 条」 |
| 暗色 | `html.dark`，`--el-bg-color` 为 `#141414` |
| 控制台 | 无 error/warn |
| 未安装 | `vue-router`、`pinia`、`@element-plus/icons-vue` |

### 练习记录

1. 同一标题做成 `$appTitle`（globalProperties）、`appTitlePlugin`（provide）和 `useAppTitle()`（composable）。页面用 composable，依赖最清楚。
2. Element Plus 必须在会用到它的组件挂载前 `app.use`；locale/size 在安装时写入，晚注册的子树读不到。
3. `ComponentCustomProperties.$appTitle` 已声明；App.vue 走显式 composable，全局属性只是对照，目标删除轮次见 `src/bootstrap/capabilities.ts`。

## 停止条件

- [x] `main.ts` 保持小且只承担装配。
- [x] 每个全局能力都有类型和删除计划。
- [x] Element Plus 基础示例可渲染。
- [x] 尚未迁移 permission、store 和 router 业务。
- [x] 应用仍可独立 typecheck/build。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：`element-plus@2.14.5`。未装 js-cookie（size 用最小 `readCookie`）
- 本轮假设：`skipLibCheck: false` 能扛住 Element Plus 的 `.d.ts`
- 发现的隐式约定：EP / `@vueuse` 声明在 `exactOptionalPropertyTypes` 下失败，并可选依赖 `vue-router`。`ElConfigProvider` 的 `locale` 被导出成 PropType 包装而不是 `Language`。`app.use(ElementPlus)` 全量注册使生产包 JS 约 1 MB
- 新增兼容债：`tsconfig.app.json` 的 `skipLibCheck: true`，见 `docs/migration-debt.md`。`tsconfig.node.json` 仍为 `false`
- 验证命令与结果：见上表
- 结束 commit：未提交

## 第 6 轮复盘

- 我原先的假设：装上 Element Plus 后类型会自然通过。
- TypeScript/测试发现的问题：第三方声明过不了第 4 轮的严格组合；应用源码里对 `locale` 的绑定也会被 PropType 包装挡住。
- 最终的类型或接口设计：入口只调用四个 install + 一个练习用 plugin；全局能力清单写删除轮次，不把旧组件先注册进来。
- 保留的兼容层：应用工程 `skipLibCheck`。
- 下一轮前必须偿还的技术债：无阻塞项。第 7 轮迁纯工具时应开始拆 `useDict`/`parseTime` 等全局方法。

## 本轮产物

```text
src/main.ts
src/bootstrap/element-plus.ts
src/bootstrap/global-components.ts
src/bootstrap/global-properties.ts
src/bootstrap/directives.ts
src/bootstrap/capabilities.ts
src/bootstrap/cookie.ts
src/bootstrap/app-title-plugin.ts
src/composables/useAppTitle.ts
src/assets/styles/index.scss
docs/migration-debt.md
```

## 推荐提交

```text
refactor: establish typed application bootstrap boundaries
```

