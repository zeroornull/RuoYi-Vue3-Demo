# RuoYi-Vue3（Bun + TypeScript）

若依管理端前端，已迁到 Bun 1.4.0、Vue 3.5、Vite 8、严格 TypeScript 与 Vue Router 5 / Pinia 4。开发默认走本地 Mock，不需要本机 Java `:8080`。

- 进度：[docs/progress.md](./docs/progress.md)
- 学习手册：[docs/README.md](./docs/README.md)
- 债务：[docs/migration-debt.md](./docs/migration-debt.md)

## 要求

- Bun **1.4.0**（`packageManager`）
- Node **^20.19.0 || >=22.12.0**（Vite 8 仍声明 Node engines；本仓库 CI 用 22）

```bash
bun --version    # 1.4.0
node --version   # 例如 v22.23.2
```

## 安装

必须冻结 lockfile，不要在干净机器上改依赖图：

```bash
bun install --frozen-lockfile
bun run env:check
```

不要从本机 `legacy/` 拷文件进构建。`legacy/` 被 Git 忽略，只是对照用的本地快照，**不是备份，也不是回退手段**。

## 开发

```bash
bun run dev            # http://127.0.0.1:5173/  默认 VITE_MOCK_API=true
bun run dev:backend    # 关闭 Mock，代理到 localhost:8080
```

Mock 账号：`admin` / `admin123`，验证码任意非空。接真实后端时设 `VITE_MOCK_API=false` 或使用 `dev:backend`。

端口是 **5173**，不是旧项目的 80（本机绑 80 会 `EACCES`）。

## 测试与质量门禁

```bash
bun run test           # Vitest 组件测试 + bun test（unit/system/monitor/tools/codegen）
bun run test:watch     # Vitest watch
bun run lint
bun run format:check
bun run typecheck
bun run check          # typecheck → test → lint → format:check → production 构建
```

集成测试与契约样本不在默认 `test` 脚本里，需要时：

```bash
bun test tests/integration tests/contracts
```

## 构建

| 命令                                       | mode               | API 前缀     |
| ------------------------------------------ | ------------------ | ------------ |
| `bunx --bun vite build --mode development` | development        | `/dev-api`   |
| `bun run build:stage`                      | staging            | `/stage-api` |
| `bun run build:prod`                       | production         | `/prod-api`  |
| `bun run build`                            | 当前默认 Vite mode | 见 `.env.*`  |
| `bun run preview`                          | 预览 `dist/`       |              |

`VITE_BUILD_COMPRESS=gzip` 只做环境校验，**不会**产出 `.gz`。压缩交给 Nginx / CDN / 对象存储。

产物在 `dist/`。静态资源走 `dist/static/{js,css,...}`。

## 部署要点

1. 按环境选 staging 或 production 构建。
2. 把 `dist/` 放到静态托管；API 反代到 Java 后端，前缀与 `VITE_APP_BASE_API` 一致。
3. 不要把 `legacy/`、`.env.local` 或开发 Mock 打进生产镜像。
4. Mock 插件不进 production 构建。

## 排错

| 现象               | 处理                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| 登录 502           | 没有 Java `:8080`。用 `bun run dev`（Mock）或先起后端再 `dev:backend`。                                |
| 登录成功不跳转     | 看 `getInfo` / `getRouters` 是否 401；清掉坏掉的 `Admin-Token` cookie。                                |
| `skipLibCheck`     | 应用工程必须保持 `true`：Element Plus / Vue Router 声明过不了 `exactOptionalPropertyTypes`。见债务表。 |
| `bun pm scan` 失败 | 需要在 `bunfig.toml` 配置 `[install.security] scanner`。尚未接入扫描器。                               |
| 想用 TypeScript 7  | `typescript-eslint@8.68.0` peer 仍是 `<6.1.0`，继续钉 `typescript@6.0.3`。                             |

## 回退（不使用 `legacy/`）

当前已入库 HEAD：`8008e67`（file-saver 适配器）。第 19.d 起的清单/`legacy/` 边界改动若还在工作区，用 Git 丢弃即可。

| 目标                     | 命令                                                     |
| ------------------------ | -------------------------------------------------------- |
| 回到已推送的 `master`    | `git fetch origin && git checkout --force origin/master` |
| 回到第 11 轮静态路由基线 | `git checkout cb50b8e`                                   |
| 丢掉未提交改动           | `git restore --worktree --staged .` 然后按需删未跟踪文件 |

不要用 `legacy/` 覆盖 `src/`。回退后重新 `bun install --frozen-lockfile` 再构建。

## 文档

| 文档                                                                                           | 内容                     |
| ---------------------------------------------------------------------------------------------- | ------------------------ |
| [docs/progress.md](./docs/progress.md)                                                         | 轮次进度                 |
| [docs/rounds/19-quality-dependency-cutover.md](./docs/rounds/19-quality-dependency-cutover.md) | 质量门禁与切换           |
| [docs/migration-debt.md](./docs/migration-debt.md)                                             | 仍须外部版本才能关的三项 |
| [docs/reference/bun-repository-policy.md](./docs/reference/bun-repository-policy.md)           | Bun 仓库约定             |
