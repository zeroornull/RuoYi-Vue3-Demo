# 现状审计与迁移策略

## 1. 迁移目标

本项目的目标不是“把 `.js` 改成 `.ts`”，而是建立一套可持续演进的现代 Vue 管理端：

- Bun 作为包管理器与脚本入口。
- Vue 3、Vite、Vue Router、Pinia 等采用迁移当日的最新兼容稳定组合。
- TypeScript 严格模式覆盖构建配置、基础设施、状态、路由、组件和 API。
- 通过测试与可重复门禁证明旧行为没有被静默改变。
- 学习过程可拆分、可验收、可暂停、可回滚。

## 2. 旧项目基线

### 2.1 文件与技术形态

对归档前的 `src/` 与 `vite/` 统计：

- JavaScript：68 个文件。
- Vue SFC：97 个文件。
- TypeScript/TSX：0 个文件。
- Vue 组件中约 95 个使用 `<script setup>`，但没有 `lang="ts"`。
- 状态管理为 Pinia，路由为 Vue Router，UI 为 Element Plus，HTTP 为 Axios。
- 构建配置及 Vite 插件全部为 JavaScript。

这些文件现位于 `legacy/`。文档引用旧文件时统一使用 `legacy/...` 路径。

### 2.2 原始核心依赖

归档时 `legacy/package.json` 的关键版本：

| 依赖                 | 原版本 |
| -------------------- | ------ |
| Vue                  | 3.5.26 |
| Vite                 | 6.4.1  |
| `@vitejs/plugin-vue` | 5.2.4  |
| Vue Router           | 4.6.4  |
| Pinia                | 3.0.4  |
| Element Plus         | 2.13.1 |
| VueUse               | 14.1.0 |
| Axios                | 1.13.2 |

完整的“当前版本、最新版本、兼容选择和特殊 dist-tag”见[依赖兼容基线](./reference/dependency-baseline.md)。

### 2.3 关键运行边界

迁移时优先识别以下边界，而不是按文件名排序：

| 边界      | 旧位置                        | 隐式约定                                                                     |
| --------- | ----------------------------- | ---------------------------------------------------------------------------- |
| 应用装配  | `legacy/src/main.js`          | 全局组件、全局方法、Element Plus locale、插件和指令注册顺序                  |
| 环境变量  | `legacy/.env.*`               | `VITE_APP_TITLE`、`VITE_APP_ENV`、`VITE_APP_BASE_API`、`VITE_BUILD_COMPRESS` |
| HTTP      | `legacy/src/utils/request.js` | token、重复提交、业务状态码、blob 下载、重新登录弹窗                         |
| 路由      | `legacy/src/router/index.js`  | `hidden`、`permissions`、`roles`、自定义 `meta`、后端动态路由                |
| 权限      | `legacy/src/permission.js`    | 登录白名单、进度条、动态路由加载、标题更新                                   |
| 状态      | `legacy/src/store/modules/*`  | 用户、菜单、标签页、锁屏、字典、设置的跨模块约定                             |
| Vite 插件 | `legacy/vite/plugins/*`       | 自动导入、SVG、压缩、组件 name 扩展                                          |
| 全局 API  | `legacy/src/main.js`          | `useDict`、`download`、`parseTime` 等挂在 `globalProperties`                 |

### 2.4 自动导入是当前代码的重要隐式机制

`legacy/vite/plugins/auto-import.js` 自动导入了 Vue、Vue Router 和 Pinia API，并且设置 `dts: false`。因此某些旧文件没有显式 `import` 仍可能正常构建；迁移时不能把这种代码误判为简单的“漏导入”。

TypeScript 阶段应选择一种明确策略：

- **推荐学习策略**：迁移文件时补上显式导入，降低魔法和类型来源不透明。
- **可选保留策略**：升级自动导入插件并生成、提交或稳定生成 `.d.ts`；CI 必须在类型检查前拥有该声明文件。

本手册默认采用第一种。

## 3. 目标架构

建议最终结构：

