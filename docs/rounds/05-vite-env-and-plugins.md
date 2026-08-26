# 第 5 轮：Vite 8、环境变量与插件最小集

> 状态：已完成。按要求未提交。未安装 auto-import、setup-extend、svg-icons、compression。

## 主要变量

本轮只迁移构建系统，不迁移应用业务。

## 学习目标

- 理解 Vite mode、环境变量加载、dev proxy 和生产构建的边界。
- 按 Vite 6 → 7 → 8 的顺序识别主版本变化。
- 通过逐插件验证避免旧插件导致无法定位的构建错误。

## 旧实现对照

- `legacy/vite.config.js`
- `legacy/vite/plugins/*.js`
- `legacy/.env.development`
- `legacy/.env.staging`
- `legacy/.env.production`

## 实操范围

按以下顺序迁移，每一步单独 build：

1. ESM alias：使用 `import.meta.url`，不复用 CommonJS `__dirname`。
2. `base`、`build.outDir`、资源命名和 chunk warning。
3. dev server host、port 和 open 行为。
4. `/dev-api` 与 springdoc proxy。
5. SCSS 和 charset-removal PostCSS 行为。
6. 三种 mode 的环境文件与 `ImportMetaEnv`。
7. SVG 插件：先一个图标，再全部图标。
8. 压缩插件：确认部署层是否已负责压缩后再决定保留。

插件决策：

- setup-extend：优先使用 Vue 原生 `defineOptions`，暂不迁移旧插件。
- auto-import：默认显式导入；如保留，必须生成稳定 `.d.ts`。
- SVG：需要 dev/build 双验证。
- compression：只有部署要求明确时才启用。

## 环境变量验收

必须覆盖：

- `VITE_APP_TITLE`
- `VITE_APP_ENV`
- `VITE_APP_BASE_API`
- `VITE_BUILD_COMPRESS`

声明类型不能替代运行时校验。对缺失 `VITE_APP_BASE_API` 应快速失败，而不是发请求到 `undefined`。

## 练习

1. 解释 Vite 的 mode 与 `NODE_ENV` 为什么不是同一个概念。
2. 故意删除 staging API 前缀，确认启动/构建检查能发现。
3. 分别在 dev 和 build 中导入一个 SVG，比较插件行为。
4. 检查部署层已有 gzip 时，构建压缩插件会造成什么重复成本。

## 验证

```bash
bun run typecheck
bunx --bun vite build --mode development
bunx --bun vite build --mode staging
bunx --bun vite build --mode production
```

同时检查产物中不包含私密变量、错误后端地址或 `legacy/` 内容。

2026-08-25 实测：

| 检查                                         | 结果                                                                |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `vite build --mode development`              | 产物含 `/dev-api`                                                   |
| `vite build --mode staging`                  | 产物含 `/stage-api`                                                 |
| `vite build --mode production`               | 产物含 `/prod-api`                                                  |
| 删除 staging 的 `VITE_APP_BASE_API` 后再构建 | 退出码 1，`Missing environment variable: VITE_APP_BASE_API`，已还原 |
| `curl /dev-api/login`                        | **502**（代理到 `localhost:8080`，后端未开）                        |
| `curl /v3/api-docs/swagger-config`           | **502**                                                             |
| 未匹配路径                                   | 200，返回 SPA `index.html`                                          |
| SCSS                                         | `probe.scss` 编进 `static/css`，`@charset` 已去掉                   |
| SVG                                          | Vite 内置 URL / `?raw` 导入 `user.svg`，dev/build 均可              |
| `legacy/` 字符串                             | 产物中没有                                                          |
| 旧端口 80                                    | 本机 `EACCES`，开发端口改为 **5173**                                |

### 插件去留

| 旧插件                           | 本轮决定       | 理由                                                                                            |
| -------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `@vitejs/plugin-vue`             | 保留           | 官方 Vue SFC 编译，Vite 8 已验证                                                                |
| `unplugin-auto-import`           | 不装           | 手册默认显式导入                                                                                |
| `unplugin-vue-setup-extend-plus` | 不装           | 用 Vue 原生 `defineOptions`                                                                     |
| `vite-plugin-svg-icons`          | 推迟到第 13 轮 | peer 虽写 `vite>=2`，本轮用内置导入完成单图标验证                                               |
| `vite-plugin-compression`        | 不装           | staging/prod 仍声明 `VITE_BUILD_COMPRESS=gzip`，但产物不写 `.gz`，压缩交给部署层，避免双重 gzip |
| `sass-embedded@1.103.1`          | 安装           | SCSS 编译器，不是旧业务插件。`@parcel/watcher` 的 install 脚本被 Bun 拦截，sass 二进制仍可用    |

## 练习解答

1. `mode` 决定加载哪份 `.env.[mode]`；`vite build` 时 `NODE_ENV` 仍是 `production`。所以才有独立的 `VITE_APP_ENV`。
2. 构建期 `vite/env.ts` 会在缺 `VITE_APP_BASE_API` 时直接抛错，不会把请求打到 `undefined`。
3. Vite 8 把 `.svg` 当 URL、`.svg?raw` 当源码；sprite 插件留到 Layout 轮。
4. 若 nginx 已 gzip，构建再生成 `.gz` 且 `deleteOriginFile: true` 会让未配 brotli/gzip_static 的服务器只能拿到压缩文件。本轮不产出 `.gz`。

## 停止条件

- [x] Vite 配置完全使用 TypeScript 和 ESM。
- [x] 三种 mode 均可构建。
- [x] proxy 在开发环境可验证。
- [x] 每个保留插件都有兼容性证据和责任说明。
- [x] 没有为“和旧项目一样”无条件复制全部插件。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：新增 `sass-embedded@1.103.1`。未装 svg-icons / compression / auto-import
- 本轮假设：可以沿用旧端口 80，并且 PostCSS 对象插件能直接丢进 Vite 8
- 发现的隐式约定：本机不能绑 80；Vite 8 native config loader 要求相对导入带 `.ts` 后缀；PostCSS 8 插件必须是带 `postcss: true` 的 creator 函数，否则 `i is not a function`
- 新增兼容债：无。`VITE_BUILD_COMPRESS` 已校验，压缩插件明确不装
- 验证命令与结果：见上表
- 结束 commit：未提交

## 第 5 轮复盘

- 我原先的假设：把 `legacy/vite.config.js` 和全部插件一起搬过来最快。
- TypeScript/测试发现的问题：缺环境变量必须在 **config 求值时**失败；只靠浏览器里的 `requireEnv` 挡不住错误前缀被打进产物。
- 最终的类型或接口设计：`ImportMetaEnv` 已在第 4 轮；本轮 `vite/env.ts` 与 `src/config/env.ts` 做运行时/构建期双校验，且 `VITE_APP_ENV` 必须等于 Vite `mode`。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 6 轮开始应用装配（Element Plus、全局能力），不要回头加自动导入。

## 本轮产物

```text
.env.development
.env.staging
.env.production
vite.config.ts
vite/env.ts
vite/charset-removal.ts
src/config/env.ts
src/styles/probe.scss
src/assets/icons/svg/user.svg
```

## 推荐提交

```text
chore: migrate vite environments and verified plugins
```
