# 第 12 轮：动态路由、导航守卫与权限闭环

## 主要变量

本轮将第 8—11 轮的 HTTP、API、store 和静态 Router 组合为登录权限闭环。

## 学习目标

- 把后端路由 DTO 转换为可信应用路由。
- 理解动态路由注册、刷新恢复和退出清理。
- 将身份认证、角色权限和页面导航分开建模。

## 核心数据流

```text
token
→ getInfo
→ roles/permissions
→ getRouters
→ BackendRouteDto 校验
→ component loader 转换
→ permission store
→ router.addRoute
→ 导航完成
```

## 实操范围

1. 定义 `BackendRouteDto` 与解析边界。
2. 实现纯函数 route transformer。
3. 建立 Layout、ParentView、InnerLink 等特殊 component 映射。
4. 实现 roles/permissions 筛选。
5. 实现动态 route 注册去重。
6. 实现刷新恢复与退出清理。
7. 迁移 title、NProgress 和白名单守卫。
8. 协调 HTTP 401 与 user store logout，避免循环依赖和重复弹窗。

## 必须测试

- 单层和多层 children。
- 空 children、外链、redirect。
- 未知 component。
- 缺失 path/name/meta。
- 角色满足但 permission 不满足，及反向组合。
- 重复注册和刷新恢复。
- token 失效、getInfo 失败、getRouters 失败。
- 登录页白名单和无限重定向保护。
- 退出后旧动态路由不可访问。

## 安全规则

- 后端 component 字符串不能直接作为任意 import 路径执行。
- 未知 component 必须可观察地失败或进入安全降级页。
- 前端权限只控制 UI/导航，不能替代后端授权。

## 练习

1. 为 route transformer 写表驱动测试。
2. 画出 401、logout、router redirect 之间的依赖图并消除环。
3. 模拟两个标签页同时 token 失效。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/router tests/integration/auth-routing
bun run build
```

浏览器完成：未登录访问 → 登录 → 菜单 → 刷新 → 权限页 → 退出。

## 停止条件

- [x] 登录、刷新恢复和退出形成可重复闭环。
- [x] route DTO 转换有完整边界测试。
- [x] 未知/恶意 component 不会被任意加载。
- [x] 守卫无重复继续和无限重定向。
- [x] 前端权限与后端授权的责任已写明。

## 推荐提交

```text
refactor: migrate dynamic routes and permission loop
```

## 本轮记录

- Git 基线：`cb50b8e`；完成状态：工作区未提交。
- DTO 边界：`parseBackendRoutes` 从 unknown 递归验证 path/name/hidden/redirect/component/query/alwaysShow/meta/children。path 缺失或空、错误 name/meta/children 类型会抛出带字段路径的 `BackendRouteValidationError`；name/meta 可缺失。
- 纯转换：`transformBackendRoutes` 不修改 DTO，保留 children、redirect、外链和 backendQuery；路由名在转换后 fail-fast 去重。
- 组件安全：只允许 Layout、ParentView、InnerLink 和 `SAFE_BACKEND_COMPONENTS` 显式集合。所有 import 都是固定的 `./components/static-pages`；未知或恶意 component 不参与路径拼接/import，而进入 UnknownComponentPage 并产生 issue，permission production adapter 会 `console.error` 报告。
- 权限语义：roles 与 permissions 同时声明时采用 AND；各自数组内部采用 OR；`admin` 和 `*:*:*` 为显式通配。无可访问 children 的空父路由被删除。此逻辑只控制前端可见性/导航，不替代后端 API 授权、数据权限或资源校验。
- 前端保护路由：迁移 user-auth、role-auth、dict-data、job-log、gen-edit 五组旧动态记录，并通过 permissions 过滤后与后端路由一起注册。
- permission store：由 core factory 和 browser adapter 组成；`generateRoutes` 执行 load → parse → transform → protected filter → unique check → state commit，失败时保持 `error` 并由 guard 会话清理统一回退。7/7 store 清单现均为 migrated。
- 注册/恢复：`DynamicRouteRegistry` 保存 `router.addRoute` remover，以 name/path 去重；重复生成会 skip；新 Router 可重新同步；clear 后旧 URL 只匹配 NotFound。
- guard：受保护导航且 access 未就绪时执行 getInfo → getRouters → generate → sync，并 replace 原 fullPath。`createAccessBootstrapper` 将并发恢复合并为一个 Promise；成功后若状态仍未 ready 会主动失败，避免无限 replace。
- 失败与清理：getInfo/getRouters 失败都会 resetSession，单向清 token/cookie/profile/roles/permissions、permission state 和注册路由，再进入 login；logout 与 HTTP 401 使用同一个 `setAccessCleanupHandler`，消除 user ↔ router 循环导入。
- NProgress：精确安装 `nprogress@0.2.0` 与 `@types/nprogress@0.2.3`；Router factory 以可注入 start/done 接口装配，production 关闭 spinner，单测覆盖成功导航开始/结束。
- 测试：新增 dynamic-transform 8 条、registry 2 条、auth-routing integration 5 条，同时 static router 增加 NProgress 1 条；`tests/unit` 共 80 条，integration 5 条，contracts 4 条，共 89 条。
- 验证：`bun run typecheck`、`bun run test -- tests/unit/router tests/integration/auth-routing tests/contracts`、`bun run build`、`bun run build:stage`、`bun run build:prod` 均通过。安全扫描无 `any`、eval/new Function、动态 component import 拼接或 `next()`。
- 浏览器限制：当前没有真实后端和真实登录/Layout 页面，因此“未登录→表单登录→菜单点击”的浏览器人工链路无法诚实完成；同一状态机已用 Vue Router memory history + Pinia + fake API 做可重复集成验证。真实浏览器闭环留到第 15 轮认证页面与最终 QA。
