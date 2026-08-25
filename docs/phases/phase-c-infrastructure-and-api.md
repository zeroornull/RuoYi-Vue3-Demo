# 阶段 C 手册：应用基础设施与 API 边界

> 对应细分轮次：第 6—9 轮。本文件是阶段参考，不要求在一次学习会话中全部完成。

## 本阶段目标

迁移最关键的非 UI 基础设施：cookie/token、缓存、错误码、HTTP 客户端、下载与 API 模块。完成后，业务页面可消费可靠的类型化接口。

## 为什么这一轮最重要

旧 `legacy/src/utils/request.js` 同时处理：

- Axios 默认 header。
- API base URL 和超时。
- token 注入。
- GET 参数拼接。
- POST/PUT 重复提交保护。
- 业务 code 映射。
- 401 重新登录。
- blob/arraybuffer。
- 通用下载。

它是高扇出的运行边界。若在这里使用 `any`，后续所有页面都会失去 TypeScript 的价值。

## 步骤 1：先写行为测试

在改实现前，为纯行为建立最小测试：

1. 无 token 时不发送 Authorization。
2. `withToken=false` 时即使有 token 也不发送。
3. GET 参数序列化保持后端期望格式。
4. 相同 POST/PUT 在时间窗口内被拒绝。
5. 超过大小限制时跳过重复提交缓存。
6. 业务 code 200 返回 payload。
7. code 401 只触发一个重登流程。
8. blob/arraybuffer 直接返回二进制。
9. 网络错误、超时和 HTTP 状态错误映射到正确提示。

Element Plus UI 提示应通过可替换适配器注入，使 HTTP 测试不需要真实弹窗。

## 步骤 2：迁移小型基础模块

推荐顺序：

```text
auth/cookie keys
error codes
cache adapter
query serializer
blob validator
download adapter
HTTP client
API modules
```

每个模块保持小范围职责，避免重新创造一个更大的 `utils/index.ts`。

## 步骤 3：定义响应类型

使用[类型设计：API 响应](../reference/type-design.md#3-api-响应)作为起点。

关键规则：

- 列表接口与普通 data 接口分开。
- 删除/更新接口允许无 `data`。
- 后端字段可空性应来自实际协议或样本，不凭页面当前用法猜测。
- 日期在网络层通常仍是字符串；只有明确转换后才用 `Date`。
- 大整数 ID 若可能超过 JS 安全整数，保持字符串。

## 步骤 4：迁移 HTTP 自定义配置

先锁定旧行为，再把自定义 header flags 移到明确的 `ruoyi` 请求元数据。过渡期读取顺序可为：

1. 新 `config.ruoyi`。
2. 旧 headers flag。
3. 默认值。

当所有调用者完成迁移后删除第 2 条，并在测试中证明旧形态不再出现。

## 步骤 5：正确处理 Axios 泛型

Axios 拦截器若最终返回业务 payload，封装 API 应让调用者拿到对应类型。例如：

```ts
export async function getUser(id: number): Promise<UserDetail> {
  return http.get<UserDetail>(`/system/user/${id}`)
}
```

不要在调用者看到 `AxiosResponse<ApiResponse<UserDetail>>`，同时运行时却只返回 `UserDetail`。类型必须和真实返回值一致。

## 步骤 6：按域迁移 API

建议顺序：

1. `login` 与 `menu`：后续 Router/Pinia 依赖。
2. `system/user`、`role`、`menu`、`dept`。
3. 字典、配置、通知、岗位。
4. 监控模块。
5. 代码生成器。

每个 API 文件至少包含：

- 请求 DTO。
- 响应 DTO/领域输出类型。
- 方法返回类型。
- 必要的参数约束。

不要只把旧函数改名为 `.ts` 后让所有参数隐式 `any`。

## 步骤 7：下载与上传

下载需验证：

- 正确 Content-Type。
- 错误 JSON 被识别而不是保存成文件。
- loading 在成功、失败、解析异常时都关闭。
- 文件名和中文字符不丢失。
- `URL`/Blob 生命周期正确。

上传在第 14 轮通用组件迁移时完成，但本阶段先定义响应和进度类型。

## 本阶段练习

1. 为一个列表接口写 `PageResponse<UserSummary>`，观察页面需要的字段。
2. 将一个 API 响应先声明为 `unknown`，写转换函数后再交给 store。
3. 模拟两个相同 POST，验证重复提交保护的时间边界。
4. 模拟 blob 中实际包含错误 JSON 的情况。

## 验收清单

- [ ] HTTP 行为测试覆盖 token、重复提交、401、业务错误与 blob。
- [ ] HTTP 客户端和 API 文件中无无理由 `any`。
- [ ] 调用者类型与拦截器真实返回值一致。
- [ ] login/menu API 已可供下一轮使用。
- [ ] 三种环境的 base URL 都经过验证。
- [ ] 下载成功和失败路径都能关闭 loading。
- [ ] 未迁移页面不被迫参与本阶段构建。

## 推荐提交

```text
refactor: migrate typed http and api boundaries
```
