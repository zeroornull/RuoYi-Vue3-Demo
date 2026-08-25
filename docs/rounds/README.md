# 20 轮迁移学习路线

> 总轮次：第 0—19 轮。第 0—1 轮已经完成，第 2—19 轮需要后续逐轮执行。  
> 设计目标：每轮只引入一个主要学习变量，并以新根目录可验证为停止条件。

统一状态记录见[迁移轮次进度表](../progress.md)。

## 1. 为什么从 6 轮扩展到 20 轮

原先的 6 篇文档覆盖方向正确，但每篇同时包含多个重大变化，更适合作为“阶段手册”。当前旧项目包含 68 个 JavaScript 文件和 97 个 Vue 组件，并跨越以下变化：

- npm 风格依赖管理 → Bun。
- JavaScript → 严格 TypeScript。
- Vite 6 → Vite 8。
- Vue Router 4 → 5。
- Pinia 3 → 4。
- ECharts 5 → 6。
- HTTP、权限、动态路由、布局、通用组件和多个业务域迁移。

若把这些压缩成 6 次提交，学习者很难判断错误来源。因此现在采用两层结构：

- `docs/phases/`：6 篇完整阶段手册，用于理解全局方法和风险。
- `docs/rounds/`：20 个细分轮次，用于实际学习、修改、验证和提交。

## 2. 总路线

| 轮次 | 主题 | 主要变量 | 结束时应得到什么 |
| ---: | --- | --- | --- |
| 0 | 旧项目归档与基线 | 仓库结构 | `legacy/`、文档和可恢复基线 |
| 1 | Bun 基础 | 包管理器 | Bun 版本策略、最小 package、lockfile 规则 |
| 2 | Vue + Vite 最小骨架 | 框架启动 | 根目录最小 Vue TS 应用可运行 |
| 3 | TypeScript 语言实验 | 类型语言 | 掌握 unknown、收窄、泛型、联合类型 |
| 4 | 严格 TS 工程配置 | 编译边界 | 严格 `tsconfig`、声明文件、类型门禁 |
| 5 | Vite 8、环境与插件 | 构建系统 | 三环境、代理、alias、插件最小集 |
| 6 | 应用装配 | Vue 应用入口 | `main.ts`、插件和全局能力边界 |
| 7 | 共享类型与工具 | 领域基础 | 纯工具、字典、树、时间等可靠类型 |
| 8 | HTTP、鉴权、缓存、下载 | 网络边界 | 类型化 Axios 客户端及行为测试 |
| 9 | API 合约 | 后端协议 | login/menu/system/monitor/tool API 类型 |
| 10 | Pinia | 状态管理 | 7 个 store 分批迁移并测试 |
| 11 | 静态 Router | 导航模型 | 静态路由、RouteMeta、错误页与 profile 路由 |
| 12 | 动态路由与权限 | 安全导航 | 登录—菜单—动态路由—退出闭环 |
| 13 | Layout、主题、标签与图标 | 应用壳 | 管理端框架和导航交互恢复 |
| 14 | 通用组件与表单 | 组件类型 | 公共组件、上传、编辑器、Crontab 等 |
| 15 | 认证与个人中心 | 第一业务域 | 登录、注册、锁屏、profile 完整迁移 |
| 16 | 系统管理域 | 核心 CRUD | 用户、角色、菜单、部门、字典等 |
| 17 | 监控域 | 监控页面 | 任务、日志、在线、缓存、服务器等 |
| 18 | 工具域和复杂第三方 | 高复杂集成 | 代码生成、表单构建、Swagger、图表等 |
| 19 | 质量、依赖收敛和切换 | 交付门禁 | 干净安装、测试、Lint、全构建和回退证据 |

## 3. 阶段映射

