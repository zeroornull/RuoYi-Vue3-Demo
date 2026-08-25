# 第 9 轮：按业务域建立 API 合约

## 主要变量

本轮迁移 API 函数和 DTO，不迁移 store、router 或页面。

## 学习目标

- 区分请求 DTO、响应 DTO、分页响应和领域输出。
- 根据后端实际协议表达可空性、ID 和日期。
- 让 API 层成为页面与后端之间的可靠类型边界。

## 迁移批次

### 9.1 前置闭环 API

- `login`
- `menu/getRouters`
- user info/logout/code image/register

### 9.2 系统管理 API

- user、role、menu、dept
- dict type/data
- config、notice、post

### 9.3 监控 API

- online、logininfor、operlog
- job、jobLog、cache、server

### 9.4 工具 API

- generator
- swagger 相关访问边界

## 每个 API 文件必须回答

1. 参数类型是什么？
2. 返回的是普通 `data`、分页 `rows/total`、空响应还是 blob？
3. 哪些字段可空？
4. ID 是否可能超过安全整数？
5. 日期是字符串、时间戳还是已转换对象？
6. 调用者最终拿到什么类型？

## 契约验证

对 login、getInfo、getRouters 和至少一个分页接口保存脱敏响应样本，做解析/转换测试。样本不能包含真实 token、密码、手机号或个人信息。

## 本轮不要做

- 不在页面内临时定义重复接口。
- 不把所有响应写成 `Record<string, any>`。
- 不根据单个页面当前访问字段武断删除其他协议字段。
- 不在 API 层加入页面提示和跳转。

## 练习

1. 为一个列表接口分别设计 DTO 与页面行模型。
2. 对未知响应使用解析函数，而不是直接 `as`。
3. 为删除接口表达无 `data` 响应。
4. 比较字符串 ID 与 number ID 对路由参数的影响。

## 验证

```bash
bun run typecheck
bun run test -- tests/contracts tests/unit/api
bun run build
```

## 停止条件

- [ ] login/menu API 可供第 10—12 轮使用。
- [ ] 所有旧 API 文件都有明确迁移状态。
- [ ] 分页、普通、空和二进制响应已分型。
- [ ] 契约样本经过脱敏并可重复测试。
- [ ] API 层无无理由 `any`。

## 推荐提交

```text
refactor: migrate typed api contracts by domain
```

