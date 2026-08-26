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

## 实操顺序

拆成子批次，一轮只做一块，不要一次做完 19.a—19.e。

### 19.a 质量工具：ESLint + Prettier + 统一脚本

- ESLint flat config、`eslint-plugin-vue`、`typescript-eslint`、Prettier。
- 脚本：`lint`、`format:check`、`check`。
- 测试仍用现有 `bun test`（已有 210 条）。Vitest / Vue Test Utils 属 19.b，避免本批改写全部测试导入。

### 19.b Vitest 与组件测试适配

- 按兼容矩阵安装 Vitest、@vue/test-utils。
- 把测试运行器接到统一 `test` 脚本，并补组件测试入口，而不是重写业务断言。

### 19.c 依赖扫描、许可证与收敛

- `bun pm licenses`、`bun pm scan`、`bun outdated`、`bun pm why`。
- 逐包保留 / 替换 / 删除 / 暂缓；隔离 clipboard、file-saver、nprogress 等弱类型。

### 19.d 迁移债与 `legacy/` 引用

- 关闭 `docs/migration-debt.md` 能关的项；源码/测试/脚本/CI 不引用 `legacy/`。

### 19.e 干净环境、行为对照、README 与回退

- 无 `node_modules` / 无 `legacy/` 冻结安装；三环境构建；行为对照表；README 与回退步骤。

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

## 本轮记录

### 19.a 质量工具：ESLint + Prettier + 统一脚本（工作区，未单独提交）

