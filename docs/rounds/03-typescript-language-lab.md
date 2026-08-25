# 第 3 轮：TypeScript 语言实验

## 主要变量

本轮只学习 TypeScript 类型语言，不迁移旧业务模块。

## 为什么需要单独一轮

若直接在 Axios、Router 和 Vue 模板中学习泛型、联合类型、模块增强和收窄，错误会被框架类型淹没。本轮先用小型实验建立共同语言。

## 学习目标

- `unknown`、`any`、`never` 的区别。
- 联合类型、判别联合和类型收窄。
- 泛型约束与默认类型参数。
- 可选属性、`null`、`undefined` 和 `exactOptionalPropertyTypes`。
- `satisfies` 与类型断言的区别。
- `import type` 和运行时 import 的区别。

## 实操范围

建立独立实验目录，例如：

```text
learning/ts-lab/
├── 01-unknown.ts
├── 02-unions.ts
├── 03-generics.ts
├── 04-api-result.ts
├── 05-route-tree.ts
└── tsconfig.json
```

实验至少包含：

1. 把 `unknown` API 值收窄成用户对象。
2. 用判别联合表达成功/失败响应。
3. 用递归类型表达菜单树。
4. 用泛型表达分页结果。
5. 使用 `satisfies` 检查配置，同时保留字面量推断。

`learning/` 是否最终保留由第 19 轮决定；本轮不得把实验类型直接当成生产 API 合约。

## 练习问题

1. 为什么 `response as User` 不是真正验证？
2. `foo?: string` 与 `foo: string | undefined` 在精确可选属性下有何区别？
3. 什么时候应该返回 `never`？
4. 为什么领域 ID 不一定适合统一使用 `number`？

## 验证

```bash
bunx --bun tsc --noEmit -p learning/ts-lab/tsconfig.json
```

每个实验应同时包含一个正确示例和一个用 `@ts-expect-error` 表达的预期错误，并说明为什么预期失败。

## 停止条件

- [ ] 能在不使用 `any` 的情况下解析 `unknown`。
- [ ] 能写出 `ApiResult<T>` 和递归 Route DTO。
- [ ] 能解释 `satisfies`、断言和显式注解的差别。
- [ ] 所有实验的预期错误都被 TypeScript 正确捕获。
- [ ] 尚未开始迁移生产业务代码。

## 推荐提交

```text
docs: add typescript migration learning lab
```

