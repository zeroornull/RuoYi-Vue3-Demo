# Bun 仓库策略

> 执行日期：2026-08-24  
> 本机实测：Bun `1.4.0`，Node `v22.23.2`

本文件是第 1 轮的策略记录。第 2 轮才引入 Vue 与 Vite；此处不安装业务依赖。

## 1. Bun 在本仓库承担什么

| 能力               | 本仓库是否采用 | 说明                                                |
| ------------------ | -------------- | --------------------------------------------------- |
| 包管理器           | 是             | `bun install`、`bun.lock`、`packageManager`         |
| 脚本入口           | 是             | `bun run <script>`                                  |
| 仓库脚本 runtime   | 是             | `scripts/` 由 Bun 直接执行 TypeScript/JS            |
| 浏览器应用 runtime | 否             | 前端代码跑在浏览器，禁止使用 `Bun.*`                |
| Vite CLI runtime   | 第 2 轮起采用  | 使用 `bunx --bun vite`，避免 Vite shebang 落到 Node |
| 测试运行器         | 本轮不决定     | 后续可用 `bun test` 或 Vitest；不在第 1 轮引入      |

`package.json` 同时固定：

```json
{
  "packageManager": "bun@1.4.0",
  "engines": {
    "bun": "1.4.0",
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

`packageManager` 供 Corepack 格式和 `oven-sh/setup-bun` 读取。`engines.node` 不是因为应用跑在 Node 上，而是因为 Vite 8 仍声明 Node `^20.19.0 || >=22.12.0`：编辑器插件、CI 和部分工具链可能走 Node。

不要把 Bun 进程里的 `process.version` 当成系统 Node。本机实测：

- `bun --version` → `1.4.0`
- 在 `bun run` 里 `process.version` → `v26.3.0`（Bun 的 Node 兼容版本）
- 系统 `node --version` → `v22.23.2`

`scripts/env-check.ts` 会分别报告这两项，并用系统 Node 检查 Vite engines。

## 2. `bun run`、`bunx`、`bunx --bun`

| 命令               | 作用                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| `bun run <script>` | 执行 `package.json` scripts，或直接跑仓库里的文件；本仓库脚本默认是 Bun runtime |
| `bunx <pkg>`       | 类似 `npx`，按可执行文件 shebang 启动，常见 CLI 的 shebang 是 Node              |
| `bunx --bun <pkg>` | 覆盖 shebang，强制用 Bun 跑该 CLI                                               |

第 2 轮安装 Vite 后，脚本必须写成 `bunx --bun vite`，而不是假设 `bunx vite` 一定跑在 Bun 上。

本轮对照：

```bash
bun run env:check
bun scripts/runtime-probe.mjs
node scripts/runtime-probe.mjs
```

`runtime-probe.mjs` 的 shebang 是 `#!/usr/bin/env node`。`bun` 直接执行时仍是 Bun；`node` 执行时 `process.versions.bun` 为 `null`。

## 3. lockfile

- 一旦出现任何依赖，必须提交 `bun.lock`。Bun 用它复现同一依赖图。
- 不提交 `node_modules/`。
- 不同时保留 `package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`；根 `.gitignore` 已忽略它们。
- `.gitignore` 不得忽略 `bun.lock`。第 1 轮已用 `git check-ignore bun.lock` 验证。
- CI 与干净环境使用：

```bash
bun install --frozen-lockfile
```

锁文件与 `package.json` 不一致时该命令失败，这是预期行为。

**第 1 轮特例：** Bun 1.4.0 在零依赖时会打印 `No packages! Deleted empty lockfile` 并删除空锁文件。第 2 轮安装 Vue/Vite 后已生成 `bun.lock`，此后 CI 必须走冻结安装。

## 4. 生命周期脚本

Bun 默认不执行任意 `preinstall` / `postinstall`。只有默认信任列表里的包，或写进 `trustedDependencies` 的包，才会跑生命周期脚本。

本轮策略：

- 不预填 `trustedDependencies`。
- 安装新依赖后检查 `bun pm untrusted`。
- 只有在确认脚本必要、来源可信之后，才把包名加入 `trustedDependencies`。
- 可用 `bun pm default-trusted` 查看 Bun 内置白名单；白名单不是可以省略审查的理由。本机 Bun 1.4.0 的默认白名单有 368 项。
- `bun pm untrusted` 需要已有 lockfile。第 1 轮零依赖、没有 `bun.lock`，该命令会报 `missing lockfile, nothing to list`。第 2 轮生成锁文件后再查。

## 5. CI 安装方式

GitHub Actions 使用 `oven-sh/setup-bun@v2`，让它读取 `package.json` 的 `packageManager`，不要在 workflow 里再写一份可能漂移的 Bun 版本。

同时安装 Node 22.x，满足后续 Vite 8 的 engines，供可能落到 Node 的工具使用。

最小 workflow 见 `.github/workflows/bun-baseline.yml`，仅 `workflow_dispatch` 手动触发：

1. `actions/checkout`
2. `oven-sh/setup-bun@v2`
3. `actions/setup-node@v4`（Node 22）
4. `bun install --frozen-lockfile`
5. `bun run env:check`

本机开发者安装 Bun 的方式：

```bash
curl -fsSL https://bun.sh/install | bash
# 或升级到与 packageManager 相同的版本
bun upgrade
```

安装后确认：

```bash
bun --version   # 必须为 1.4.0
node --version  # 必须满足 ^20.19.0 || >=22.12.0
```

## 6. 第 1 轮边界

- 不复制 `legacy/package.json`。
- 不安装 Vue、Vite、Router、Pinia、Element Plus。
- 不把 `legacy/` 加入 Git。
- 根目录此时仍不是可运行前端应用。
