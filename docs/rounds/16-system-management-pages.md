# 第 16 轮：系统管理业务域

## 主要变量

本轮迁移核心管理 CRUD；范围大，允许在同一轮下拆 `16.a—16.d` 子批次，但每个子批次必须独立通过门禁。

## 页面批次

### 16.a 基础配置

- config
- dict type/data/detail
- notice/ReadUsers
- post

### 16.b 组织结构

- dept
- menu

### 16.c 用户

- user list/view
- authRole
- profile 已在第 15 轮完成，不重复迁移

### 16.d 角色与授权

- role list
- authUser
- selectUser

## 学习目标

- 用 API DTO 和 ViewModel 管理复杂 CRUD 表单。
- 类型化分页、查询条件、表格 selection 和批量操作。
- 处理树形部门/菜单、权限选择和跨页面参数。
- 将通用 CRUD 模式保持为组合函数，而不是过早制造巨型框架。

## 每个子域必须验证

- 查询、重置、分页。
- 新增、编辑、删除。
- 表单验证和服务端错误。
- 启用/停用状态。
- 单选、多选和批量操作。
- 权限指令/按钮可见性。
- 路由参数和 activeMenu。
- 导入导出（存在时）。

## 树形页面专项

- 父子节点循环或孤儿节点。
- 懒加载/全量树策略。
- checked 与 half-checked。
- 后端 ID 字符串/数字一致性。
- 编辑时父节点排除自身及子树。

## 本轮不要做

- 不把所有 CRUD 强行抽成一个配置驱动组件。
- 不复制页面局部类型到多个文件。
- 不用 `Record<string, any>` 表示表单。
- 不在一个提交中完成 16.a—16.d 全部内容。

## 练习

1. 为一个 CRUD 页面区分 Query、Create、Update、Row 四种模型。
2. 为 menu/dept tree 写非法结构测试。
3. 验证批量删除时空 selection 和部分失败。

## 验证

每个子批次执行：

```bash
bun run typecheck
bun run test -- tests/system/<subdomain>
bun run build:stage
```

完成全部子批次后运行系统域端到端流程。

## 本轮记录

### 16.a 基础配置（工作区，未单独提交）

- 页面：`src/views/system/{config,post,notice,dict}`。Query / Create / Update / Row 分模型；CRUD 组合函数在 `src/composables/crud.ts`，没有做成配置驱动框架。
- 动态路由 `system/config|post|notice|dict/*` 走 `migratedViewLoaders`；隐藏路由 `/system/dict-data/index/:dictId` 指向真实字典数据页，`activeMenu=/system/dict`。
- 开发 Mock：`vite/mock/system.ts` 覆盖 list/get/add/update/delete/cache/optionselect/export/readUsers；无 token 返回 401。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system`（143）；`bun run build:stage`。

### 16.b 组织结构（工作区，未单独提交）

- 页面：`src/views/system/{dept,menu}`。全量树（非懒加载）；编辑时父节点排除自身及子树；Query / Create / Update / Row 分模型。
- 树纯函数：`src/utils/tree-edit.ts`（成环、孤儿当根、排序差量、ID 一律字符串）。
- Mock：`vite/mock/org.ts` 覆盖 list/exclude/treeselect/CRUD/sort；拒绝成环、删根、有子节点时删除。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system`（153）；`bun run build:stage`。浏览器：部门树、修改表单、菜单展开/编辑表单。

### 16.c 用户（工作区，未单独提交）

- 页面：`src/views/system/user/{index,view,authRole}`。列表带部门树筛选、分页、状态开关、导入导出；详情抽屉；隐藏路由 `/system/user-auth/role/:userId` 分配角色，`activeMenu=/system/user`。profile 不重复迁。
- Mock：`vite/mock/user.ts` 覆盖 list/deptTree/CRUD/resetPwd/changeStatus/authRole/export/import；超级管理员 userId=`1` 不可删改。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system`（157）；`bun run build:stage`。浏览器：用户列表/部门树/详情抽屉/分配角色。

### 16.d 角色与授权（工作区，未单独提交）

- 页面：`src/views/system/role/{index,authUser,selectUser}`。列表分页、状态开关、导出；新增/编辑菜单树（half-checked + checked keys）；数据权限部门树（`dataScope==="2"` 时显示）；隐藏路由 `/system/role-auth/user/:roleId` 分配用户，`activeMenu=/system/role`。超级管理员 roleId=`1` 不可删改。
- Query / Create / Update / Row 分模型；CRUD 组合函数复用 `src/composables/crud.ts`，没有做成配置驱动框架。
- Mock：`vite/mock/role.ts` 覆盖 list/export/CRUD/changeStatus/dataScope、allocated/unallocated、cancel/selectAll、deptTree、roleMenuTreeselect；更新角色时未提交的 menuIds/deptIds 不会被清空。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system`（161）；`bun run build:stage`。浏览器：角色列表搜索/新增、编辑菜单半选、数据权限部门树、分配用户、选择用户授权与取消授权。

## 停止条件

- [x] 16.a—16.d 均有验证证据（仍在工作区，未单独提交）。
- [x] 核心 CRUD、树和授权行为与旧系统一致。
- [x] 16.a—16.d 查询/创建/更新/行模型没有混成一个全可选接口。
- [x] 16.a—16.d 权限不足路径：无 token 的 `/system/*` 返回 401；按钮使用 `v-hasPermi`。
- [x] 16.a—16.d 页面不引用 `legacy/`。

## 推荐提交

```text
refactor: migrate typed system configuration views
refactor: migrate typed organization views
refactor: migrate typed user management views
refactor: migrate typed role authorization views
```