- 执行时版本：`eslint@10.9.1`、`@eslint/js@10.0.1`、`eslint-plugin-vue@10.10.0`、`vue-eslint-parser@10.4.1`、`typescript-eslint@8.68.0`（peer 仍是 `typescript >=4.8.4 <6.1.0`，继续钉 `typescript@6.0.3`）、`prettier@3.9.6`、`globals@17.11.0`、`eslint-config-prettier@10.1.8`。未装 Vitest（属 19.b）。
- 配置：`eslint.config.js`（flat；`essential` + TS recommended；格式交给 Prettier）。Crontab 字段计算属性仍会夹住 sibling refs，工具域表单仍就地改父级对象，这两条规则在对应 glob 关闭。`tests/codegen/fixtures` 不跑 Prettier/ESLint，避免改 beautify 快照。
- 脚本：`lint`、`format`、`format:check`、`check`（typecheck → test → lint → format:check → build:prod）。`test` 仍是 `bun test`。CI 增加 lint / format:check。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor tests/tools tests/codegen`（195）；`bun run lint`（0 error）；`bun run format:check`；`bun run build:stage`（`build-*.js` 310.02 kB）。浏览器：`/tool/build` 默认手机号；`/tool/gen` `sys_user`/`sys_role`；`/system/user` 部门树与 admin 列表；390px 用户列表仍可读。

### 19.b Vitest 与组件测试适配（工作区，未单独提交）

- 执行时版本：`vitest@4.1.11`、`@vue/test-utils@2.4.11`、`happy-dom@20.11.6`。独立 `vitest.config.ts`（不 merge `vite.config.ts`，避免 `requireBuildEnv` 在 mode=test 下炸掉）。`vitest.config.ts` 不进 `tsconfig.node.json`：`skipLibCheck: false` 会撞上 happy-dom 的 `UnderlyingDefaultSource` 声明。
- 现有 `bun:test` 断言未改写。`test` = `vitest run && bun test tests/unit tests/system tests/monitor tests/tools tests/codegen`；`test:watch` = `vitest`。CI 改为 `bun run test`。
- 组件入口 `tests/vue/`：Pagination 翻页/改页大小/隐藏；DictTag 匹配标签与无类型 span；`v-hasPermi` 保留/删除按钮与 `*:*:*` 通配。登录必填文案抽到 `LOGIN_REQUIRED_MESSAGES`，Login.vue 引用；bun 测锁定文案。未把整页 Login 挂进 VTU（Element Plus `el-form` validate 在本仓库的 Vitest 套件里不稳定）。
- 验证：`bun run test`（Vitest **7** + bun **196**）；`bun run typecheck` / `lint` / `format:check`；`bun run build:stage`。

### 19.c 依赖扫描、许可证与收敛（工作区，未单独提交）

- 命令：`bun pm licenses`（人工审阅）；`bun outdated`；`bun pm why vue|echarts|@vueuse/core|@vue/compiler-sfc`。`bun pm scan` **未跑通**：Bun 1.4.0 需要 `bunfig.toml` 的 `[install.security] scanner`，本批不引入未审的第三方扫描器。
- 许可证：直依与传递以 MIT / Apache-2.0 / BSD / ISC 为主。无 GPL/AGPL/SSPL。唯一需记下的是 **MPL-2.0** `lightningcss@1.33.0`（及 linux gnu/musl binding），属构建工具传递依赖，文件级 copyleft，可保留。
- 重复版本：`vue@3.5.41` 与 `@vue/compiler-sfc@3.5.41` 同 patch；`echarts@6.1.0` 仅直接依赖；`@vueuse/core@14.4.0` 仅 `element-plus` 带入，未直接安装。传递重复（`tslib` 2.3.0/2.8.1、`glob` 10/13）不收敛。
- 分类：
  - **保留**：Vue/Vite/TS 6.0.3/EP/Pinia/Router 及业务包；`file-saver`、`nprogress`（见适配器）。
  - **删除（未装）**：`clipboard`（已用 `navigator.clipboard`）、`unplugin-auto-import`、`unplugin-vue-setup-extend-plus`（`defineOptions`）、`vite-plugin-compression`（压缩交给部署）。
  - **暂缓升级**：`axios` 1.19.0→1.20.0（拦截器/类型）；`typescript` 6.0.3→7.0.2（eslint peer `<6.1.0`）；`@types/node` 22→26（CI Node 22）。
- 适配器：`src/utils/save-file.ts` 收口 `file-saver`；`src/router/progress.ts` 已收口 `nprogress`。`@types/js-cookie` 钉死 `3.0.6`（去掉 caret）。
- 验证：`bun run test`（Vitest **7** + bun **197**）；`typecheck` / `lint` / `format:check`；`build:stage`（`save-file-*.js` 152.91 kB 共享 chunk）。

### 19.d 迁移债与 `legacy/` 引用（工作区，未单独提交）

- `src/` 无 `any` / `@ts-ignore` / `TODO.*migration`。`src/strict/` 与 `learning/ts-lab/` 的 `@ts-expect-error` 是严格模式演示，不是逃生口。
- 复测三笔债，都不能在本批关掉：`skipLibCheck: false` 仍被 `element-plus@2.14.5` / `vue-router` 声明挡住；`vue-cropper@1.1.4` typings 仍 import `.vue`；remember-me RSA 私钥仍要对齐旧 cookie 协议。表状态改为「外部解除条件」。
- 清单不再指向本机 `legacy/` 路径：`legacyId` → `id`，测试只断言 `target` 存在。新增 `tests/unit/utils/legacy-boundary.test.ts`：`src` / `vite` / `scripts` / `.github` 不含 `legacy/`。`eslint.config.js` 仍 ignore `legacy/**`，避免本机被 gitignore 的快照被 lint。
- 验证：`bun run test`（Vitest **7** + bun **198**）；`typecheck` / `lint` / `format:check`；`build:stage`。

### 19.e 干净环境、行为对照、README 与回退（工作区，未单独提交）

- 干净树：`/tmp/ruoyi-clean-19e`（无 `node_modules` / 无 `legacy/`）。`bun install --frozen-lockfile --no-cache` 354 packages / 13.29s。安装后仍无 `legacy/`。typecheck、Vitest 7 + bun 198、三环境 `vite build`（development / staging / production）均通过。
- 门禁修正：`scripts/env-check.ts` 去掉第 6 轮对 `vue-router` / `pinia` / icons 的禁止，改为要求它们存在。`.bun-cache` 加入 gitignore / ESLint ignore / Prettier ignore（缓存若放在仓库内会污染 lint）。二次干净安装把 cache 放到 `/tmp/ruoyi-bun-cache-19e2`：`env:check` 0、`lint` 0。
- 三环境产物：`index` ~980 kB / gzip 313 kB；`use-chart` 436 kB；`build` 310 kB；`save-file` 153 kB。前缀来自 `.env.*`：`/dev-api`、`/stage-api`、`/prod-api`。`VITE_BUILD_COMPRESS=gzip` 仍不写 `.gz`。
- 回退演练（未切换工作区）：`cb50b8e` 是 `HEAD` 祖先（第 11 轮）；当前已入库 `8008e67` 与 `origin/master` 相同。无 Git tag。回退用 Git ref，不用 `legacy/`。
- README 重写：安装、Mock/后端、测试、三环境构建、部署、排错、回退。

行为对照（自动化 + 先前浏览器记录；对照的是行为，不是 DOM 逐字相同）：

| 场景                                    | 新系统证据                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 登录成功/失败、验证码、退出、token 过期 | `tests/unit/auth`、`tests/integration/auth-profile`、`tests/integration/auth-routing`；Mock `admin`/`admin123` |
| 动态菜单、角色和权限                    | `auth-routing`、`dynamic-transform`、`v-hasPermi` Vitest                                                       |
| 用户/角色/部门/菜单 CRUD                | `tests/system/user` `role` `dept` `menu`；浏览器用户列表/角色树                                                |
| 字典、配置、通知、岗位                  | `tests/system/dict` `config` `notice` `post`                                                                   |
| 任务、日志、缓存、服务器                | `tests/monitor/*`；浏览器 cache/server/druid                                                                   |
| 上传、下载、编辑器、裁剪、图表、拖拽    | upload 单测；`save-file` 适配器；ECharts chunk；vuedraggable 表单构建                                          |
| 主题、TagsView、keep-alive、移动端      | `tests/unit/layout`、`navigation-shell`；390px 用户列表                                                        |
| 三环境构建                              | 干净树 development / staging / production 均成功                                                               |

## 停止条件

- [x] 干净环境冻结安装通过。
- [x] typecheck/test/lint/format/三环境 build 全部通过。
- [x] 依赖扫描和许可证结果已人工审阅。（许可证 19.c；`bun pm scan` 无官方 scanner，已记录）
- [x] `migration-debt.md` 已清空或只剩有外部解除条件的窄问题。
- [x] 源码、测试、脚本和 CI 不引用 `legacy/`。
- [x] 关键行为对照有自动化或人工证据。
- [x] 回退步骤已演练且不依赖本机目录。

## 推荐提交

```text
test: enforce migration quality gates
chore: remove migration compatibility layers
docs: document bun typescript delivery workflow
```

## 完成定义

只有本轮全部通过，才能宣布项目已完成 Bun + TypeScript + 最新兼容 Vue 生态迁移。
