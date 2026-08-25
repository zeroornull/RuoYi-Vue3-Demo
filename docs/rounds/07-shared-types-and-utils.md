# 第 7 轮：共享类型、纯工具与领域基础

> 状态：已完成。按要求未提交。测试使用 Bun test。

## 主要变量

本轮迁移没有 UI 副作用的共享类型和纯函数，为 HTTP、API、store 和页面提供可靠基础。

## 学习目标

- 区分 DTO、领域类型、ViewModel 和纯工具类型。
- 用 `unknown` 和类型守卫处理外部输入。
- 用测试锁定时间、树、字典、参数等旧行为。

## 优先迁移范围

从 `legacy/src/utils/` 中优先选择纯模块：

- `validate.js`
- `passwordRule.js`
- `permission.js`
- `errorCode.js`
- `dynamicTitle.js`
- `theme.js`
- `scroll-to.js`
- `ruoyi.js` 中可拆出的纯函数
- `dict.js` 中无 store/API 副作用部分

暂不迁移：

- `request.js`
- 依赖 DOM/Element Plus 的下载或 modal 行为
- 依赖具体页面的代码生成器工具

## 类型设计任务

建立最小共享类型：

- `Nullable<T>` 等真正必要的 utility type。
- 树节点通用约束，而不是一个包含所有业务字段的超级节点。
- 字典项、日期范围和选择项类型。
- ID 策略：明确哪些是 `number`、`string` 或联合。
- 错误码映射的 key/value 类型。

不要创建 `types/common.ts` 垃圾桶；按 API、router、dict、tree 等责任分文件。

## 行为测试

至少覆盖：

- `parseTime` 的空值、秒/毫秒时间戳、格式化 token。
- `handleTree` 的根节点、孤儿节点和 children。
- `tansParams` 的数组、嵌套对象、空值和特殊字符。
- 字典 label 查找缺失值。
- 密码规则边界。

如果旧函数包含缺陷，先用 characterization test 记录旧行为，再决定是否另开修复提交。

## 练习

1. 把一个接收任意对象的树函数改成带泛型约束的函数。
2. 比较“一个大接口全部可选”和多个明确接口。
3. 为 JSON.parse 返回值写类型守卫。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/utils
bun run build
```

若测试框架尚未正式加入，可先使用 Bun test；第 19 轮再统一测试工具。不要因此省略行为锁定。

2026-08-25 实测：`bun test tests/unit` 29 pass / 0 fail；`bun run typecheck` 与 `bun run build` 通过。

未迁（有 UI/store/API 副作用）：`request.js`、`useDict`、`resetForm`、`scroll-to.js`、`handleThemeStyle` 的 DOM 写入、`dynamicTitle` 的 document 写入、代码生成器。

旧缺陷记录：`sprintf` 在 ESM 严格模式里引用未定义的 `args`，本轮不复刻该实现。`parseTime(0)` 因旧 `!time` 判断返回 `null`，不是 epoch。

## 停止条件

- [x] HTTP 前置依赖的纯工具已迁移。
- [x] 核心纯函数有边界测试。
- [x] 共享类型没有 `any` 和超级公共接口。
- [x] 浏览器副作用没有混入纯工具层。
- [x] 旧行为变化有明确单独记录。

## 本轮记录

- 开始 commit：`f0ce9ad`
- 实际依赖版本：无新包。测试用 Bun test
- 本轮假设：`handleTree` 可以直接给泛型对象写 `node[children] = []`
- 发现的隐式约定：TS 6 对泛型索引赋值报 `TS2862`，写入必须经过 `Record<string, unknown>` 断言。`parseTime(0)` 按旧 `!time` 是空值
- 新增兼容债：无
- 验证命令与结果：`bun test tests/unit` 29 pass；typecheck/build 通过
- 结束 commit：未提交

## 第 7 轮复盘

- 我原先的假设：把 `ruoyi.js` 整文件改后缀即可。
- TypeScript/测试发现的问题：`resetForm` 依赖 Options API 的 `this`；`permission.js`/`dict.js` 一上来就绑 store。纯函数必须把 owned permissions 当成参数。
- 最终的类型或接口设计：`EntityId` 用 string；字典 `value` 用 string，查找仍用 `==` 兼容数字；树是 `T extends Record<string, unknown>`，没有超级节点接口。
- 保留的兼容层：无。
- 下一轮前必须偿还的技术债：无。第 8 轮 HTTP 会用到 `tansParams` 和 `blobValidate`。

## 本轮产物

```text
src/types/id.ts
src/types/dict.ts
src/types/tree.ts
src/types/query.ts
src/utils/*.ts
tests/unit/utils/*.test.ts
```

## 推荐提交

```text
refactor: migrate typed shared utilities and domain primitives
```

