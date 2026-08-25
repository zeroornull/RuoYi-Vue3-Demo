# 依赖兼容基线

> 快照日期：2026-08-24  
> 原则：这里记录的是迁移计划制定时的注册表快照，不是永久真理。真正执行某一轮时必须重新查询。

第 2 轮执行时复核（2026-08-25）：

- `vue@3.5.41`、`vite@8.2.2`、`@vitejs/plugin-vue@6.0.8`、`vue-tsc@3.3.11`、`@vue/tsconfig@0.9.1` 与基线一致。
- `typescript@latest` 仍为 7.0.2；`typescript-eslint@8.68.0` 的 peer 仍是 `>=4.8.4 <6.1.0`，因此继续钉 `typescript@6.0.3`。
- 官方 `create-vue@latest --ts --bare` 使用 `typescript@~6.0.0`、`vue@^3.5.40`、`vite@^8.1.5`。本轮在该范围内选择已审阅的最高精确版本。
- 脚手架默认 `@types/node@24` 与 `@tsconfig/node24`。本仓库 CI/本机是 Node 22，改为 `@types/node@22.20.1`，不安装 Node 24 预设。
- 未安装脚手架中的 `vite-plugin-vue-devtools`、`npm-run-all2`。

第 5 轮执行时复核（2026-08-25）：

- 安装 `sass-embedded@1.103.1`。Bun 拦截了传递依赖 `@parcel/watcher` 的 `install` 脚本；`sass --version` 仍为 1.103.1，未加入 `trustedDependencies`。
- 未安装 `vite-plugin-svg-icons`、`vite-plugin-compression`、`unplugin-auto-import`、`unplugin-vue-setup-extend-plus`。

第 6 轮执行时复核（2026-08-25）：

- 安装 `element-plus@2.14.5`。未装 `@element-plus/icons-vue`、`js-cookie`、`vue-router`、`pinia`。
- 应用工程因 EP / `@vueuse` 声明问题将 `skipLibCheck` 改回 `true`，见 `docs/migration-debt.md`。

## 1. 为什么“最新”必须先解析再安装

包的 `latest` 标签只代表发布者设置的默认标签，不保证：

- 与其他最新包互相兼容。
- 属于 Vue 3 分支。
- 已支持当前 Vite 主版本。
- 类型工具已经支持当前 TypeScript 主版本。
- 仍在积极维护。

每次升级先执行：

```bash
bun --version
bun info vue version
bun info vite --json | jq '{version, engines, peerDependencies, distTags: .["dist-tags"]}'
bun info typescript-eslint --json | jq '{version, engines, peerDependencies}'
npm view vuedraggable dist-tags peerDependencies --json
```

如果没有 `jq`，直接阅读 `bun info <package> --json` 输出即可。

## 2. 推荐的核心兼容组合

下表将“绝对最新”与“本手册默认实操版本”分开。版本来自基线日查询；执行时应重新验证。

