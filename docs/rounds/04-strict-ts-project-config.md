# 第 4 轮：严格 TypeScript 工程配置

> 状态：已完成。按要求未提交。`.env.*` 文件留到第 5 轮。

## 主要变量

本轮把 TypeScript 语言能力转化为项目级门禁。

## 学习目标

- 理解 `tsconfig` project references。
- 分离浏览器源码与 Node/Vite 配置类型。
- 建立 Vue SFC、环境变量和模块声明边界。
- 理解严格选项带来的真实约束。

## 参考

- [阶段 B 手册](../phases/phase-b-typescript-and-vite.md)
- [类型设计参考](../reference/type-design.md)
- TypeScript TSConfig：<https://www.typescriptlang.org/tsconfig/>

## 实操范围

建立或收紧：

```text
tsconfig.json
tsconfig.app.json
tsconfig.node.json
src/vite-env.d.ts
src/types/env.d.ts
src/types/global.d.ts
```

至少启用并理解：

- `strict`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noUnusedLocals`
- `noUnusedParameters`
- `verbatimModuleSyntax`
- `isolatedModules`
- `moduleResolution: Bundler`

优先继承脚手架采用的 `@vue/tsconfig`，再增量收紧。

## 本轮不要做

- 不打开全局 `skipLibCheck` 来消除错误。
- 不把严格选项关闭后称为完成。
- 不迁移旧 API、store、router 或页面。

## 练习

1. 用一个数组索引展示 `noUncheckedIndexedAccess`。
2. 用一个可选环境变量展示 `exactOptionalPropertyTypes`。
3. 在 Node 配置里引用浏览器 DOM 类型，观察为什么配置应分离。
4. 为一个不存在的 `.svg` 导入写最窄声明，而不是 `declare module '*'`。

## 验证

```bash
bun run typecheck
bunx --bun tsc --showConfig -p tsconfig.app.json
bunx --bun tsc --showConfig -p tsconfig.node.json
```

2026-08-25 实测：

| 检查                                     | 结果                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| `tsc --showConfig -p tsconfig.app.json`  | `lib` 含 `dom`；`types` 为空；`skipLibCheck` false         |
| `tsc --showConfig -p tsconfig.node.json` | `lib` 仅 `es2023`；`types` 为 `node`；无 DOM               |
| 在 `vite.config.ts` 写 `document.title`  | `TS2584 Cannot find name 'document'`，随后已还原           |
| `bun run typecheck`                      | 通过（覆盖了 `@vue/tsconfig` 默认的 `skipLibCheck: true`） |
| `bun run build`                          | 通过                                                       |
| `bun run lab:ts`                         | 通过                                                       |

## 严格选项理由

| 选项                                    | 为何开启                                                                |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `strict`                                | 空值、隐式 any、函数类型的底线                                          |
| `noUncheckedIndexedAccess`              | 数组/索引读取可能越界，结果是 `T \| undefined`                          |
| `exactOptionalPropertyTypes`            | `foo?: T` 的省略与 `{ foo: undefined }` 不是一回事                      |
| `noUnusedLocals` / `noUnusedParameters` | 防止死绑定混进迁移 diff                                                 |
| `verbatimModuleSyntax`                  | 类型导入必须 `import type`，避免 Vue SFC 留下多余运行时 import          |
| `isolatedModules`                       | 每个文件可被 Vite 单独转译                                              |
| `moduleResolution: bundler`             | 与 Vite 解析规则一致                                                    |
| `skipLibCheck: false`                   | 不靠跳过第三方声明假装通过。`@vue/tsconfig` 默认是 `true`，本轮显式关掉 |

## 停止条件

- [x] app/node 两套配置边界清楚。
- [x] 所有严格选项有书面理由。
- [x] `.vue` 和 `import.meta.env` 类型可被编辑器及 CLI 识别。
- [x] 没有全局跳过第三方声明检查。
- [x] 最小应用 typecheck/build 仍通过。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：无新包。仍是 `typescript@6.0.3`、`@vue/tsconfig@0.9.1`、`@types/node@22.20.1`
- 本轮假设：`@vue/tsconfig` 已经足够严格
- 发现的隐式约定：它默认 `skipLibCheck: true`，且注释掉了 `exactOptionalPropertyTypes`。Vite 的 `ImportMetaEnv` 默认带 `Record<string, any>`，要用 `ViteTypeOptions.strictImportMetaEnv` 关掉索引签名，自定义环境变量才有约束
- 新增兼容债：无。必填 `VITE_*` 已有类型，尚无 `.env` 文件，`requireEnv` 未接入 `main.ts`
- 验证命令与结果：见上表
- 结束 commit：未提交

## 第 4 轮复盘

- 我原先的假设：浏览器和 Node 可以共用一份 `tsconfig`。
- TypeScript/测试发现的问题：Node 配置里写 `document.title` 会得到 `TS2584`；这正是分离的理由。
- 最终的类型或接口设计：`ImportMetaEnv` 三个必填字段 + 可选 `VITE_BUILD_COMPRESS`；`*.svg?component` 而不是 `declare module '*'`；`ComponentCustomProperties` 空接口留给第 6 轮。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 5 轮补 `.env.*`、代理和 Vite 插件。

## 本轮产物

```text
tsconfig.json
tsconfig.app.json
tsconfig.node.json
src/vite-env.d.ts
src/types/env.d.ts
src/types/global.d.ts
src/types/svg.d.ts
src/config/env.ts
src/strict/index-access.ts
src/strict/optional-env.ts
```

## 推荐提交

```text
chore: enforce strict typescript project boundaries
```
