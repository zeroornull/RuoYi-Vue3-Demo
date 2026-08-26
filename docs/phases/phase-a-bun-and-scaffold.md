# 阶段 A 手册：Bun 与现代 Vue 最小骨架

> 对应细分轮次：第 1—2 轮。本文件是阶段参考，不要求在一次学习会话中全部完成。

## 本阶段目标

只证明新工具链可以工作，不迁移 RuoYi 业务。完成后根目录应是一个最小但完整的 Vue + Vite + TypeScript 应用。

## 要学习的内容

- Bun 在本项目中承担包管理、lockfile 和脚本执行入口。
- Vue SFC 的编译仍由 Vite 与 `@vitejs/plugin-vue` 完成。
- TypeScript 负责静态检查，不直接替代浏览器运行时。
- `bun.lock` 保证团队和 CI 安装同一依赖图。

## 步骤 1：确认运行时

```bash
bun --version
node --version
```

基线机器是 Bun 1.4.0、Node 22.23.2。Vite 8 声明的 Node engines 是 `^20.19.0 || >=22.12.0`。即使使用 Bun，也保留满足 engines 的 Node，供编辑器、CI 和第三方工具使用。

## 步骤 2：重新解析版本

先阅读[依赖兼容基线](../reference/dependency-baseline.md)，再查询：

```bash
bun info vue --json
bun info vite --json
bun info @vitejs/plugin-vue --json
bun info vue-router --json
bun info pinia --json
bun info typescript --json
bun info typescript-eslint --json
```

检查字段：

- `version`
- `engines`
- `peerDependencies`
- `dist-tags`

若执行时版本已变化，更新依赖基线文档后再安装。

## 步骤 3：初始化 package.json

根目录已有 `docs/`，不适合直接运行会要求空目录的脚手架。可在相邻临时目录运行官方脚手架作为参考：

```bash
bun create vue@latest ../RuoYi-Vue3-scaffold
```

不要直接覆盖根目录；对照脚手架手工建立最小文件，理解每个文件的作用。

根 `package.json` 至少包含：

```json
{
  "name": "ruoyi-vue3-bun-ts",
  "private": true,
  "type": "module",
  "packageManager": "bun@1.4.0",
  "scripts": {
    "dev": "bunx --bun vite",
    "typecheck": "vue-tsc --build",
    "build": "bun run typecheck && bunx --bun vite build",
    "build:stage": "bun run typecheck && bunx --bun vite build --mode staging",
    "build:prod": "bun run typecheck && bunx --bun vite build --mode production",
    "preview": "bunx --bun vite preview"
  }
}
```

执行迁移时将 `packageManager` 更新为团队实际固定的 Bun 版本。Bun 官方 Vite 指南指出 Vite CLI 的 shebang 默认指向 Node；`bunx --bun vite` 用于明确让 CLI 由 Bun 运行。若团队只想用 Bun 管包、仍让 Vite 走 Node，也必须把这个选择写清楚并在 CI 复现。

## 步骤 4：安装最小依赖

默认先参考 `create-vue@latest` 生成的版本组合。若希望在基线日手工选择最高兼容版本，可使用：

```bash
bun add vue@3.5.41
bun add -d \
  vite@8.2.2 \
  @vitejs/plugin-vue@6.0.8 \
  typescript@6.0.3 \
  vue-tsc@3.3.11
```

安装后检查 Vue 编译器是否与 runtime 同 patch：

```bash
bun pm why @vue/compiler-sfc
```

若官方脚手架选用了更保守的 TypeScript 版本，第一轮优先使用脚手架组合。不要为了“版本号更大”在脚手架、Vue 语言工具和 lint 尚未一起验证时强行升级。

本阶段不要安装全部旧业务依赖。

## 步骤 5：创建最小文件

需要：

```text
index.html
src/App.vue
src/main.ts
src/vite-env.d.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
```

最小 `src/main.ts`：

```ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

最小 `vite.config.ts`：

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

使用 ESM 的 `import.meta.url`，不要把旧配置中的 `__dirname` 原样复制进 `type: module` 项目。

## 步骤 6：验证 lockfile 与构建

```bash
bun install
bun install --frozen-lockfile
bun run typecheck
bun run build
bun run dev
```

浏览器只验证：

- 页面可打开。
- 控制台无错误。
- 修改 `App.vue` 后 HMR 生效。

## 本阶段练习

1. 解释 `bun install`、`bun run`、Vite dev server 和 `vue-tsc` 的职责差异。
2. 暂时破坏一个 prop 类型，观察 `dev` 和 `typecheck` 的反馈差异。
3. 删除 `bun.lock` 重新安装，比较依赖解析结果；之后恢复 lockfile。

## 验收清单

- [ ] 根目录有且仅有 `bun.lock` 作为前端锁文件。
- [ ] `bun install --frozen-lockfile` 通过。
- [ ] `bun run typecheck` 通过。
- [ ] `bun run build` 通过。
- [ ] `bun run dev` 可访问且 HMR 正常。
- [ ] Vite 是有意通过 `bunx --bun` 运行，而不是无意落回 Node shebang。
- [ ] `vue` 与 `@vue/compiler-sfc` 解析到相同 patch。
- [ ] 新源码不引用 `legacy/`。
- [ ] 本阶段没有引入 Router、Pinia、Element Plus 或旧业务代码。

## 推荐提交

```text
chore: bootstrap bun vue typescript app
```

## 回滚点

回滚第 1—2 轮提交后，仓库应回到“只有文档和本机 legacy 快照”的状态。不要删除 `docs/` 或修改旧历史。
