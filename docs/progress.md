# 迁移轮次进度

> 快照日期：2026-08-26
> 当前 HEAD：`8008e67`（file-saver 适配器已入库）
> 下一轮：无。第 0—19 轮已完成，进入常规维护。
> 状态只能使用：`未开始`、`进行中`、`已完成`、`阻塞`。

## 1. 当前快照

第 **0—19** 轮已经做完。已入库到 `8008e67`。工作区还叠着 19.d（去掉 `legacy/` 路径依赖）和 19.e（干净安装、README、回退）。迁移债只剩三条外部解除条件。

仓库可 `dev` / `typecheck` / `lint` / `format:check` / 三环境 `build`，有 Element Plus、类型化 HTTP/API、7 个 Pinia store、Vue Router 5 权限闭环、系统管理 CRUD、监控域、工具域，以及 ESLint / Prettier / Vitest 门禁。

| 项               | 现状                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Git remote       | `origin` → `https://github.com/zeroornull/RuoYi-Vue3-Demo.git`                                                                                     |
| 旧代码对照       | 本机 `legacy/`（Git 忽略，不是备份）                                                                                                               |
| 可运行？         | 是。最小页 + Element Plus 中文 locale + 暗色变量                                                                                                   |
| 业务 API         | 是。认证 API 已接 user store；16.a—16.d 系统配置/组织/用户/角色已接；17.a—17.c 监控域已接；18.a—18.e 工具域（Swagger / 代码生成 / 表单构建）已接   |
| Pinia            | 是。7/7 store 已迁；permission 可解析后端路由并维护菜单集合                                                                                        |
| Router           | 是。静态路由 + DTO 白名单转换 + 访问筛选 + 幂等注册/刷新恢复/退出清理                                                                              |
| Layout           | 是。桌面/移动端、侧栏、顶栏、TagsView、设置、keep-alive、iframe、图标、菜单搜索、全屏                                                              |
| 共享组件         | 是。DictTag/Pagination/上传/编辑器/Crontab/TreePanel 等已迁；仅少量全局注册                                                                        |
| 登录/CRUD 界面？ | 登录/注册/锁屏/个人中心已迁；16.a—16.d 系统管理已迁；17.a—17.c 监控域已迁；18.a—18.e 工具域已迁                                                    |
| 测试             | bun `tests/unit`+system+monitor+tools+codegen **198** 条 + Vitest `tests/vue` **7** 条 + integration **11** 条 + contracts **4** 条，共 **220** 条 |
| CI               | `.github/workflows/bun-baseline.yml`，`workflow_dispatch`；含 typecheck / lint / format:check / unit tests / 三环境 build                          |

### 本地复核

```bash
bun --version                 # 1.4.0
node --version                # v22.23.2（或满足 ^20.19.0 \|\| >=22.12.0）
bun install --frozen-lockfile
bun run env:check
bun run lab:ts
bun run test                  # vitest tests/vue 然后 bun test unit/system/monitor/tools/codegen
bun run test -- tests/unit/layout tests/integration/navigation-shell tests/unit/router tests/integration/auth-routing tests/unit/components/shared tests/unit/auth tests/integration/auth-profile tests/contracts tests/system
bun run typecheck
bun run lint
bun run format:check
bun run check
bun run build:stage
bun run build:prod
bun run dev                   # http://127.0.0.1:5173/ （开发默认本地 Mock，无 8080 后端）
bun run dev:backend           # 关闭 Mock，代理到 localhost:8080
```

### 下一轮先做什么

第 0—19 轮已完成。之后按常规小步升级依赖，不要再做大爆炸迁移。日常入口见根 [README.md](../README.md)。

## 2. 轮次总表

