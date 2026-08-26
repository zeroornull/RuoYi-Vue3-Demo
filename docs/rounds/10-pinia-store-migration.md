# 第 10 轮：Pinia 状态管理迁移

## 主要变量

本轮只迁移状态管理。Router 只允许使用最小测试替身，不开始动态路由实现。

## 学习目标

- 理解 Pinia 4 的 setup store、state 推断、getter/computed 和 action。
- 区分持久状态、会话状态和可由其他状态推导的值。
- 避免用伪造初始对象绕过 `null`。

## 旧 store 清单

`legacy/src/store/modules/`：

- `app.js`
- `settings.js`
- `user.js`
- `permission.js`
- `tagsView.js`
- `dict.js`
- `lock.js`

## 迁移顺序

1. app/settings：依赖少，学习 store 基础。
2. dict/lock：小型领域状态。
3. user：接入第 9 轮 login/getInfo API。
4. tagsView：路由对象、缓存和持久化较复杂。
5. permission：本轮只建状态与 action 接口，路由转换留到第 12 轮。

## 设计规则

- 用户 profile 在加载前使用 `null`，不创建假用户。
- roles、permissions 初始为空数组，区分“未加载”和“已加载为空”时增加显式状态。
- token 的唯一事实来源必须明确，避免 cookie 和 store 双向漂移。
- tagsView 持久化数据要经过版本化解析，不直接相信 localStorage JSON。
- action 返回真实 Promise 类型。
- store 之间的依赖方向要记录，避免循环导入。

## 测试范围

- app device/size/sidebar 状态。
- settings theme/title 修改。
- user login/getInfo/logout 成功和失败。
- dict set/get/remove/clean。
- lock/unlock。
- tagsView add/delete/固定页/持久化恢复。
- permission route collections 的纯状态更新。

## 练习

1. 用 option store 和 setup store 各实现一个小状态，比较推断。
2. 为 user store 画出 token、profile、roles、permissions 生命周期。
3. 故意破坏持久化 JSON，验证 store 安全恢复默认值。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/stores
bun run build
```

## 停止条件

- [x] 7 个 store 均有迁移状态，核心 store 已完成。
- [x] store state、getter、action 没有无理由 `any`。
- [x] token/profile 生命周期可解释且有测试。
- [x] localStorage/sessionStorage 输入经过解析边界。
- [x] permission store 尚未夹带动态路由副作用。

## 推荐提交

```text
refactor: migrate typed pinia stores
```

## 本轮记录

- Git 基线：`fb339c6`；完成状态：工作区未提交。
- 依赖：注册表确认并精确安装 `pinia@4.0.3`，Vue 保持 `3.5.41`；没有引入 store 测试工具或持久化插件。
- store 清单：`src/stores/migration-manifest.ts` 记录 7/7 个旧 store。app/settings/dict/lock/user/tagsView 已迁移；permission 为 `state-only`，路由转换和 `router.addRoute` 明确推迟到第 12 轮。
- 风格对照：app 使用 option store；settings/dict/lock/user/tagsView/permission 使用 setup store。
- 依赖方向：user → lock，tagsView → settings，其余 store 无依赖；测试验证声明图无环。
- token 生命周期：store 是应用运行期唯一事实来源，cookie 只负责启动恢复和单向持久化；所有 token 写入/清理经过 user action，登录/退出失败时不修改两侧状态，401 处理会同时清理 store 与 cookie。
- profile 生命周期：初始为 `null`，另有 `profileStatus`；roles/permissions 初始为空，`rolesLoaded` 区分未加载与已加载空结果。
- 持久化：settings、lock、tagsView 写入带 `version: 1` 的结构；旧 lock/tags 数据可读取；损坏 JSON、错误字段和非法 session `pwrChrtype` 安全回退。
- UI/Router 边界：密码提醒只保存为 `passwordNotice` 状态，不弹框、不跳转；permission 只维护路由集合，不导入 Vue Router、不请求 getRouters、不注册路由。
- 测试：新增 16 条 store 测试，覆盖 app、settings、dict、lock、user 成败、tags 固定页/左右删除/恢复、permission 与迁移清单；`tests/unit` 共 59 条，含 4 条契约测试后共 63 条。
- 验证：`bun run typecheck`、`bun run test -- tests/unit/stores`、`bun run build`、`bun run build:stage`、`bun run build:prod` 均通过；store 目录扫描无无理由 `any`，唯一 `router.addRoute` 文本仅存在于迁移清单的第 12 轮延期说明。
