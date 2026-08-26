# 迁移轮次进度

> 快照日期：2026-08-26
> 当前 HEAD：`fb339c6`（第 9 轮已入库）
> 下一轮：第 11 轮 — 静态 Router
> 状态只能使用：`未开始`、`进行中`、`已完成`、`阻塞`。

## 1. 当前快照

第 **0—10** 轮的工作已经做完。第 **0—9** 轮已入库；第 **10** 轮在工作区，尚未单独提交。第 10 轮只迁移了 Pinia 状态、持久化解析和装配，没有迁 Router、动态路由或页面。

仓库已经不是空壳：根目录可 `dev` / `typecheck` / 三环境 `build`，有 Element Plus、类型化 HTTP/API 和 7 个 Pinia store。还没有 Router、管理端布局或业务页面。

| 项 | 现状 |
| --- | --- |
| Git remote | `origin` → `https://github.com/zeroornull/RuoYi-Vue3-Demo.git` |
| 旧代码对照 | 本机 `legacy/`（Git 忽略，不是备份） |
| 可运行？ | 是。最小页 + Element Plus 中文 locale + 暗色变量 |
| 业务 API | 是。认证 API 已接 user store；菜单、系统、监控、工具域尚未接页面 |
| Pinia | 是。app/settings/dict/lock/user/tagsView 已迁；permission 为纯状态接口 |
| 登录/菜单/CRUD 界面？ | 否 |
| 测试 | `bun test tests/unit` 当前 **59** 条；加 `tests/contracts` 共 **63** 条 |
| CI | `.github/workflows/bun-baseline.yml`，仅 `workflow_dispatch` |

### 本地复核

```bash
bun --version                 # 1.4.0
node --version                # v22.23.2（或满足 ^20.19.0 \|\| >=22.12.0）
bun install --frozen-lockfile
bun run env:check
bun run lab:ts
bun test tests/unit
bun run test -- tests/unit/stores tests/contracts
bun run typecheck
bun run build:stage
bun run build:prod
bun run dev                   # http://127.0.0.1:5173/
```

### 下一轮先做什么

打开 [第 11 轮：静态 Router](./rounds/11-static-router-and-meta.md)。先建立路由记录、meta 和 guard 的静态边界；动态路由与权限转换仍留到第 12 轮。

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
| 9 | API 合约 | 已完成 | `fb339c6` | 19/19 旧 API；4 类响应；4 个脱敏样本；47 tests；三环境 build |
| 10 | Pinia | 已完成 | **工作区未提交** | 7/7 store；16 store tests；59 unit / 63 all；三环境 build |
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

## 3. 第 10 轮未入库内容

工作区相对 `fb339c6` 主要是：

```text
src/stores/                     # Pinia 装配、7 个 store、持久化解析和迁移清单
tests/unit/stores/              # 16 条状态、生命周期、失败与损坏数据测试
src/main.ts                     # 安装 Pinia；401 时清理 store/cookie；不安装 Router
src/types/api/auth.ts           # 补齐旧 user store 依赖的 pwdChrtype 合约
src/api/contracts.ts            # 解析可选 pwdChrtype
package.json / bun.lock         # 精确锁定 pinia@4.0.3
```

推荐提交说明：

```text
refactor: migrate typed pinia stores
```

## 4. 现在仓库里有什么

```text
src/
  main.ts                 只装配，不写业务
  bootstrap/              Element Plus、全局能力清单、空的组件/指令槽
  config/env.ts           运行时校验 VITE_*
  http/                   类型化 Axios、token、cache、download
  api/                    认证、菜单、系统、监控、工具域类型化 API
  stores/                 Pinia 装配、7 个状态域、版本化持久化解析
  utils/                  parseTime、handleTree、tansParams、字典/密码/权限纯函数
  types/                  env、http、api、dict、tree、id、query
  composables/useAppTitle.ts
  App.vue                 第 6 轮 Element Plus 示例页
vite/                     构建期 env 校验、charset 插件
learning/ts-lab/          第 3 轮语言实验，不是生产合约
tests/unit/               utils + http + api + stores
```

**刻意没有：** `src/router/`、业务 `views/`、Vue Router。permission store 没有路由转换或 `router.addRoute` 副作用。

## 5. 依赖（执行时钉死）

| 包 | 版本 | 备注 |
| --- | ---: | --- |
| Bun | 1.4.0 | `packageManager` |
| Vue | 3.5.41 | 与 `@vue/compiler-sfc` 同 patch |
| Vite | 8.2.2 | `bunx --bun vite` |
| TypeScript | 6.0.3 | `typescript-eslint` 仍不支持 7.x |
| Element Plus | 2.14.5 | 全量 `app.use`，产物约 1 MB JS |
| Axios | 1.19.0 | 拦截器返回 `ApiResponse<T>` |
| Pinia | 4.0.3 | app 使用 option store；其余核心状态使用 setup store |
| js-cookie | 3.0.8 | `Admin-Token` |
| file-saver | 2.0.5 | 下载 |
| sass-embedded | 1.103.1 | 未把 `@parcel/watcher` 加入 trusted |

未装：`vue-router`、`@element-plus/icons-vue`、auto-import、svg-icons、compression。

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
阶段 D  状态 / 路由 / 权限   第 10—12 轮  做到第 10；第 11—12 未开始
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
