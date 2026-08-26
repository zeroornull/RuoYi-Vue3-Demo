# 阶段 B 手册：TypeScript 与 Vite 基础设施

> 对应细分轮次：第 3—5 轮。本文件是阶段参考，不要求在一次学习会话中全部完成。

## 本阶段目标

建立严格、可解释的 TypeScript 基础设施，并迁移 Vite 配置、环境变量和必要声明；仍不迁移业务页面。

## 要学习的内容

- TypeScript 的项目引用与浏览器/Node 配置分离。
- `strict` 家族选项如何暴露隐式空值和未检查索引。
- `.d.ts` 是声明边界，不会生成运行时代码。
- Vite 环境变量在编译期类型和运行时值之间的区别。

## 步骤 1：启用严格配置

优先从 `create-vue@latest` 生成的 `@vue/tsconfig` 组合开始，再增量收紧。浏览器配置建议至少启用：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "preserve",
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

根据执行时 TypeScript 版本核对废弃或新增配置。不要复制后直接假设全部有效，也不要为了自定义而丢掉 `@vue/tsconfig` 对 Vue/Vite 环境的官方默认值。

Node/Vite 配置放入独立 `tsconfig.node.json`，只包含 `vite.config.ts` 与 `vite/**/*.ts`。如果使用 Node 内置模块，安装与 CI Node 主版本一致的 `@types/node`。

## 步骤 2：环境变量类型与运行时校验

将以下旧变量恢复到根目录 `.env.*`，并建立声明：

- `VITE_APP_TITLE`
- `VITE_APP_ENV`
- `VITE_APP_BASE_API`
- `VITE_BUILD_COMPRESS`

参考[类型设计：环境变量](../reference/type-design.md#2-环境变量)。

注意事项：

- `.env` 中的值都是字符串。
- `readonly` 只保护 TypeScript 使用方式，不验证部署环境。
- 必填变量应在应用启动或配置加载阶段进行运行时校验。
- 不把密钥放进 `VITE_` 变量；它们会进入浏览器构建产物。

## 步骤 3：迁移 Vite 配置

按下列顺序迁移旧 `legacy/vite.config.js`：

1. ESM 路径别名。
2. `base`。
3. dev server 的端口、host、open。
4. `/dev-api` 与 springdoc proxy。
5. build 输出命名和 chunk warning。
6. SCSS/PostCSS 处理。
7. 最后才迁移 SVG 和压缩插件。

每加一项都运行：

```bash
bun run typecheck
bun run build
```

不要一次复制整个旧配置，否则无法判断 Vite 8、ESM 或插件导致的失败。

当前旧项目从 Vite 6 跨到 Vite 8，应依次阅读：

- Vite 6 → 7：<https://v7.vite.dev/guide/migration>
- Vite 7 → 8：<https://vite.dev/guide/migration>

## 步骤 4：决定自动导入策略

### 默认方案：显式导入

迁移文件时写：

```ts
import { computed, ref } from "vue";
import { defineStore } from "pinia";
```

优点：

- 类型来源清楚。
- 编辑器和 CI 不依赖生成声明时序。
- 学习阶段能理解真实依赖。

### 可选方案：保留自动导入

如果决定保留，必须：

- 升级并验证 `unplugin-auto-import`。
- 开启 `dts`，生成稳定路径，例如 `src/types/auto-imports.d.ts`。
- 确保类型检查前声明已存在。
- 配置 ESLint globals 或对应插件。
- 记录哪些 API 允许自动导入，避免任意本地工具变成隐式全局。

## 步骤 5：建立类型目录

建议先建立：

```text
src/types/
├── api.ts
├── env.d.ts
├── global.d.ts
├── router.ts
└── utility.ts
```

此阶段只写最小真实类型，不要预先设计几十个尚未迁移的业务接口。

## 步骤 6：建立类型债规则

推荐在 `docs/migration-debt.md` 记录临时逃生口：

```md
| 位置 | 临时处理 | 原因 | 删除轮次 | 验证方式 |
| ---- | -------- | ---- | -------- | -------- |
```

规则：

- 禁止无记录的 `@ts-ignore`。
- `@ts-expect-error` 必须说明依赖 issue 或预期错误。
- 禁止把 `strict` 或 `noUncheckedIndexedAccess` 全局关掉。
- 第三方声明问题优先通过窄适配器隔离，不把 `any` 扩散到业务。

## 本阶段练习

1. 为环境变量删掉一个必填值，分别观察 TypeScript 和运行时校验。
2. 把数组索引结果直接当作非空值，观察 `noUncheckedIndexedAccess`。
3. 比较 `import type` 与普通 import 的构建输出和语义。
4. 把旧 `path.resolve(__dirname, './src')` 改为 ESM 形式并解释原因。

## 验收清单

- [ ] 所有 TS 配置无未知/废弃选项警告。
- [ ] `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes` 已启用。
- [ ] 没有使用全局 `skipLibCheck` 掩盖问题。
- [ ] 环境变量同时有静态声明和运行时必填检查。
- [ ] Vite 配置已经是 `.ts` 且不依赖 CommonJS 全局变量。
- [ ] `bun run typecheck` 与三种 mode 的最小 build 通过。
- [ ] 自动导入策略已记录且只有一种生效路径。

## 推荐提交

```text
chore: establish strict typescript boundaries
```