| 阶段手册 | 细分轮次 |
| --- | --- |
| [阶段 A：Bun 与骨架](../phases/phase-a-bun-and-scaffold.md) | 1—2 |
| [阶段 B：TypeScript 与 Vite](../phases/phase-b-typescript-and-vite.md) | 3—5 |
| [阶段 C：基础设施与 API](../phases/phase-c-infrastructure-and-api.md) | 6—9 |
| [阶段 D：状态、路由与权限](../phases/phase-d-state-routing-permissions.md) | 10—12 |
| [阶段 E：组件与业务页面](../phases/phase-e-components-and-pages.md) | 13—18 |
| [阶段 F：质量与切换](../phases/phase-f-quality-and-cutover.md) | 19 |

## 4. 每轮固定工作流

每轮开始前：

```bash
git status --short
bun --version
```

每轮必须填写：

```md
## 本轮记录

- 开始 commit：
- 实际依赖版本：
- 本轮假设：
- 发现的隐式约定：
- 新增兼容债：
- 验证命令与结果：
- 结束 commit：
```

每轮执行顺序：

1. 阅读该轮文档和对应阶段手册片段。
2. 写下预期错误，不先盲目复制旧文件。
3. 添加当前轮最小测试或检查。
4. 只迁移当前轮范围。
5. 运行当前轮最小验证。
6. 运行全局 `typecheck` 和当前已有的测试。
7. 更新 `docs/migration-debt.md`。
8. 创建一个可回滚提交。

## 5. 轮次依赖关系

```text
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
                                  ↓
10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
```

这是主要路径，不建议跳过：

- 第 8 轮依赖第 7 轮的基础类型和纯工具。
- 第 9 轮依赖第 8 轮的 HTTP 客户端。
- 第 10 轮依赖第 9 轮的 API 类型。
- 第 12 轮同时依赖 store、router、login/menu API。
- 第 15—18 轮依赖应用壳和公共组件。
- 第 19 轮不能替代前面轮次的验证。

## 6. 建议节奏

不要用日历时间代替验收。可参考：

- 第 0—5 轮：每轮 0.5—1.5 天。
- 第 6—12 轮：每轮 1—3 天。
- 第 13—14 轮：每轮 2—4 天。
- 第 15—18 轮：按实际页面数量，每轮 2—5 天。
- 第 19 轮：至少预留 2—4 天做干净环境与回归验证。

如果某轮超过建议范围，不要直接把未完成内容推到下一轮；先把本轮再拆成 `N.a`、`N.b` 子批次，同时保持同一停止条件。

## 7. 逐轮入口

1. [第 0 轮：归档与基线](./00-archive-and-baseline.md)
2. [第 1 轮：Bun 基础](./01-bun-foundations.md)
3. [第 2 轮：Vue + Vite 骨架](./02-vue-vite-scaffold.md)
4. [第 3 轮：TypeScript 语言实验](./03-typescript-language-lab.md)
5. [第 4 轮：严格 TS 工程配置](./04-strict-ts-project-config.md)
6. [第 5 轮：Vite、环境与插件](./05-vite-env-and-plugins.md)
7. [第 6 轮：应用装配](./06-application-bootstrap.md)
8. [第 7 轮：共享类型与工具](./07-shared-types-and-utils.md)
9. [第 8 轮：HTTP 边界](./08-http-auth-cache-download.md)
10. [第 9 轮：API 合约](./09-api-contracts-by-domain.md)
11. [第 10 轮：Pinia](./10-pinia-store-migration.md)
12. [第 11 轮：静态 Router](./11-static-router-and-meta.md)
13. [第 12 轮：动态路由与权限](./12-dynamic-router-and-permission-loop.md)
14. [第 13 轮：Layout 与主题](./13-layout-theme-tags-icons.md)
15. [第 14 轮：通用组件](./14-shared-components-and-forms.md)
16. [第 15 轮：认证与个人中心](./15-auth-profile-lock-pages.md)
17. [第 16 轮：系统管理域](./16-system-management-pages.md)
18. [第 17 轮：监控域](./17-monitoring-pages.md)
19. [第 18 轮：工具域与第三方](./18-tools-codegen-third-party.md)
20. [第 19 轮：质量与切换](./19-quality-dependency-cutover.md)
