# 第 11 轮：静态 Router、RouteMeta 与导航基础

## 主要变量

本轮只建立 Vue Router 5 静态路由和类型，不接后端动态菜单。

## 学习目标

- 阅读 Vue Router 4 → 5 的迁移说明。
- 理解 `RouteRecordRaw`、RouteMeta 模块增强、lazy component 和 navigation guard 返回值。
- 让静态路由成为后续权限闭环的可靠基础。

## 参考

- [阶段 D 手册](../phases/phase-d-state-routing-permissions.md)
- [类型设计：路由类型](../reference/type-design.md#5-路由类型)
- Vue Router 4 → 5：<https://router.vuejs.org/guide/migration/v4-to-v5.html>

## 本轮路由范围

- `/login`
- `/register`
- `/401`
- 404 catch-all
- `/index`
- `/lock`
- `/user/profile`
- `/redirect/:path(.*)`

页面可以先使用类型化占位组件；不要因此提前迁移完整 Layout 和业务页面。

## 类型任务

- 扩展 `RouteMeta`：title、icon、noCache、affix、breadcrumb、activeMenu、link。
- 定义应用路由附加字段：hidden、alwaysShow、roles、permissions。
- 明确 route name 类型策略和唯一性检查。
- 为路由参数建立解析函数，不把 `string | string[]` 随意断言。

## 行为测试

- history base 正确。
- catch-all 匹配未知地址。
- redirect 恢复目标 path/query。
- profile 可选参数解析。
- scrollBehavior 恢复 savedPosition。
- route name 无重复。
- lazy component build 可解析。

## 本轮不要做

- 不请求 `getRouters`。
- 不注册动态路由。
- 不实现 roles/permissions 筛选。
- 不迁移完整 Sidebar 或 TagsView。

## 练习

1. 比较路由 params、query 和 meta 的类型来源。
2. 为 route name 写一个重复检测测试。
3. 用返回值式 guard 实现最小匿名页重定向，不混用 `next()`。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/router/static-routes.spec.ts
bun run build
```

## 停止条件

- [x] 所有静态路由可导航。
- [x] RouteMeta 扩展被模板和 TS 正确认识。
- [x] catch-all、redirect、profile 参数有测试。
- [x] 不存在动态路由或权限副作用。
- [x] Router 5 主版本迁移差异已有记录。

## 推荐提交

```text
refactor: establish typed static router and metadata
```

## 本轮记录

- Git 基线：`c90359a`；完成状态：工作区未提交。
- 依赖：注册表确认并精确安装 `vue-router@5.2.0`；其 peer 范围覆盖当前 `vue@3.5.41`、`pinia@4.0.3`、`vite@8.2.2`。
- Router 4 → 5：官方迁移说明确认，对未使用 file-based routing / unplugin-vue-router 的 classic 配置没有破坏性变更；v5 主要把 file-based routing 合并进核心包。IIFE 构建不再内置 devtools-api 是唯一例外，本项目使用 ESM/Vite，不受影响。v6 将转为 ESM-only 并删除弃用 API，本轮没有引入这些弃用面。
- 静态范围：`/login`、`/register`、`/401`、404 catch-all、`/index`、`/lock`、`/user/profile/:activeTab?`、`/redirect/:path(.*)` 均已建立并可用 memory history 导航。
- 类型：`src/types/router.d.ts` 扩展 title/icon/noCache/affix/breadcrumb/activeMenu/link/public；`AppRouteRecordRaw` 增加 hidden/alwaysShow/roles/permissions 和递归 children。
- 路由名：全部使用 `ROUTE_NAMES` 字符串常量；启动时 `assertUniqueRouteNames` fail-fast，测试覆盖重复名称。
- 参数：`parseSingleRouteParam`、`parseProfileActiveTab`、`buildRedirectLocation` 从 unknown/string|string[] 安全解析，不使用类型断言；redirect 保留 query，并防止重定向回 `/redirect` 自循环。
- 占位组件：使用 TypeScript `defineComponent` 和 lazy import，不提前迁完整 Layout/页面；构建产出独立 `static-pages` chunk。
- guard：仅返回 `true` 或 RouteLocationRaw，不使用 `next()`；匿名访问保护页跳 login 并保留 fullPath，已登录访问 login/register 回 index，lock 状态在 index/lock 之间收敛。没有 getInfo、getRouters、角色筛选或动态注册。
- 401：会话清理仍由 user store 完成，导航从硬编码 `window.location` 收敛为 Router replace 到 login，并保留当前 redirect。
- 测试：新增 10 条 router 测试；`tests/unit` 共 69 条，含 4 条契约测试后共 73 条。
- 验证：`bun run typecheck`、`bun run test -- tests/unit/router/static-routes.spec.ts`、`bun run build`、`bun run build:stage`、`bun run build:prod` 均通过；静态 router 源码扫描无 getRouters、addRoute、roles/permissions 筛选。
