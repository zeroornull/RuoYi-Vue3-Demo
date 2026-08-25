# 阶段 D 手册：Pinia、Vue Router 与权限闭环

> 对应细分轮次：第 10—12 轮。本文件是阶段参考，不要求在一次学习会话中全部完成。

## 本阶段目标

迁移登录态、用户信息、动态菜单、路由守卫和权限控制，建立一个可登录、可生成菜单、可退出的最小管理端闭环。

## 本阶段风险

这是业务风险最高的一轮，因为后端路由、Vue Router 主版本、Pinia 主版本和页面组件解析同时相遇。必须先用纯函数测试路由转换，再接真实浏览器流程。

## 步骤 1：阅读主版本迁移说明

执行前确认当前使用的 Vue Router 与 Pinia 主版本，并阅读官方变更：

- Vue Router：<https://router.vuejs.org/>
- Vue Router 4 → 5：<https://router.vuejs.org/guide/migration/v4-to-v5.html>
- Pinia：<https://pinia.vuejs.org/>

不能仅凭旧 4.x/3.x API 在新版能编译，就认定导航、类型或 SSR/插件行为完全一致。

## 步骤 2：定义路由边界

建立：

- `RouteMeta` 模块增强。
- 应用静态路由类型。
- 后端 `BackendRouteDto`。
- DTO 到应用路由的转换函数。
- component 字符串到实际组件 loader 的映射。

参考[类型设计：路由类型](../reference/type-design.md#5-路由类型)。

路由转换函数必须是可单测的纯函数，不在递归转换中直接修改 store。

## 步骤 3：迁移静态路由

先只迁移：

- `/login`
- `/register`
- `/401`
- 404 catch-all
- `/index`
- `/lock`
- `/user/profile`

验证：

- catch-all 顺序正确。
- redirect path 与旧系统一致。
- 路由 name 唯一。
- lazy import 能被 Vite 解析。
- `meta.affix`、`activeMenu` 等类型生效。

## 步骤 4：迁移 Pinia store

按依赖顺序：

1. app/settings。
2. user。
3. permission。
4. tagsView。
5. dict。
6. lock。

优先使用 setup store，并显式建模可空状态。若为降低风险先保留 option store，也必须给 state、getter、action 输入输出建立类型。

不要在本阶段同时重命名所有 store API；先保持调用语义，完成后再做独立清理。

## 步骤 5：迁移权限守卫

将旧 `legacy/src/permission.js` 拆为可测试责任：

- token 判断。
- 白名单判断。
- 用户信息初始化。
- 动态路由获取与注册。
- 页面标题更新。
- NProgress/UI 反馈。
- 错误恢复和退出。

守卫的每个导航分支必须显式返回/继续，避免重复 `next()`。如果使用新版推荐的返回值式 guard，就不要混用旧 `next` 风格。

## 步骤 6：动态路由测试

至少覆盖：

- 无 children 的菜单。
- 多层 children。
- Layout、ParentView、InnerLink 等特殊 component。
- 外链。
- 权限不足的路由。
- 角色满足、permission 不满足及反向组合。
- 后端返回未知 component。
- 同一路由重复注册。
- 刷新后恢复动态路由。

未知 component 不应静默落到任意页面；记录错误并使用明确的安全降级。

## 步骤 7：最小端到端闭环

只迁移闭环必要 UI：

- 登录页。
- 最小 Layout。
- 首页占位。
- 侧边栏菜单。
- 401/404。

完成以下人工/自动流程：

```text
未登录访问受保护页
→ 跳转登录
→ 登录成功
→ 获取用户和菜单
→ 注册动态路由
→ 到首页
→ 刷新仍可恢复
→ 退出并清理状态/路由
```

## 本阶段练习

1. 为 `BackendRouteDto -> AppRouteRecordRaw` 写表驱动测试。
2. 对比 option store 和 setup store 的类型推断。
3. 模拟后端返回未知 component，设计可观察的失败策略。
4. 解释为什么动态路由 DTO 不能直接断言成 `RouteRecordRaw`。

## 验收清单

- [ ] 静态路由、后端 DTO 和 RouteMeta 均有类型。
- [ ] 动态路由转换测试覆盖正常、嵌套、未知组件和权限分支。
- [ ] 登录、刷新恢复、退出闭环通过。
- [ ] 导航守卫不存在重复继续或无限重定向。
- [ ] Pinia state 不用伪造对象规避 `null`。
- [ ] store 与 router 不依赖 `legacy/`。
- [ ] 401 和 token 过期行为与 HTTP 层协同正确。

## 推荐提交

```text
refactor: migrate typed router pinia and permission flow
```
