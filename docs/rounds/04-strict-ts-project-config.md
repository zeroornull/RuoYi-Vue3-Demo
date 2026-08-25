# 第 4 轮：严格 TypeScript 工程配置

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

## 停止条件

- [ ] app/node 两套配置边界清楚。
- [ ] 所有严格选项有书面理由。
- [ ] `.vue` 和 `import.meta.env` 类型可被编辑器及 CLI 识别。
- [ ] 没有全局跳过第三方声明检查。
- [ ] 最小应用 typecheck/build 仍通过。

## 推荐提交

```text
chore: enforce strict typescript project boundaries
```

