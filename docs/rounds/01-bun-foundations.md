# 第 1 轮：Bun 基础与仓库规则

> 状态：已完成。与第 0 轮一起包含在仓库初始提交中。策略见 [Bun 仓库策略](../reference/bun-repository-policy.md)。

## 主要变量

本轮只学习和固定 Bun，不引入 Vue 业务代码。

## 学习目标

- 区分 Bun 的包管理器、runtime、test runner 和 `bunx`。
- 理解 `packageManager`、`bun.lock`、冻结安装和可信生命周期脚本。
- 建立团队和 CI 的版本统一策略。

## 阅读材料

- [依赖兼容基线](../reference/dependency-baseline.md)
- [阶段 A 手册](../phases/phase-a-bun-and-scaffold.md)
- Bun 包管理器：<https://bun.com/docs/cli/pm>
- Bun lockfile：<https://bun.com/docs/pm/lockfile>

## 实操范围

1. 记录本机 Bun 和 Node 版本。
2. 建立最小 `package.json`，包含：
   - `private: true`
   - `type: module`
   - `packageManager: bun@<固定版本>`
3. 运行一次不安装业务依赖的 Bun 脚本，例如输出版本和当前目录。
4. 确认根 `.gitignore` 不忽略 `bun.lock`。
5. 记录 CI 将采用的 Bun 版本安装方式。

## 本轮不要做

- 不复制 `legacy/package.json`。
- 不一次安装全部旧依赖。
- 不创建 Router、Pinia 或 Element Plus 配置。
- 不删除或提交 `legacy/`。

## 练习

1. 比较 `bun run`、`bunx` 和 `bunx --bun`。
2. 解释为什么使用 Bun 时仍需关注 Vite 的 Node engines。
3. 说明为什么 `bun.lock` 应提交而 `node_modules/` 不应提交。
4. 查看 `bun pm untrusted` 和 `bun pm default-trusted`，理解生命周期脚本风险。

## 验证

```bash
bun --version
node --version
bun run env:check
git check-ignore bun.lock && exit 1 || true
```

2026-08-24 实测：

| 命令 | 结果 |
| --- | --- |
| `bun --version` | `1.4.0` |
| `node --version` | `v22.23.2` |
| `bun run env:check` | 通过。Bun runtime `1.4.0`，Bun 的 Node 兼容版本 `v26.3.0`，系统 Node `v22.23.2`，依赖数 0 |
| `bun install --frozen-lockfile` | 通过（零依赖，无 lockfile） |
| `git check-ignore bun.lock` | 退出码 1，未被忽略 |
| `bun pm untrusted` | `missing lockfile, nothing to list`（预期） |
| `bun pm default-trusted` | 368 项 |
| `bun scripts/runtime-probe.mjs` | `execPath` 为 Bun，`bun` 为 `1.4.0` |
| `node scripts/runtime-probe.mjs` | `execPath` 为系统 Node，`bun` 为 `null` |

## 停止条件

- [x] 团队 Bun 版本已写入 `packageManager`。
- [x] 可以解释 Bun runtime 与包管理器是否都被项目采用。
- [x] lockfile 和生命周期脚本策略已记录。
- [x] 本轮没有引入 Vue 或旧业务依赖。

## 本轮记录

- 开始 commit：初始提交
- 实际依赖版本：无业务依赖。Bun 1.4.0，系统 Node v22.23.2
- 本轮假设：零依赖也可以提交一个空的 `bun.lock`；`process.version` 就是系统 Node
- 发现的隐式约定：Bun 1.4.0 会删除空 lockfile；Bun 进程里的 `process.version` 是 Node 兼容版本 `v26.3.0`，不是系统 Node
- 新增兼容债：无
- 验证命令与结果：见上表
- 结束 commit：初始提交

## 第 1 轮复盘

- 我原先的假设：只要把 Bun 当成 npm 替代品即可，Node 可以忽略。
- TypeScript/测试发现的问题：本轮没有 tsc。`scripts/env-check.ts` 由 Bun 直接执行；这不能替代以后的 `vue-tsc`。
- 最终的类型或接口设计：不涉及业务类型。仓库脚本只用 Node 内置模块，避免现在引入 `@types/bun`。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 2 轮第一次安装依赖后必须生成并提交 `bun.lock`。

## 本轮产物

```text
package.json
scripts/env-check.ts
scripts/runtime-probe.mjs
docs/reference/bun-repository-policy.md
.github/workflows/bun-baseline.yml
README.md
```

## 推荐提交

```text
chore: establish bun repository baseline
```

