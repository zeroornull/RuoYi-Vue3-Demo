# 迁移临时债务登记表

本文件只记录为了分轮迁移而暂时保留的兼容处理。每条记录必须有删除条件；不能用本表为永久性 `any`、全局关闭规则或未验证行为免责。

| 位置                                    | 临时处理                                | 为什么暂时需要                                                                                                                                                                                                                                             | 风险范围                                                      | 删除轮次/条件                                         | 验证方式                                              | 状态         |
| --------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------ |
| `tsconfig.app.json` `skipLibCheck`      | 仅应用工程为 `true`；`src/` 仍 strict   | 19.d 复测 `skipLibCheck: false`：`element-plus@2.14.5` `GlobalComponents` 缺 index signature、`SliderContext`/`ElTooltipContentProps` 与 `exactOptionalPropertyTypes` 冲突；`vue-router` experimental resolver `name: undefined`。不是给 `src/` 关严格性。 | 只跳过 `node_modules` 声明。`tsconfig.node.json` 仍为 `false` | 上游 `.d.ts` 能过 `exactOptionalPropertyTypes` 后再关 | 把该项改回 `false` 后跑 `bun run typecheck`           | 外部解除条件 |
| `src/utils/jsencrypt.ts` 内置 RSA 私钥  | 记住密码 cookie 用前端 RSA 对密码做混淆 | 与旧项目协议一致；私钥随包分发。19.d 不能删：没有后端 remember-token。                                                                                                                                                                                     | 只能防「一眼看到明文」，不能防 XSS/本地读取。传输仍靠 HTTPS   | 后端提供专用 remember-token 后删除密码 cookie 与私钥  | 审计 cookie 不再包含可逆密码                          | 外部解除条件 |
| `tsconfig.app.json` paths `vue-cropper` | 映射到本地 shim                         | `vue-cropper@1.1.4` 的 `lib/typings/index.d.ts` 仍 `import` `../vue-cropper.vue`，`skipLibCheck` 盖不住。19.d 复测仍需要 path。                                                                                                                            | 仅类型解析；运行时仍用 npm 包                                 | 上游发布不引用 `.vue` 的 `.d.ts` 后删除 path          | `bun run typecheck` 不进入 `node_modules/vue-cropper` | 外部解除条件 |

## 填写规则

1. 引入临时处理的同一个提交必须添加记录。
2. `@ts-expect-error` 需在代码注释和此表中同时说明外部版本/issue 条件。
3. 删除兼容层时，在提交中删除对应行，而不是永久保留“已完成”噪声。
4. 若一条债务跨过原定轮次，必须补充新的风险与解除条件。
5. 以下项目不能只登记而不修复：全局关闭 `strict`、全局启用 `skipLibCheck`、HTTP/API 层大面积 `any`、生产代码引用 `legacy/`。
