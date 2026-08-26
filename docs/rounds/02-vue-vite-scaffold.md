# 第 2 轮：Vue + Vite + TypeScript 最小骨架

> 状态：已完成。按要求未提交。策略见 [Bun 仓库策略](../reference/bun-repository-policy.md)。

## 主要变量

本轮只引入最小 Vue SFC 工具链，使根目录重新可运行。

## 学习目标

- 理解 Vue runtime、SFC compiler、Vite 插件和 `vue-tsc` 的职责。
- 学会用官方 `create-vue@latest` 获取当时组合验证过的配置。
- 掌握 Bun 驱动 Vite CLI 的方式。

## 参考

- [阶段 A 手册](../phases/phase-a-bun-and-scaffold.md)
- Vue 工具链：<https://vuejs.org/guide/scaling-up/tooling.html>
- Bun + Vite：<https://bun.com/guides/ecosystem/vite>

## 实操范围

1. 在相邻临时目录运行：

   ```bash
   bun create vue@latest ../RuoYi-Vue3-scaffold
   ```

2. 脚手架可选择 TypeScript、Router、Pinia 用于观察官方组合，但根目录本轮只复制：
   - `index.html`
   - 最小 `src/main.ts`
   - 最小 `src/App.vue`
   - Vite/TypeScript 必需配置
3. 根项目只安装 Vue、Vite、`@vitejs/plugin-vue`、TypeScript、`vue-tsc`。
4. 使用 `bunx --bun vite` 运行 dev/build。
5. 检查 `vue` 与 `@vue/compiler-sfc` 是否解析到相同 patch。

## 本轮不要做

- 不迁移旧样式、组件、Router、Pinia、Element Plus。
- 不复制整个脚手架的所有可选工具。
- 不复制 `legacy/src/main.js`。

## 验证

```bash
bun install --frozen-lockfile
bun pm why @vue/compiler-sfc
bun run typecheck
bun run build
bun run dev
```

浏览器验证：页面可开、无控制台错误、HMR 生效。

2026-08-25 实测：

| 命令/检查                        | 结果                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `create-vue --ts --bare`         | 脚手架 `typescript@~6.0.0`、`vue@^3.5.40`、`vite@^8.1.5`                                                                                   |
| 根目录安装                       | `vue@3.5.41`、`vite@8.2.2`、`@vitejs/plugin-vue@6.0.8`、`typescript@6.0.3`、`vue-tsc@3.3.11`、`@vue/tsconfig@0.9.1`、`@types/node@22.20.1` |
| `bun pm why @vue/compiler-sfc`   | `@vue/compiler-sfc@3.5.41` ← `vue@3.5.41`                                                                                                  |
| `bun install --frozen-lockfile`  | 通过，`bun.lock` 167 行                                                                                                                    |
| `bun run typecheck`              | 通过                                                                                                                                       |
| `bun run build`                  | 通过，Vite 8.2.2 production client                                                                                                         |
| `bun run dev`                    | `http://127.0.0.1:5173/`                                                                                                                   |
| 浏览器                           | 标题 `RuoYi-Vue3`，正文 `Round 2: Vue + Vite + TypeScript`，error/warn 为空                                                                |
| HMR                              | 改 `App.vue` 后 Vite 日志 `hmr update /src/App.vue`，页面变为 `HMR ok`                                                                     |
| `node_modules/.bin/vite` shebang | `#!/usr/bin/env node`，因此脚本使用 `bunx --bun vite`                                                                                      |
| `bun pm untrusted`               | 0                                                                                                                                          |
| 故意 `const round: number = "2"` | `vue-tsc` 报 `TS2322`；Vite 仍编译并 HMR，控制台无类型错误                                                                                 |

## 练习

1. 暂时制造一个 SFC prop 类型错误，比较 Vite dev 和 `vue-tsc` 反馈。
2. 解释 `@vitejs/plugin-vue` 与 `@vue/compiler-sfc` 的关系。
3. 去掉 `--bun` 观察实际 CLI runtime，再恢复明确配置。

## 停止条件

- [x] 根目录最小 Vue TS 应用可启动。
- [x] 类型检查和生产构建通过。
- [x] `bun.lock` 已生成且可冻结安装。
- [x] 根应用不引用 `legacy/`。
- [x] 尚未引入业务框架和业务代码。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：见上表。未安装 Router、Pinia、Element Plus、vue-devtools
- 本轮假设：Vite dev 会像 `vue-tsc` 一样挡住类型错误
- 发现的隐式约定：Vite 只转译不类型检查；`@vitejs/plugin-vue` 调 `@vue/compiler-sfc` 编译 SFC，该编译器应由 `vue` 精确带入同一 patch；Vite CLI shebang 指向 Node
- 新增兼容债：无
- 验证命令与结果：见上表
- 结束 commit：未提交（按用户要求）

## 第 2 轮复盘

- 我原先的假设：装上 Vue 和 Vite 就等于有了 TypeScript 门禁。
- TypeScript/测试发现的问题：`vue-tsc --build` 才会报告 `Type 'string' is not assignable to type 'number'`；dev server 对同一错误保持静默。
- 最终的类型或接口设计：本轮只有空壳。`tsconfig.app.json` 继承 `@vue/tsconfig/tsconfig.dom.json`；`tsconfig.node.json` 只覆盖 `vite.config.ts`，类型来自 `@types/node@22`。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 3 轮在独立实验目录学类型语言，不改这个空壳的业务。

## 本轮产物

```text
index.html
public/favicon.ico
src/main.ts
src/App.vue
src/vite-env.d.ts
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
bun.lock
```

## 推荐提交

```text
chore: bootstrap minimal vue vite typescript app
```
