# 第 6 轮：应用装配与插件边界

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

## 停止条件

- [ ] `main.ts` 保持小且只承担装配。
- [ ] 每个全局能力都有类型和删除计划。
- [ ] Element Plus 基础示例可渲染。
- [ ] 尚未迁移 permission、store 和 router 业务。
- [ ] 应用仍可独立 typecheck/build。

## 推荐提交

```text
refactor: establish typed application bootstrap boundaries
```

