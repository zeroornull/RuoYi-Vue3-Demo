# RuoYi-Vue3：Bun + TypeScript + 最新 Vue 生态 20 轮迁移学习手册

> 文档状态：迁移准备阶段  
> 基线日期：2026-08-24  
> 适用对象：希望一边完成真实项目迁移、一边系统学习 Bun、TypeScript、Vue 3 与现代前端工程化的开发者

## 1. 当前仓库处于什么状态

旧项目已经完整移动到根目录下的 `legacy/`，根级 `.gitignore` 已忽略 `/legacy/`。这意味着：

- `legacy/` 是本机的只读参考副本，不再参与新项目的构建、类型检查或提交。
- 新版应用将在仓库根目录逐轮重建，而不是在旧代码上一次性批量改后缀。
- 本仓库已重新 `git init`，不再保留上游 RuoYi 提交记录，也没有 Git remote。对照旧实现只看本机 `legacy/`。
- `legacy/` 被 Git 忽略，执行 `git clean -xfd` 之类命令可能删除它。不要把它当成唯一备份。

当前根目录已经是最小可运行的 Vue + Vite + TypeScript 应用，含三环境、dev proxy 与 Element Plus 装配，不含 Router、Pinia 或旧业务页面。

## 2. 为什么要分轮迁移

一次性把 68 个 JavaScript 文件和 97 个 Vue 单文件组件改成 TypeScript，会同时引入包管理器、构建工具、类型系统、路由、状态、HTTP、组件与业务行为变化，失败后很难定位原因。

本手册采用以下约束：

1. **每轮只引入一类主要变量。**
2. **每轮结束都有可执行的最小验证和回滚点。** 从第 2 轮开始，根应用还必须持续可启动、可类型检查、可构建。
3. **先迁移边界，再迁移页面。** 环境变量、HTTP、路由元数据和状态模型决定后续类型质量。
4. **“最新”指最新兼容组合，而不是把所有包机械地安装为 `@latest`。**
5. **旧实现只用于对照，不从 `legacy/` 直接参与编译。**

## 3. 推荐阅读与执行顺序

先打开 **[20 轮迁移学习路线](./rounds/README.md)**。它包含第 0—19 轮的总表、依赖关系、建议节奏、固定学习模板和所有逐轮入口。

执行过程中持续更新 **[迁移轮次进度表](./progress.md)**，不要只凭“页面看起来能跑”标记完成。

文档现在分为两层：

| 层级 | 用途 | 文档 |
| --- | --- | --- |
| 逐轮执行 | 一次只处理一个主要变量，每轮独立验证和提交 | [第 0—19 轮路线](./rounds/README.md) |
| 阶段参考 | 解释跨轮架构、风险和完整方法 | `docs/phases/` 下 6 篇阶段手册 |

### 阶段与轮次映射

| 阶段 | 轮次 | 内容 |
| --- | ---: | --- |
| [阶段 A](./phases/phase-a-bun-and-scaffold.md) | 1—2 | Bun、Vue、Vite、最小 TS 骨架 |
| [阶段 B](./phases/phase-b-typescript-and-vite.md) | 3—5 | TS 语言、严格配置、Vite 环境与插件 |
| [阶段 C](./phases/phase-c-infrastructure-and-api.md) | 6—9 | 应用装配、共享类型、HTTP、API 合约 |
| [阶段 D](./phases/phase-d-state-routing-permissions.md) | 10—12 | Pinia、静态 Router、动态权限闭环 |
| [阶段 E](./phases/phase-e-components-and-pages.md) | 13—18 | Layout、组件、认证、系统、监控和工具域 |
| [阶段 F](./phases/phase-f-quality-and-cutover.md) | 19 | 质量门禁、依赖收敛和正式切换 |

迁移前还应阅读：

- [依赖兼容基线](./reference/dependency-baseline.md)
- [Bun 仓库策略](./reference/bun-repository-policy.md)
- [类型设计参考](./reference/type-design.md)

## 4. 每轮统一学习方法

每一轮都遵循同一个循环：

1. **阅读**：先理解本轮涉及的一个核心概念。
2. **预测**：写下预期会出现的类型错误或运行差异。
3. **实现**：只迁移本轮清单中的内容。
4. **验证**：依次运行最小测试、类型检查、构建和必要的浏览器冒烟测试。
5. **复盘**：记录“TypeScript 暴露了什么隐式约定”。
6. **提交**：每轮一个可回滚提交，不跨轮夹带重构。

建议为每轮建立学习日志：

```md
## 第 N 轮复盘

- 我原先的假设：
- TypeScript/测试发现的问题：
- 最终的类型或接口设计：
- 保留的兼容层：
- 下一轮前必须偿还的技术债：
```

## 5. 总体验收标准

迁移完成必须同时满足：

- 使用 Bun 安装依赖、运行脚本并提交 `bun.lock`。
- 所有新源码使用 TypeScript；Vue 组件脚本统一为 `<script setup lang="ts">`，少数例外有书面原因。
- 不使用 `skipLibCheck`、大量 `any` 或 `@ts-ignore` 来伪造“类型检查通过”。
- `dev`、`typecheck`、`test`、`lint`、`build:stage`、`build:prod` 均通过。
- 登录、退出、令牌过期、动态菜单、角色/权限、标签页、文件上传下载等关键行为与旧系统一致。
- 开发、预发布、生产三种环境变量均被类型化并验证。
- 根目录源码、脚本或 CI 不读取 `legacy/`。
- `bun pm scan` 的结果已审阅；无法立即修复的问题有风险记录。

## 6. 官方资料入口

- Bun 文档：<https://bun.com/docs>
- Bun + Vite：<https://bun.com/guides/ecosystem/vite>
- Vue 文档：<https://vuejs.org/guide/introduction.html>
- Vue 官方脚手架：<https://github.com/vuejs/create-vue>
- Vue + TypeScript：<https://vuejs.org/guide/typescript/overview.html>
- Vite 文档：<https://vite.dev/guide/>
- Vue Router：<https://router.vuejs.org/>
- Pinia：<https://pinia.vuejs.org/>
- Element Plus：<https://element-plus.org/en-US/>
- TypeScript TSConfig：<https://www.typescriptlang.org/tsconfig/>
