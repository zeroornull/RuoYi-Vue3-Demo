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

- [ ] 所有静态路由可导航。
- [ ] RouteMeta 扩展被模板和 TS 正确认识。
- [ ] catch-all、redirect、profile 参数有测试。
- [ ] 不存在动态路由或权限副作用。
- [ ] Router 5 主版本迁移差异已有记录。

## 推荐提交

```text
refactor: establish typed static router and metadata
```