| 包 | 基线日注册表版本 | 默认实操选择 | 原因 |
| --- | ---: | ---: | --- |
| Bun | 本机 1.4.0 | 1.4.0 或执行时稳定版 | 包管理器与脚本入口；团队/CI 必须统一 |
| `vue` | 3.5.41 | 3.5.41 | Vue 3 当前稳定线 |
| `@vue/compiler-sfc` | 3.5.41 | 由 `vue@3.5.41` 精确带入 | 与 Vue runtime 保持同一 patch；安装后仍要检查解析结果 |
| `vite` | 8.2.2 | 8.2.2 | 与 Router 5、插件 6 的 peer 范围一致 |
| `@vitejs/plugin-vue` | 6.0.8 | 6.0.8 | 支持 Vite 5—8、Vue 3.2.25+ |
| `typescript` | 7.0.2 | **6.0.3** | 最新 `typescript-eslint` 8.67.0 仅声明支持 `<6.1.0` |
| `vue-tsc` | 3.3.11 | 3.3.11 | peer 为 TypeScript 5+ |
| `vue-router` | 5.2.0 | 5.2.0 | 其 peer 与 Vue 3.5.34+、Vite 7.3+/8、Pinia 3/4 一致 |
| `pinia` | 4.0.3 | 4.0.3 | peer 需要 Vue 3.5.11+、TypeScript 5.6+ |
| `element-plus` | 2.14.5 | 2.14.5 | peer 需要 Vue 3.3.7+ |
| `@element-plus/icons-vue` | 2.3.2 | 2.3.2 | 与 Element Plus 实际用例一起验证 |
| `@vueuse/core` | 14.4.0 | 14.4.0 | 按使用 API 逐项验证 |
| `axios` | 1.19.0 | 1.19.0 | 拦截器和自定义 config 类型需单独迁移 |
| `sass-embedded` | 1.103.1 | 1.103.1 | 保留现有 SCSS 能力 |
| `vitest` | 4.1.11 | 4.1.11 | peer 支持 Vite 6—8 |
| `@vue/test-utils` | 2.4.11 | 2.4.11 | Vue 组件单元测试 |
| `eslint` | 10.9.0 | 10.9.0 | 使用 flat config |
| `eslint-plugin-vue` | 10.10.0 | 10.10.0 | peer 支持 ESLint 8.57—10 |
| `typescript-eslint` | 8.67.0 | 8.67.0 | 决定 TypeScript 暂留 6.0.x |
| `prettier` | 3.9.6 | 3.9.6 | 仅负责格式化，不与 Lint 规则混用 |
| `@vue/tsconfig` | 0.9.1 | 优先采用脚手架实际解析版本 | Vue 官方维护的 TSConfig 基线；项目再增量收紧 |

### 2.1 Vite 的 Node engines 仍需关注

即使日常用 Bun 执行脚本，Vite 8 的包元数据仍声明 Node：

```text
^20.19.0 || >=22.12.0
```

原因是部分工具、编辑器插件、CI 或第三方脚本仍可能通过 Node 运行。建议：

- CI 同时固定 Bun 版本和一个满足 Vite engines 的 Node 版本。
- 浏览器源码不要直接使用 Bun 专属 API。
- 若 `vite.config.ts` 使用 Node API，安装匹配 CI Node 主版本的 `@types/node`。
- 只有实际使用 `Bun.*` API 时才添加 `@types/bun`。
- `vue` 与其解析到的 `@vue/compiler-sfc` 应保持相同 patch；可用 `bun pm why @vue/compiler-sfc` 检查。

## 3. 旧业务依赖的处理矩阵

| 包 | 旧版本 | 基线日标签/版本 | 迁移处理 |
| --- | ---: | ---: | --- |
| `@vueup/vue-quill` | 1.2.0 | latest 1.5.5 | 单独迁移 Editor；验证内容、工具栏、只读与图片行为 |
| `echarts` | 5.6.0 | latest 6.1.0 | 主版本升级；先迁移一个图表样例，再迁移监控页 |
| `fuse.js` | 7.1.0 | latest 7.5.0 | 通常可升级，仍要验证搜索排序 |
| `js-beautify` | 1.15.4 | latest 2.0.3 | 只影响代码生成器，放到页面迁移后段 |
| `js-cookie` | 3.0.5 | latest 3.0.8 | 建立 cookie key 类型和序列化边界 |
| `jsencrypt` | 3.3.2 | latest 3.5.4 | 登录加密需和后端公钥格式做集成验证 |
| `clipboard` | 2.0.11 | latest 2.0.11 | 版本长期未变；评估原生 Clipboard API，但不要夹带替换 |
| `file-saver` | 2.0.5 | latest 2.0.5 | 先保留确保下载行为一致，再评估原生实现 |
| `nprogress` | 0.2.0 | latest 0.2.0 | 包版本长期未变；封装为 router UI 适配器 |
| `vuedraggable` | 4.1.0 | `latest=2.24.3`、`next=4.1.0` | **Vue 3 必须检查 `next` 分支，不能直接装 latest** |
| `vue-cropper` | 1.1.1 | `latest=0.6.5`、`next=1.1.4` | **Vue 3 使用线需检查 `next`** |
| `unplugin-auto-import` | 0.18.6 | latest 21.1.0 | 主版本跨度大；本手册默认先改显式导入 |
| `unplugin-vue-setup-extend-plus` | 1.0.1 | latest 1.0.1 | 优先用 Vue 原生 `defineOptions` 后删除插件 |
| `vite-plugin-svg-icons` | 2.0.1 | latest 2.0.1 | 在 Vite 8 上做 dev/build 双测试；不要仅凭宽 peer 范围认定兼容 |
| `vite-plugin-compression` | 0.5.1 | latest 0.5.1 | 确认是否仍需构建时压缩；部署层已有压缩时可删除 |

