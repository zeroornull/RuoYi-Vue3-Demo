# 第 19 轮：质量门禁、依赖收敛与正式切换

## 前置条件

第 0—18 轮均已有验收证据；本轮不是用来补做前面遗漏的类型和行为测试。

## 主要变量

本轮把“各模块能工作”提升为“仓库可在干净环境稳定交付”。

## 学习目标

- 建立统一 typecheck/test/lint/format/build 门禁。
- 审查依赖安全、许可证、重复依赖和暂缓升级。
- 用行为对照和发布证据完成正式切换。

## 质量工具

根据执行时兼容矩阵安装并配置：

- Vitest
- Vue Test Utils
- ESLint flat config
- `eslint-plugin-vue`
- `typescript-eslint`
- Prettier

TypeScript 必须继续满足 typescript-eslint 官方支持范围；不能为了追逐 `typescript@latest` 进入明确的 peer 范围之外。

## 统一门禁

```bash
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run lint
bun run format:check
bun run build --mode development
bun run build:stage
bun run build:prod
bun pm licenses
bun pm scan
```

## 依赖收敛

逐包分类：

- 保留：有调用者、有测试、版本兼容。
- 替换：独立提交且有行为回归。
- 删除：无调用者或已被原生能力取代。
- 暂缓：记录 peer/version 解除条件。

重点审查：

- setup-extend 是否已由 `defineOptions` 替代。
- auto-import 是否仍有必要。
- build compression 是否与部署层重复。
- clipboard、file-saver、nprogress 等长期未更新包是否被适配器隔离。
- 是否同时存在重复版本的 VueUse、ECharts 或 compiler-sfc。

## 清理迁移债

```bash
rg -n "@ts-ignore|@ts-expect-error|\bany\b|TODO.*migration|legacy/" src tests vite.config.ts
```

逐条关闭 `docs/migration-debt.md`。不得以“以后再说”为理由保留全局关闭严格性或生产代码对 `legacy/` 的引用。

## 行为对照

至少覆盖：

- 登录、失败、验证码、退出、token 过期。
- 动态菜单、角色和权限。
- 用户/角色/部门/菜单 CRUD。
- 字典、配置、通知和岗位。
- 任务、日志、缓存、服务器监控。
- 上传、下载、编辑器、裁剪、图表和拖拽。
- 主题、TagsView、keep-alive、移动端布局。
- development、staging、production 构建配置。

## 干净环境验证

在没有 `node_modules`、没有本地缓存、没有 `legacy/` 的环境中执行冻结安装和全部门禁。这样才能证明新项目没有隐式读取本机旧快照。

## 切换与回退

- 记录最终 commit 和构建产物摘要。
- 保留迁移前 tag/commit。
- 用已发布产物或 Git ref 回退，不依赖 `legacy/`。
- 更新根 README 的安装、开发、测试、构建、部署和排错说明。

## 停止条件

- [ ] 干净环境冻结安装通过。
- [ ] typecheck/test/lint/format/三环境 build 全部通过。
- [ ] 依赖扫描和许可证结果已人工审阅。
- [ ] `migration-debt.md` 已清空或只剩有外部解除条件的窄问题。
- [ ] 源码、测试、脚本和 CI 不引用 `legacy/`。
- [ ] 关键行为对照有自动化或人工证据。
- [ ] 回退步骤已演练且不依赖本机目录。

## 推荐提交

```text
test: enforce migration quality gates
chore: remove migration compatibility layers
docs: document bun typescript delivery workflow
```

## 完成定义

只有本轮全部通过，才能宣布项目已完成 Bun + TypeScript + 最新兼容 Vue 生态迁移。