| 轮次 | 主题                         | 状态   | Git                          | 验证摘要                                                                                                     |
| ---: | ---------------------------- | ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
|    0 | 旧项目归档与基线             | 已完成 | `f0ce9ad`                    | `legacy/` 本机快照；手册入库                                                                                 |
|    1 | Bun 基础                     | 已完成 | `f0ce9ad`                    | `packageManager: bun@1.4.0`；零依赖时无 lockfile                                                             |
|    2 | Vue + Vite 最小骨架          | 已完成 | `e539f97`                    | `vue@3.5.41` 与 compiler-sfc 同 patch；HMR 已验                                                              |
|    3 | TypeScript 语言实验          | 已完成 | `e539f97`                    | `learning/ts-lab/`；`bun run lab:ts`                                                                         |
|    4 | 严格 TS 工程配置             | 已完成 | `a315108`                    | app/node 分界；`strictImportMetaEnv`                                                                         |
|    5 | Vite、环境与插件             | 已完成 | `a9d270a`                    | 三 mode 前缀正确；proxy 502；未复制旧插件                                                                    |
|    6 | 应用装配                     | 已完成 | `a9d270a`                    | `element-plus@2.14.5`；中文分页「共 100 条」                                                                 |
|    7 | 共享类型与工具               | 已完成 | `e15ba29`                    | 纯工具 + Bun test                                                                                            |
|    8 | HTTP 边界                    | 已完成 | `69d32be`                    | axios 拦截器、`config.ruoyi`、401/重复提交/blob/下载                                                         |
|    9 | API 合约                     | 已完成 | `fb339c6`                    | 19/19 旧 API；4 类响应；4 个脱敏样本；47 tests；三环境 build                                                 |
|   10 | Pinia                        | 已完成 | `c90359a`                    | 7/7 store；16 store tests；59 unit / 63 all；三环境 build                                                    |
|   11 | 静态 Router                  | 已完成 | `cb50b8e`                    | Router 5.2.0；10 router tests；69 unit / 73 all；三环境 build                                                |
|   12 | 动态路由与权限               | 已完成 | `3b370ea`                    | 15 new router/integration tests；80 unit / 89 all；三环境 build                                              |
|   13 | Layout、主题、TagsView、图标 | 已完成 | **与第 12 轮同在工作区**     | 8 layout unit + 3 shell integration；88 unit / 100 all；视觉基线                                             |
|   14 | 通用组件与表单               | 已完成 | **与第 12—13 轮同在工作区**  | 22 shared-component tests；110 unit / 122 all；typecheck + stage build                                       |
|   15 | 认证、个人中心与锁屏         | 已完成 | **与第 12—14 轮同在工作区**  | 13 new auth tests；120 unit / 135 all；登录页浏览器验证                                                      |
|   16 | 系统管理域                   | 已完成 | **与第 12—15 轮同在工作区**  | 16.a—16.d 完成（161 unit+system / typecheck / stage）；浏览器验角色树与分配用户                              |
|   17 | 监控域                       | 已完成 | **与第 12—16 轮同在工作区**  | 17.a—17.c 完成（173 unit+system+monitor / typecheck / stage）；ECharts 单 chunk；浏览器验 cache/server/druid |
|   18 | 工具域与第三方               | 已完成 | **与第 12—17 轮同在工作区**  | 18.a—18.e 完成（195 unit+system+monitor+tools+codegen / typecheck / stage）；beautify 1.15.4≡2.0.3           |
|   19 | 质量、依赖收敛与切换         | 已完成 | `8008e67` + 工作区 19.d/19.e | 干净冻结安装；三环境 build；Vitest 7 + bun 198；README/回退不依赖 legacy/                                    |

Git 没有严格「一轮一提交」：2 与 3 同在 `e539f97`，5 与 6 同在 `a9d270a`。

## 3. 相对 `8008e67` 未入库内容

工作区还包含第 19.d—19.e（清单去掉 `legacy/` 路径、干净安装记录、README）：

```text
src/router/                     # 后端 DTO、纯转换、组件白名单、访问筛选、注册表、单飞 guard、NProgress
src/stores/modules/permission*  # 异步生成路由、issue 与失败状态
src/stores/access-cleanup.ts    # logout/401 统一清理动态访问状态
src/layout/                     # 响应式壳层、菜单、TagsView、设置、主题、iframe、菜单搜索、全屏
src/components/                 # 共享组件、上传、编辑器、Crontab、TreePanel、表单提交
src/views/                      # 第 15 轮认证页 + 16.a—16.d 系统管理 + 17.a—17.c 监控全套 + 18.a—18.e 工具域
src/charts/                     # ECharts 6 按需注册 + createBoundChart
src/icons/registry.ts           # 显式语义图标映射
src/composables/                # CRUD 选择/分页 + useDict
src/utils/visibility-poll.ts    # 可见性轮询（暂停 / inflight skip / 卸载清理）
vite/mock/                      # 开发 Mock：认证 + 系统管理 + 17.a—17.c 监控 + 18.a—18.e 工具
tests/unit/auth/                # 登录、记住密码、RSA、profile/lock 边界
tests/system/                   # 16.a—16.d 系统管理模型与 Mock
tests/monitor/                  # 17.a—17.c 在线用户/日志/任务/缓存/服务器/Druid
tests/tools/                    # 18.a Swagger + 18.b/18.c 代码生成 + 18.d 表单构建
tests/codegen/                  # 18.e js-beautify 2.x 快照
tests/vue/                      # 19.b Vitest + Vue Test Utils 组件入口
src/utils/save-file.ts          # 19.c file-saver 适配器
src/api/migration-manifest.ts   # 19.d 不再指向本机 legacy/ 路径
src/stores/migration-manifest.ts
tests/integration/auth-profile/ # 登录失败、锁屏、profile patch
tests/integration/              # auth-routing + navigation-shell
docs/visual-baselines/          # 第 13 轮桌面/移动端 PNG
package.json / bun.lock         # nprogress、icons、vue-quill@1.5.5、fuse.js@7.5.0、sortablejs@1.15.7、echarts@6.1.0、vuedraggable@4.1.0、js-beautify@2.0.3、eslint@10.9.1、prettier@3.9.6
eslint.config.js / .prettierrc.json  # 19.a 质量门禁
```

推荐提交说明：

