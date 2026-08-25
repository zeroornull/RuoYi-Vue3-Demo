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

- [ ] 登录、刷新恢复和退出形成可重复闭环。
- [ ] route DTO 转换有完整边界测试。
- [ ] 未知/恶意 component 不会被任意加载。
- [ ] 守卫无重复继续和无限重定向。
- [ ] 前端权限与后端授权的责任已写明。

## 推荐提交

```text
refactor: migrate dynamic routes and permission loop
```

