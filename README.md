# RuoYi-Vue3

正在用 Bun + TypeScript 重建。当前完成第 7 轮：共享纯工具已迁并有 Bun 测试，还没有 HTTP 与业务页面。

- 学习手册：[docs/README.md](./docs/README.md)
- Bun 策略：[docs/reference/bun-repository-policy.md](./docs/reference/bun-repository-policy.md)
- 进度：[docs/progress.md](./docs/progress.md)

```bash
bun --version    # 1.4.0
node --version   # ^20.19.0 || >=22.12.0
bun install --frozen-lockfile
bun run env:check
bun run typecheck
bun run dev
```
