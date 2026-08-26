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

- [x] 应用壳在桌面和移动端可用。
- [x] TagsView、主题和 keep-alive 行为有验证。
- [x] SVG 图标 dev/build 一致。
- [x] Layout 不依赖业务页面内部实现。
- [x] 没有未经计划的视觉重构。

## 推荐提交

```text
refactor: migrate typed layout theme tags and icons
```

## 本轮记录

- Git/工作区：Git HEAD 仍为 `cb50b8e`；第 12 轮未提交内容被完整保留，第 13 轮叠加在同一工作区。
- 基础样式：新增 CSS 变量和 fade-transform transition；保留旧项目 240px 侧栏、64px 折叠宽度、50px Navbar、34px TagsView 与 992px 移动断点，没有重做视觉设计。
- Layout：`src/layout/index.vue` 组合 Sidebar、Navbar、TagsView、AppMain、SettingsPanel；桌面使用 grid，移动端使用抽屉 + overlay；resize 只通过 app store 更新 device/sidebar。
- 菜单：`SidebarItem` 使用递归 `AppRouteRecordRaw`，过滤 hidden、处理单 child/alwaysShow、activeMenu、内外链和显式图标，不读取业务页面内部状态。
- Navbar：恢复折叠、breadcrumb/顶部导航、主题、尺寸、通知壳、设置、头像、锁屏和退出入口；TopNav/TopBar 以 navType 2/3 的最小链接形式恢复。
- TagsView：route 只派生 path/fullPath/name/title/query/meta 最小模型；初始化固定首页、关闭当前/其他/左右/全部、持久化恢复、横向滚动和 card/chrome 样式。没有持久化完整 route/component。
- keep-alive：AppMain 的 include 仅来自去重后的字符串 route name；Index/Profile 占位组件 name 已与路由名对齐；删除 tag 会同步清 cachedViews。
- iframe/InnerLink：只允许 http/https URL；javascript/data/相对 URL 被拒绝。AppMain 对 meta.link 不渲染普通 component，而由 sandboxed IframeToggle 承载。
- 主题/设置：`buildThemeVariables` 生成 Element Plus primary/light/dark 变量；无效颜色回退 `#409EFF`；SettingsPanel 使用 store action 持久化 navType、sideTheme、theme、dark、tags、fixedHeader、logo、footer，关闭 tags 持久化时主动清缓存。
- 图标：精确安装 `@element-plus/icons-vue@2.3.2`；`src/icons/registry.ts` 显式 import 并按语义名映射，没有全量 app.component 循环。`SvgIcon` 同时支持显式 Element 图标、有限 custom SVG URL 和 Grid fallback；custom-user 已在真实 Chrome 顶栏显示。
- 测试：新增 8 条 layout unit 和 3 条 navigation-shell integration；当前 unit 88、integration 8、contracts 4，共 100 条。
- 视觉基线：使用临时 mock 后端 + Vite + 系统 Chrome 151 headless；mock/测试 token 未写入仓库。桌面基线 `docs/visual-baselines/round13-desktop-1440x900.png`，移动基线 `docs/visual-baselines/round13-mobile-390x844.png`。移动初始侧栏已验证为收起状态。
- 工具限制：OpenCLI doctor 显示浏览器扩展未连接，无法使用 Browser Bridge；因此改用系统 Chrome headless。该限制不影响最终 PNG、DOM class 和构建证据。
- 验证：`bun run typecheck`、`bun run test -- tests/unit/layout tests/integration/navigation-shell tests/unit/router tests/integration/auth-routing tests/contracts`、`bun run build`、`bun run build:stage`、`bun run build:prod` 均通过。