```text
refactor: migrate typed authentication and profile flows
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
  router/                 Router 5 静态/动态 routes、DTO 转换、访问 guard、注册表、占位组件
  layout/                 桌面/移动端壳层、菜单、Navbar、TagsView、Settings、AppMain、iframe
  components/             共享展示/上传/编辑器/Crontab/TreePanel；仅少量全局注册
  views/                  登录、注册、锁屏、个人中心、401/404、系统管理、monitor 全套、tool/swagger、tool/gen、tool/build
  charts/                 ECharts 6 按需 pie/gauge + CanvasRenderer
  icons/                  显式 Element/custom SVG 图标注册表
  utils/                  parseTime、handleTree、tansParams、字典/密码/权限纯函数、visibility-poll
  types/                  env、http、api、dict、tree、id、query
  composables/useAppTitle.ts
  App.vue                 根 RouterView
vite/                     构建期 env 校验、charset 插件
learning/ts-lab/          第 3 轮语言实验，不是生产合约
tests/unit/               utils + http + api + stores + router + layout + shared components
tests/integration/        auth-routing 权限闭环 + navigation-shell
```

16.a—16.d 系统管理、17.a—17.c 监控域与 18.a—18.e 工具域已接到真实页面。首页仍是占位。

## 5. 依赖（执行时钉死）

| 包                 |    版本 | 备注                                                                                |
| ------------------ | ------: | ----------------------------------------------------------------------------------- |
| Bun                |   1.4.0 | `packageManager`                                                                    |
| Vue                |  3.5.41 | 与 `@vue/compiler-sfc` 同 patch                                                     |
| Vite               |   8.2.2 | `bunx --bun vite`                                                                   |
| TypeScript         |   6.0.3 | `typescript-eslint` 仍不支持 7.x                                                    |
| Element Plus       |  2.14.5 | 全量 `app.use`，产物约 1 MB JS                                                      |
| Axios              |  1.19.0 | 拦截器返回 `ApiResponse<T>`                                                         |
| Pinia              |   4.0.3 | app 使用 option store；其余核心状态使用 setup store                                 |
| Vue Router         |   5.2.0 | classic 静态配置；未启用 file-based routing 插件                                    |
| NProgress          |   0.2.0 | Router 导航开始/完成；关闭 spinner；类型 `@types/nprogress@0.2.3`                   |
| Element Plus Icons |   2.3.2 | 仅显式 import/语义映射；不全量注册                                                  |
| VueQuill           |   1.5.5 | Editor；未改上传协议                                                                |
| fuse.js            |   7.5.0 | HeaderSearch                                                                        |
| sortablejs         |  1.15.7 | 上传列表拖拽排序                                                                    |
| jsencrypt          |   3.5.4 | 记住密码 cookie 混淆；不替代 HTTPS                                                  |
| vue-cropper        |   1.1.4 | Vue 3 `next` 线；头像裁剪                                                           |
| js-cookie          |   3.0.8 | `Admin-Token` + remember-me                                                         |
| file-saver         |   2.0.5 | 下载                                                                                |
| sass-embedded      | 1.103.1 | 未把 `@parcel/watcher` 加入 trusted                                                 |
| ECharts            |   6.1.0 | 按需 `echarts/core` + pie/gauge + CanvasRenderer；staging 单 `use-chart` chunk      |
| vuedraggable       |   4.1.0 | Vue 3 `next` 线；不要装 latest（Vue 2）                                             |
| js-beautify        |   2.0.3 | 表单构建导出；typed 适配器隔离 1.x 字符串 options；类型 `@types/js-beautify@1.14.3` |
| ESLint             |  10.9.1 | flat config + `eslint-plugin-vue@10.10.0` + `typescript-eslint@8.68.0`              |
| Prettier           |   3.9.6 | 只负责格式；`eslint-config-prettier@10.1.8` 关掉冲突规则                            |
| Vitest             |  4.1.11 | 组件测试；`happy-dom@20.11.6`；`@vue/test-utils@2.4.11`                             |

未装：auto-import、svg-icons 插件、compression。

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
5. **开发默认 `VITE_MOCK_API=true`**
   没有 Java 后端时登录走本地 Mock（admin/admin123）。接真实 `localhost:8080` 时用 `bun run dev:backend` 或设 `VITE_MOCK_API=false`。Mock 不进 production 构建。

## 7. 阶段位置

```text
阶段 A  Bun + 骨架           第 1—2 轮   完成
阶段 B  TS + Vite            第 3—5 轮   完成
阶段 C  基础设施 + API       第 6—9 轮   完成
阶段 D  状态 / 路由 / 权限   第 10—12 轮  完成
阶段 E  组件与业务页         第 13—18 轮  完成
阶段 F  质量与切换           第 19 轮     完成
```

## 8. 更新规则

1. 开始一轮时填入 Git 基线并将状态改为「进行中」。
2. 验证失败但仍可继续修复时保持「进行中」，不要过早标记「阻塞」。
3. 出现外部权限、服务或协议问题时，记录具体阻塞证据。
4. 完成后填入结束 commit（或注明仍在工作区）、验证命令和结果摘要。
5. 若拆分子批次，在备注中记录每个子批次；父轮只有全部子批次完成后才能完成。
6. 本表是进度的唯一汇总。各轮文档里的「本轮记录」可以更细，但不要和本表打架。