## 4. 推荐安装方式

### 4.1 不随时间变化的文档写法

探索时可用 `@latest` 表达意图：

```bash
bun add vue@latest
```

更推荐先运行 Vue 官方脚手架并保留 `@latest`，让它给出当时组合验证过的配置和版本：

```bash
bun create vue@latest ../RuoYi-Vue3-scaffold
```

选择 TypeScript、Vue Router、Pinia，并按学习轮次选择 ESLint/Vitest。根目录已有 `docs/`，因此只把相邻脚手架当作参考，不直接覆盖当前仓库。

真正执行迁移提交时，应先解析兼容性，再使用脚手架版本或显式安装已审阅版本。例如本快照中“追求最高兼容版本”的核心组：

```bash
bun add \
  vue@3.5.41 \
  vue-router@5.2.0 \
  pinia@4.0.3 \
  element-plus@2.14.5 \
  @element-plus/icons-vue@2.3.2 \
  @vueuse/core@14.4.0 \
  axios@1.19.0

bun add -d \
  vite@8.2.2 \
  @vitejs/plugin-vue@6.0.8 \
  typescript@6.0.3 \
  vue-tsc@3.3.11 \
  sass-embedded@1.103.1
```

如果 `create-vue@latest` 选择的是更保守的 TypeScript 5.x，应优先使用脚手架组合完成第 2 轮；等全部门禁通过后，再用独立提交试升到满足 lint peer 范围的最高 TypeScript 版本。

后续质量工具在第 19 轮统一收敛；前面各轮可以先使用 Bun test 或脚手架已有测试能力锁定行为，避免第 1—2 轮一次引入过多变量。

### 4.2 锁文件规则

- 提交 `bun.lock`。
- 不提交 `node_modules/`。
- 不同时保留 npm、Yarn 或 pnpm 锁文件。
- CI 使用冻结锁文件安装：

```bash
bun install --frozen-lockfile
```

- 更新依赖后必须查看：

```bash
bun outdated
bun pm ls
bun pm scan
```

安全扫描结果需要人工判断；“扫描通过”不等于浏览器端依赖与项目行为兼容。

## 5. TypeScript 7 的升级门槛

满足以下条件后，才将 TypeScript 6.0.x 升到 7.x：

1. `typescript-eslint` 官方 peer 范围覆盖 TypeScript 7。
2. `vue-tsc`、编辑器 Vue 插件与 CI 均通过。
3. 全量 `typecheck` 与测试通过。
4. 迁移说明中列出的配置/语义变化已处理。

这不是“拒绝最新”，而是把**生态一致性**作为最新版本的一部分。

## 6. 官方参考

- Bun 包管理器命令：<https://bun.com/docs/cli/pm>
- Bun + Vite：<https://bun.com/guides/ecosystem/vite>
- Bun 安装依赖：<https://bun.com/docs/pm/cli/install>
- Bun lockfile：<https://bun.com/docs/pm/lockfile>
- Bun 的 Node.js API 兼容范围：<https://bun.com/docs/runtime/nodejs-apis>
- Vue 快速开始：<https://vuejs.org/guide/quick-start.html>
- Vue 工具链：<https://vuejs.org/guide/scaling-up/tooling.html>
- create-vue：<https://github.com/vuejs/create-vue>
- Vue TypeScript：<https://vuejs.org/guide/typescript/overview.html>
- Vite Getting Started：<https://vite.dev/guide/>
- Vite 配置：<https://vite.dev/config/>
- TypeScript TSConfig：<https://www.typescriptlang.org/tsconfig/>
- typescript-eslint 依赖版本：<https://typescript-eslint.io/users/dependency-versions/>
- Vue Router：<https://router.vuejs.org/>
- Pinia：<https://pinia.vuejs.org/>
- Element Plus：<https://element-plus.org/en-US/guide/installation.html>
- Vitest：<https://vitest.dev/guide/>
- ESLint 配置：<https://eslint.org/docs/latest/use/configure/configuration-files>
