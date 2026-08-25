# 第 5 轮：Vite 8、环境变量与插件最小集

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

## 停止条件

- [ ] Vite 配置完全使用 TypeScript 和 ESM。
- [ ] 三种 mode 均可构建。
- [ ] proxy 在开发环境可验证。
- [ ] 每个保留插件都有兼容性证据和责任说明。
- [ ] 没有为“和旧项目一样”无条件复制全部插件。

## 推荐提交

```text
chore: migrate vite environments and verified plugins
```