```text
.
├── docs/                    # 本手册
├── legacy/                  # 本机旧项目快照，Git 忽略
├── public/
├── src/
│   ├── api/                 # 类型化 API 调用
│   ├── assets/
│   ├── components/
│   ├── composables/         # 从全局方法逐步抽出的组合式能力
│   ├── directives/
│   ├── layout/
│   ├── router/
│   ├── stores/
│   ├── types/               # 环境、API、路由、全局扩展声明
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── tests/
├── eslint.config.ts
├── index.html
├── package.json
├── tsconfig*.json
├── vite.config.ts
└── bun.lock
```

目录名 `stores/` 是推荐的新命名。为了减少一次性改动，也可先保留 `store/`，等所有调用者迁移后再单独重命名；不要在类型迁移中同时做无关目录美化。

## 4. 迁移顺序的依据

### 4.1 先建立可运行空壳

先证明 Bun、Vite、Vue、TypeScript 的最小组合可用。若最小空壳都无法构建，就不应复制旧业务代码。

### 4.2 再迁移边界

环境、HTTP、路由和状态拥有最高扇出。先给它们建立类型，后续页面迁移才能从可靠类型中获益。

### 4.3 最后迁移页面

页面数量多但通常扇出低，适合按业务域批量推进。此时 API、store 和 router 已有类型，页面错误更容易定位。

## 5. “最新”依赖的决策规则

### 5.1 不接受机械式 `@latest`

基线日存在至少三类陷阱：

1. `typescript@latest` 为 7.x，但 `typescript-eslint` 最新版声明的支持范围仍小于 6.1。
2. `vuedraggable` 的 `latest` dist-tag 指向 Vue 2 版本，而 Vue 3 版本使用 `next` dist-tag。
3. `vue-cropper` 同样存在 `latest` 与 `next` 指向不同主线的问题。

因此采用：

> 先读取版本、engines、peerDependencies 和 dist-tags，再选择满足全部约束的最高稳定版本，最后由 `bun.lock` 固化。

### 5.2 版本升级与 TS 迁移分离

每个依赖的升级分三步：

1. 在最小示例中确认新版本可构建。
2. 阅读主版本迁移说明，修复 API 差异。
3. 再把旧功能迁移到新版本。

不要同时“复制旧模块 + 改写业务 + 升主版本 + 增加类型”。

## 6. 行为保护策略

优先为以下高风险行为建立回归检查：

- token 是否仅在需要时发送。
- GET 参数序列化是否与后端兼容。
- POST/PUT 重复提交拦截是否保持相同时间窗口。
- 401 是否只触发一次重新登录确认。
- blob/arraybuffer 是否绕过普通业务状态码解析。
- 后端菜单是否正确转换为组件和嵌套路由。
- `roles` 与 `permissions` 是否仍按原语义控制动态路由。
- 标签页缓存、固定首页与持久化是否一致。
- 三种环境下的 API 前缀和压缩策略是否一致。

## 7. 每轮提交与回滚

建议提交粒度：

```text
docs: add migration learning guide
chore: bootstrap bun vue typescript app
chore: enable strict typescript boundaries
refactor: migrate typed http and api layer
refactor: migrate router pinia and permission flow
refactor: migrate shared components and layout
refactor: migrate system views
test: enforce migration quality gates
chore: remove temporary compatibility layers
```

若某轮失败，只回滚该轮；不要从 `legacy/` 直接覆盖新根目录。对照旧实现时使用只读 diff：

```bash
git diff --no-index -- legacy/src/utils/request.js src/utils/request.ts
```

`git diff --no-index` 在发现差异时返回非零退出码，这是正常行为。

## 8. 迁移完成的定义

只有同时满足以下条件才可宣布完成：

- 新根目录完全可运行，且无源码引用 `legacy/`。
- TypeScript 严格检查通过，没有以全局关闭规则换取通过。
- 所有关键行为有自动化测试或记录明确的人工验收证据。
- 所有构建模式产物可部署。
- 依赖版本矩阵、兼容选择与暂缓升级理由已更新。
- 新开发者只阅读根项目和 `docs/` 即可完成安装、运行与排错。
