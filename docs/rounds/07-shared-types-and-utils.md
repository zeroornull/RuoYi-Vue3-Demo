# 第 7 轮：共享类型、纯工具与领域基础

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

## 停止条件

- [ ] HTTP 前置依赖的纯工具已迁移。
- [ ] 核心纯函数有边界测试。
- [ ] 共享类型没有 `any` 和超级公共接口。
- [ ] 浏览器副作用没有混入纯工具层。
- [ ] 旧行为变化有明确单独记录。

## 推荐提交

```text
refactor: migrate typed shared utilities and domain primitives
```

