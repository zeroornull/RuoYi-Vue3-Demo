# 迁移轮次进度表

> 状态只能使用：`未开始`、`进行中`、`已完成`、`阻塞`。  
> 只有该轮停止条件全部满足并记录验证证据后，才能标为“已完成”。

| 轮次 | 主题 | 状态 | 开始 commit | 结束 commit | 验证记录/备注 |
| ---: | --- | --- | --- | --- | --- |
| 0 | 旧项目归档与基线 | 已完成 | 初始提交 | 初始提交 | 288 个旧受管路径保存在 `legacy/`；忽略和文档校验通过。仓库已重新 init，不再保留上游历史 |
| 1 | Bun 基础 | 已完成 | 初始提交 | 初始提交 | `packageManager: bun@1.4.0`；`bun run env:check` 通过；零依赖无 lockfile（Bun 会删除空锁）；CI/生命周期策略已记录 |
| 2 | Vue + Vite 最小骨架 | 已完成 | `f0ce9ad` | 未提交 | `vue@3.5.41` 与 `@vue/compiler-sfc@3.5.41` 同 patch；`bun run typecheck`/`build` 通过；dev HMR 与无错误控制台已验证。按要求本轮不提交 |
| 3 | TypeScript 语言实验 | 已完成 | `f0ce9ad` | 未提交 | `bun run lab:ts` 通过；`unknown`/`ApiResult`/递归路由/`satisfies` 均有 `@ts-expect-error` 预期失败。未迁生产代码 |
| 4 | 严格 TS 工程配置 | 已完成 | `f0ce9ad` | 未提交 | 覆盖 `skipLibCheck`；app 含 DOM、node 不含；`strictImportMetaEnv` 已开。typecheck/build 通过。未提交 |
| 5 | Vite、环境与插件 | 已完成 | `f0ce9ad` | 未提交 | 三 mode 构建前缀正确；缺 `VITE_APP_BASE_API` 构建失败；proxy 回 502；未复制旧插件。未提交 |
| 6 | 应用装配 | 已完成 | `f0ce9ad` | 未提交 | `element-plus@2.14.5`；中文 locale 与暗色 CSS 变量已验证；未装 Router/Pinia。app `skipLibCheck` 记入债务表。未提交 |
| 7 | 共享类型与工具 | 已完成 | `f0ce9ad` | 未提交 | `bun test tests/unit` 29 pass；`parseTime`/`handleTree`/`tansParams`/字典/密码已锁定。未提交 |
| 8 | HTTP 边界 | 未开始 |  |  |  |
| 9 | API 合约 | 未开始 |  |  |  |
| 10 | Pinia | 未开始 |  |  |  |
| 11 | 静态 Router | 未开始 |  |  |  |
| 12 | 动态路由与权限 | 未开始 |  |  |  |
| 13 | Layout、主题、TagsView、图标 | 未开始 |  |  |  |
| 14 | 通用组件与表单 | 未开始 |  |  |  |
| 15 | 认证、个人中心与锁屏 | 未开始 |  |  |  |
| 16 | 系统管理域 | 未开始 |  |  | 可拆 16.a—16.d |
| 17 | 监控域 | 未开始 |  |  | 可拆 17.a—17.c |
| 18 | 工具域与第三方 | 未开始 |  |  |  |
| 19 | 质量、依赖收敛与切换 | 未开始 |  |  |  |

## 更新规则

1. 开始一轮时填入开始 commit 并将状态改为“进行中”。
2. 验证失败但仍可继续修复时保持“进行中”，不要过早标记“阻塞”。
3. 出现外部权限、服务或协议问题时，记录具体阻塞证据。
4. 完成后填入结束 commit、验证命令和结果摘要。
5. 若拆分子批次，在备注中记录每个子批次 commit；父轮只有全部子批次完成后才能完成。

