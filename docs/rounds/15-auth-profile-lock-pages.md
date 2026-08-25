# 第 15 轮：认证、个人中心与锁屏页面

## 主要变量

本轮迁移第一组真实业务页面，用它验证此前建立的 HTTP、API、store、router、Layout 和通用组件是否能闭环协作。

## 页面范围

- `legacy/src/views/login.vue`
- `legacy/src/views/register.vue`
- `legacy/src/views/lock.vue`
- `legacy/src/views/system/user/profile/index.vue`
- `resetPwd.vue`
- `userAvatar.vue`
- `userInfo.vue`
- 401/404 页面正式视觉内容

## 学习目标

- 类型化表单 model、rules、refs 和提交状态。
- 将验证码、RSA 加密、cookie 记住账号和登录 API 分离。
- 处理文件裁剪、上传与 profile 更新后的状态同步。
- 建立用户可见错误和安全错误之间的边界。

## 实操顺序

1. 登录表单静态 UI 与类型。
2. 验证码获取/刷新。
3. 密码加密适配器与登录请求。
4. remember-me cookie，明确安全风险和保存范围。
5. 注册页。
6. profile 信息与密码修改。
7. avatar cropper/upload。
8. lock/unlock。
9. 401/404 最终页面。

## 第三方专项

`vue-cropper` 的 Vue 3 使用线位于 `next` dist-tag，不能直接安装默认 `latest`。迁移头像裁剪时验证：

- 原图方向和尺寸。
- 裁剪框比例。
- 输出格式、质量、大小。
- 上传失败恢复。
- 更新成功后 user store/avatar 同步。

## 安全与行为测试

- 错误密码、验证码过期、网络失败。
- 登录按钮防重复提交。
- token 写入时机。
- remember-me 不保存不应保存的敏感内容。
- 修改密码后的登录态处理。
- 头像上传类型/大小/失败。
- 锁屏刷新与解锁失败。

## 练习

1. 为登录状态建立判别联合：idle/submitting/success/error。
2. 解释前端 RSA 加密为什么不能替代 HTTPS。
3. 模拟 profile 更新成功但 store 刷新失败，设计恢复策略。

## 验证

```bash
bun run typecheck
bun run test -- tests/components/auth tests/integration/auth-profile
bun run build:stage
```

浏览器完成登录成功、失败、注册、修改信息、修改密码、头像和锁屏流程。

## 停止条件

- [ ] 认证和 profile 页面不再使用占位实现。
- [ ] 所有表单与上传流程有真实类型。
- [ ] 登录/退出/锁屏与 store/router 行为一致。
- [ ] 加密、cookie、cropper 风险已记录。
- [ ] 失败路径有可观察反馈且可恢复。

## 推荐提交

```text
refactor: migrate typed authentication and profile flows
```

