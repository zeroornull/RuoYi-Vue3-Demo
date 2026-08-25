# 迁移轮次进度

> 快照日期：2026-08-25  
> 当前 HEAD：`69d32be`（第 8 轮已入库）
> 下一轮：第 10 轮 — Pinia
> 状态只能使用：`未开始`、`进行中`、`已完成`、`阻塞`。

## 1. 当前快照

第 **0—9** 轮的工作已经做完。第 **0—8** 轮已入库；第 **9** 轮在工作区，尚未单独提交。第 9 轮只迁移了 API 函数、DTO、契约解析与样本，没有迁 store、router 或页面。

仓库已经不是空壳：根目录可 `dev` / `typecheck` / 三环境 `build`，有 Element Plus 装配、类型化 HTTP 客户端和按域业务 API。还没有 Pinia、Router、管理端布局或业务页面。

| 项 | 现状 |
| --- | --- |
| Git remote | `origin` → `https://github.com/zeroornull/RuoYi-Vue3-Demo.git` |
| 旧代码对照 | 本机 `legacy/`（Git 忽略，不是备份） |
| 可运行？ | 是。最小页 + Element Plus 中文 locale + 暗色变量 |
| 业务 API | 是。认证、菜单、系统、监控、工具域；尚未接 store / 页面 |
| 登录/菜单/CRUD 界面？ | 否 |
| 测试 | `bun test tests/unit` 当前 **43** 条；加 `tests/contracts` 共 **47** 条 |
| CI | `.github/workflows/bun-baseline.yml`，仅 `workflow_dispatch` |

### 本地复核

```bash
bun --version                 # 1.4.0
node --version                # v22.23.2（或满足 ^20.19.0 \|\| >=22.12.0）
bun install --frozen-lockfile
bun run env:check
bun run lab:ts
bun test tests/unit
bun run typecheck
bun run build:stage
bun run build:prod
bun run dev                   # http://127.0.0.1:5173/
```

### 下一轮先做什么

打开 [第 10 轮：Pinia](./rounds/10-pinia-store-migration.md)。使用第 9 轮的 login/getInfo/logout API 建立状态边界；不要同时迁 Router 或页面。

## 2. 轮次总表

| 轮次 | 主题 | 状态 | Git | 验证摘要 |
| ---: | --- | --- | --- | --- |
| 0 | 旧项目归档与基线 | 已完成 | `f0ce9ad` | `legacy/` 本机快照；手册入库 |
| 1 | Bun 基础 | 已完成 | `f0ce9ad` | `packageManager: bun@1.4.0`；零依赖时无 lockfile |
| 2 | Vue + Vite 最小骨架 | 已完成 | `e539f97` | `vue@3.5.41` 与 compiler-sfc 同 patch；HMR 已验 |
| 3 | TypeScript 语言实验 | 已完成 | `e539f97` | `learning/ts-lab/`；`bun run lab:ts` |
| 4 | 严格 TS 工程配置 | 已完成 | `a315108` | app/node 分界；`strictImportMetaEnv` |
| 5 | Vite、环境与插件 | 已完成 | `a9d270a` | 三 mode 前缀正确；proxy 502；未复制旧插件 |
| 6 | 应用装配 | 已完成 | `a9d270a` | `element-plus@2.14.5`；中文分页「共 100 条」 |
| 7 | 共享类型与工具 | 已完成 | `e15ba29` | 纯工具 + Bun test |
| 8 | HTTP 边界 | 已完成 | `69d32be` | axios 拦截器、`config.ruoyi`、401/重复提交/blob/下载 |
| 9 | API 合约 | 已完成 | **工作区未提交** | 19/19 旧 API；4 类响应；4 个脱敏样本；47 tests；三环境 build |
| 10 | Pinia | 未开始 |  |  |
| 11 | 静态 Router | 未开始 |  |  |
| 12 | 动态路由与权限 | 未开始 |  |  |
| 13 | Layout、主题、TagsView、图标 | 未开始 |  |  |
| 14 | 通用组件与表单 | 未开始 |  |  |
| 15 | 认证、个人中心与锁屏 | 未开始 |  |  |
| 16 | 系统管理域 | 未开始 |  | 可拆 16.a—16.d |
| 17 | 监控域 | 未开始 |  | 可拆 17.a—17.c |
| 18 | 工具域与第三方 | 未开始 |  |  |
| 19 | 质量、依赖收敛与切换 | 未开始 |  |  |

