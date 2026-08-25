# 第 13 轮：Layout、主题、TagsView 与图标系统

## 主要变量

本轮恢复管理端应用壳，不迁移完整业务页面。

## 学习目标

- 理解 Router、Pinia 与 Layout 组件的依赖关系。
- 类型化主题、菜单、TagsView、keep-alive 和图标边界。
- 保持响应式布局和导航交互行为。

## 迁移顺序

1. 全局基础 SCSS、变量和 transition。
2. `AppMain` 与最小 Layout 容器。
3. Navbar、Hamburger、Sidebar。
4. Breadcrumb、TopNav/TopBar。
5. TagsView 与 ScrollPane。
6. Settings、SizeSelect、暗色主题。
7. SvgIcon 和图标注册。
8. IframeToggle、InnerLink、HeaderNotice 等壳层能力。

## 类型重点

- Sidebar menu item 的递归类型。
- TagsView 项目从 route 派生的最小持久化类型。
- keep-alive include/exclude 的 route name 约束。
- CSS module 变量声明。
- template refs 的 DOM/组件实例类型。

## 行为验收

- 菜单展开、折叠和移动端切换。
- 当前菜单高亮和 `activeMenu`。
- 固定首页标签、关闭当前/其他/全部。
- 刷新后持久化恢复。
- keep-alive 缓存命中和清除。
- 主题、尺寸、暗色模式。
- 内链、外链、iframe。
- 图标在 dev/build 均可显示。

## 本轮不要做

- 不迁移系统、监控、工具业务页面。
- 不顺便重做视觉设计。
- 不将整个 route 对象原样持久化。
- 不用 `any` 处理 ScrollPane 或模板 ref。

## 练习

1. 为 TagsView 设计可版本化持久化模型。
2. 比较 route name 缺失时 keep-alive 的行为。
3. 记录一个桌面和一个移动端视觉基线。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/layout tests/integration/navigation-shell
bun run build:stage
```

## 停止条件

- [ ] 应用壳在桌面和移动端可用。
- [ ] TagsView、主题和 keep-alive 行为有验证。
- [ ] SVG 图标 dev/build 一致。
- [ ] Layout 不依赖业务页面内部实现。
- [ ] 没有未经计划的视觉重构。

## 推荐提交

```text
refactor: migrate typed layout theme tags and icons
```

