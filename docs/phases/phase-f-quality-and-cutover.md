# 阶段 F 手册：质量门禁、依赖收敛与正式切换

> 对应细分轮次：第 19 轮。第 19 轮只有在第 0—18 轮都有验收证据时才能开始。

## 本阶段目标

建立持续质量门禁，处理迁移期兼容层和旧依赖，证明新项目可以独立交付。

## 步骤 1：加入质量工具

按[依赖兼容基线](../reference/dependency-baseline.md)重新解析后安装：

```bash
bun add -d \
  vitest@4.1.11 \
  @vue/test-utils@2.4.11 \
  eslint@10.9.0 \
  @eslint/js@10.0.1 \
  eslint-plugin-vue@10.10.0 \
  typescript-eslint@8.67.0 \
  prettier@3.9.6
```

若执行时 peer 范围变化，以实际解析为准，不照抄版本。

ESLint 使用 flat config。Lint 负责代码质量，Prettier 负责格式；避免安装一串互相关闭规则的格式化插件。

## 步骤 2：定义统一脚本

建议：

```json
{
  "scripts": {
    "dev": "bunx --bun vite",
    "typecheck": "vue-tsc --build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "build": "bun run typecheck && bunx --bun vite build",
    "build:stage": "bun run typecheck && bunx --bun vite build --mode staging",
    "build:prod": "bun run typecheck && bunx --bun vite build --mode production",
    "check": "bun run typecheck && bun run test && bun run lint && bun run format:check && bun run build:prod"
  }
}
```

`check` 的顺序先快后慢；任何一步失败都停止。

## 步骤 3：测试金字塔

### 单元测试

- 查询参数序列化。
- 重复提交判断。
- 业务错误映射。
- 路由 DTO 转换。
- 权限判断。
- 字典和树转换纯函数。

### 组件测试

- Pagination 事件。
- 上传校验。
- DictTag 展示。
- 登录表单验证。
- 权限指令显示/隐藏。

### 集成/端到端

- 登录 → 菜单 → 首页。
- 权限不足。
- 令牌过期。
- 动态路由刷新恢复。
- CRUD 列表典型流程。
- 上传和下载。

不要只依赖快照测试；关键业务应断言可观察行为。

## 步骤 4：依赖收敛

逐包执行：

```bash
bun pm why <package>
bun outdated
bun pm licenses
bun pm scan
```

分类：

- **保留**：仍有调用者，兼容且有验证。
- **替换**：有明确收益和单独回归测试。
- **删除**：无调用者或已由平台/框架原生能力替代。
- **暂缓升级**：最新版本与工具链不兼容，记录解除条件。

优先删除：

- 已由原生 `defineOptions` 替代的 setup-extend 插件。
- 不再需要的自动导入插件。
- 部署层已提供压缩时的构建压缩插件。
- 无调用者的旧工具包。

## 步骤 5：清除迁移债

搜索并逐项关闭：

```bash
rg -n "@ts-ignore|@ts-expect-error|\bany\b|TODO.*migration|legacy/" src tests vite.config.ts
```

如果类型债仍必须保留，文档必须包含：

- 具体位置。
- 无法修复原因。
- 外部 issue/版本条件。
- 风险范围。
- 删除负责人或目标轮次。

## 步骤 6：构建矩阵

```bash
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run lint
bun run format:check
bun run build --mode development
bun run build:stage
bun run build:prod
```

对每个产物检查：

- base URL。
- API 前缀。
- sourcemap 策略。
- 静态资源路径。
- gzip/brotli 是否由正确层负责。
- chunk 大小与重复依赖。
- 不包含密钥、开发 URL 或 `legacy/` 内容。

## 步骤 7：与旧系统做行为对照

使用同一后端和同一测试账号，对照：

| 场景 | 旧系统 | 新系统 | 证据 |
| --- | --- | --- | --- |
| 登录成功/失败 |  |  | 日志/截图/测试 |
| 菜单与权限 |  |  | 路由快照/测试 |
| 用户 CRUD |  |  | 网络与 UI 结果 |
| 角色授权 |  |  | 权限结果 |
| 字典/配置 |  |  | 页面行为 |
| 任务/日志 |  |  | 页面行为 |
| 上传/下载 |  |  | 文件校验 |
| 主题/标签页 |  |  | 截图/DOM 断言 |

对照的是行为，不要求 DOM 结构或实现逐字相同。

## 步骤 8：切换与回退

切换前：

- 记录第 19 轮 Git SHA。
- 保留迁移前历史或 tag。
- 产物在接近生产的环境验证。
- 明确回退到旧 commit/发布物的步骤。

`legacy/` 只在本机存在且被忽略，不应成为生产回退机制。正式回退应使用已发布产物、Git tag 或分支。

## 最终验收清单

- [ ] `bun install --frozen-lockfile` 在干净环境通过。
- [ ] `bun run check` 通过。
- [ ] 所有 mode 构建通过并检查产物。
- [ ] 关键 E2E 流程通过。
- [ ] 依赖扫描和许可证结果已审阅。
- [ ] 不存在未解释的 TypeScript 逃生口。
- [ ] 不存在源码、测试、脚本或 CI 对 `legacy/` 的引用。
- [ ] 新 README 包含安装、开发、测试、构建和排错说明。
- [ ] 回退步骤不依赖被忽略的本地目录。

## 推荐提交

```text
test: enforce migration quality gates
chore: remove migration compatibility layers
docs: document bun typescript delivery workflow
```

## 完成定义

当本页全部通过，迁移才从“能跑”升级为“可维护、可验证、可交付”。此后升级依赖应走常规小步升级流程，而不是再次进行大爆炸式迁移。