Git 没有严格「一轮一提交」：2 与 3 同在 `e539f97`，5 与 6 同在 `a9d270a`。

## 3. 第 9 轮未入库内容

工作区相对 `69d32be` 主要是：

```text
src/api/                        # 19 个旧 API 文件 + Swagger/Blob 边界 + 迁移清单
src/types/api/                  # 请求 DTO、领域模型和响应合约
tests/contracts/                # 4 个脱敏响应样本与解析测试
tests/unit/api/                 # 19/19 文件覆盖、响应分型、路径与 Swagger 测试
src/http/client.ts              # 支持普通/分页/空等任意业务响应泛型
src/http/flags.ts               # 删除旧 headers flags 兼容，只读 config.ruoyi
docs/migration-debt.md          # 删除已解除的 headers 兼容债务
```

推荐提交说明：

```text
refactor: migrate typed api contracts by domain
```

## 4. 现在仓库里有什么

```text
src/
  main.ts                 只装配，不写业务
  bootstrap/              Element Plus、全局能力清单、空的组件/指令槽
  config/env.ts           运行时校验 VITE_*
  http/                   类型化 Axios、token、cache、download
  api/                    认证、菜单、系统、监控、工具域类型化 API
  utils/                  parseTime、handleTree、tansParams、字典/密码/权限纯函数
  types/                  env、http、api、dict、tree、id、query
  composables/useAppTitle.ts
  App.vue                 第 6 轮 Element Plus 示例页
vite/                     构建期 env 校验、charset 插件
learning/ts-lab/          第 3 轮语言实验，不是生产合约
tests/unit/               utils + http
```

**刻意没有：** `src/stores/`、`src/router/`、业务 `views/`、Pinia、Vue Router。

## 5. 依赖（执行时钉死）

| 包 | 版本 | 备注 |
| --- | ---: | --- |
| Bun | 1.4.0 | `packageManager` |
| Vue | 3.5.41 | 与 `@vue/compiler-sfc` 同 patch |
| Vite | 8.2.2 | `bunx --bun vite` |
| TypeScript | 6.0.3 | `typescript-eslint` 仍不支持 7.x |
| Element Plus | 2.14.5 | 全量 `app.use`，产物约 1 MB JS |
| Axios | 1.19.0 | 拦截器返回 `ApiResponse<T>` |
| js-cookie | 3.0.8 | `Admin-Token` |
| file-saver | 2.0.5 | 下载 |
| sass-embedded | 1.103.1 | 未把 `@parcel/watcher` 加入 trusted |

未装：`vue-router`、`pinia`、`@element-plus/icons-vue`、auto-import、svg-icons、compression。

## 6. 未结债务

完整表见 [migration-debt.md](./migration-debt.md)。

1. **`tsconfig.app.json` `skipLibCheck: true`**  
   Element Plus / VueUse 声明过不了 `exactOptionalPropertyTypes`。`tsconfig.node.json` 仍是 `false`。
2. **开发端口 5173，不是旧项目的 80**
   本机绑 80 会 `EACCES`。
3. **`VITE_BUILD_COMPRESS=gzip` 只校验，不产出 `.gz`**
   压缩交给部署层。
4. **全局 `$appTitle` 仍挂着**
   页面已改用 `useAppTitle()`。

## 7. 阶段位置

```text
阶段 A  Bun + 骨架           第 1—2 轮   完成
阶段 B  TS + Vite            第 3—5 轮   完成
阶段 C  基础设施 + API       第 6—9 轮   完成
阶段 D  状态 / 路由 / 权限   第 10—12 轮  未开始
阶段 E  组件与业务页         第 13—18 轮  未开始
阶段 F  质量与切换           第 19 轮     未开始
```

## 8. 更新规则

1. 开始一轮时填入 Git 基线并将状态改为「进行中」。
2. 验证失败但仍可继续修复时保持「进行中」，不要过早标记「阻塞」。
3. 出现外部权限、服务或协议问题时，记录具体阻塞证据。
4. 完成后填入结束 commit（或注明仍在工作区）、验证命令和结果摘要。
5. 若拆分子批次，在备注中记录每个子批次；父轮只有全部子批次完成后才能完成。
6. 本表是进度的唯一汇总。各轮文档里的「本轮记录」可以更细，但不要和本表打架。
