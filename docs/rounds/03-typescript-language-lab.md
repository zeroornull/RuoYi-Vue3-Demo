# 第 3 轮：TypeScript 语言实验

> 状态：已完成。按要求未提交。实验代码在 `learning/ts-lab/`，不作为生产 API 合约。

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

### 练习解答

1. 断言只改编译器眼里的类型，运行时仍可能是任意 JSON。`01-unknown.ts` 用 `parseUser` 收窄字段；`as User` 能编译，但不能保证 `userId` 是字符串。
2. 开启 `exactOptionalPropertyTypes` 后，`foo?: string` 允许省略该键，不允许 `{ foo: undefined }`；`foo: string | undefined` 必须出现该键，值可以是 `undefined`。见 `02-unions.ts`。
3. 穷尽检查的剩余分支、或函数保证不会正常返回时（`assertNever`）。把未处理的联合成员赋给 `never`，漏 case 会立刻成为类型错误。
4. JSON 数字超过 `Number.MAX_SAFE_INTEGER` 会丢精度；后端 Long/雪花 ID 常以字符串传输。边界上用 `string`（`EntityId`），需要运算再显式转换。

## 验证

```bash
bunx --bun tsc --noEmit -p learning/ts-lab/tsconfig.json
# 或
bun run lab:ts
```

每个实验应同时包含一个正确示例和一个用 `@ts-expect-error` 表达的预期错误，并说明为什么预期失败。

2026-08-25 实测：`bun run lab:ts` 通过；`bun run typecheck` 仍通过；`learning/` 中无 `any`。

## 停止条件

- [x] 能在不使用 `any` 的情况下解析 `unknown`。
- [x] 能写出 `ApiResult<T>` 和递归 Route DTO。
- [x] 能解释 `satisfies`、断言和显式注解的差别。
- [x] 所有实验的预期错误都被 TypeScript 正确捕获。
- [x] 尚未开始迁移生产业务代码。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：沿用第 2 轮 `typescript@6.0.3`，无新包
- 本轮假设：`as Record<string, number>` 就能把错误值断言进去
- 发现的隐式约定：类型重叠不够时，单次 `as` 仍会报错；真正“说谎”的是 `as unknown as`。`satisfies` 的报错落在属性上，`@ts-expect-error` 必须写在那一行。
- 新增兼容债：无。`learning/` 是否保留由第 19 轮决定
- 验证命令与结果：`bun run lab:ts` 通过
- 结束 commit：未提交（按此前要求）

## 第 3 轮复盘

- 我原先的假设：类型断言和 `satisfies` 差不多，只是写法不同。
- TypeScript/测试发现的问题：注解 `Record<string, number>` 会加宽字面量，且配合 `noUncheckedIndexedAccess` 后索引变成 `number | undefined`；`as const satisfies` 能校验并保留 `200`。
- 最终的类型或接口设计：实验中的 `ApiResult<T>`、`PageResult<T>`、`BackendRouteDto` 只存在于 `learning/ts-lab/`，生产合约从第 7—9 轮再写。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 4 轮把这些严格选项接到项目 `tsconfig`，不要把 lab 文件编进应用。

## 本轮产物

```text
learning/ts-lab/tsconfig.json
learning/ts-lab/01-unknown.ts
learning/ts-lab/02-unions.ts
learning/ts-lab/03-generics.ts
learning/ts-lab/04-api-result.ts
learning/ts-lab/05-route-tree.ts
```

## 推荐提交

```text
docs: add typescript migration learning lab
```
