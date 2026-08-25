# 第 8 轮：HTTP、鉴权、缓存与下载边界

## 主要变量

本轮只迁移网络和浏览器持久化边界，不迁移全部 API 文件。

## 学习目标

- 正确使用 Axios 泛型与拦截器类型。
- 将 token、重复提交、业务错误、blob 和 UI 提示解耦。
- 理解浏览器 cookie/session/local storage 都是不可信外部输入。

## 参考

- [阶段 C 手册](../phases/phase-c-infrastructure-and-api.md)
- [类型设计：HTTP 自定义选项](../reference/type-design.md#4-http-自定义选项)
- 旧实现：`legacy/src/utils/request.js`

## 实操顺序

1. token/cookie adapter。
2. session/local cache adapter。
3. query serializer 和 blob validator。
4. UI feedback adapter，隔离 Element Plus。
5. Axios instance。
6. request interceptor。
7. response interceptor。
8. download service。

把旧 headers 中的 `isToken`、`repeatSubmit`、`interval` 先建兼容层，再迁移为明确的 `config.ruoyi` 元数据。兼容层必须登记在 `docs/migration-debt.md`。

## 必须先写的行为测试

- token 存在/不存在/显式禁用。
- GET 参数序列化。
- POST/PUT 重复提交时间窗。
- 大请求跳过缓存。
- code 200、401、500、601 和其他业务错误。
- 401 只弹出一个重登确认。
- blob/arraybuffer 直接返回。
- blob 实际包含错误 JSON。
- loading 在所有路径关闭。
- network error、timeout、HTTP status 文案。

## 本轮不要做

- 不迁移所有业务 API。
- 不把 Axios config 断言为 `any`。
- 不在 HTTP 层直接 import user store，优先注入 session-expired handler。
- 不顺便替换后端协议。

## 练习

1. 让拦截器运行时返回 payload，并让 TypeScript 返回类型与之完全一致。
2. 模拟两次并发 401，验证只显示一个确认框。
3. 将一个缓存 JSON 破坏，验证读取边界安全失败。

## 验证

```bash
bun run typecheck
bun run test -- tests/unit/http
bun run build
```

## 停止条件

- [ ] HTTP 行为测试覆盖所有关键分支。
- [ ] 调用者看到的类型等于实际返回值。
- [ ] UI、store 与 Axios 之间通过窄适配器连接。
- [ ] 临时旧 config 兼容层有删除条件。
- [ ] 尚未批量迁移 API 和页面。

## 推荐提交

```text
refactor: migrate typed http auth cache and download boundaries
```

