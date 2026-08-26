# 第 0 轮：旧项目归档与迁移基线

> 状态：已完成。

## 学习目标

- 理解 Git 历史、工作树和被忽略本地快照的区别。
- 识别迁移前必须保留的行为基线。
- 明确新版根目录与 `legacy/` 的隔离边界。

## 已完成内容

- 原项目 288 个受管路径已复制到对应的 `legacy/<原路径>`。
- 根 `.gitignore` 已忽略 `/legacy/`。
- 旧项目对照副本位于被忽略的 `legacy/`。本仓库已重新 init，不再保留上游提交记录。
- 已完成 68 个 JS、97 个 Vue SFC、0 个 TS/TSX 的结构审计。
- 已识别 main、HTTP、Router、Pinia、权限、Vite 插件和全局属性等边界。

详细审计见[现状审计与迁移策略](../00-current-state-and-strategy.md)。

## 本轮必须理解的风险

`legacy/` 被忽略，因此：

- 新 clone 不会自动获得它。
- `git clean -xfd` 可能删除它。
- 生产回退不能依赖它。
- 本仓库 Git 历史里已经没有旧 RuoYi 源码；对照和恢复只能依赖本机 `legacy/` 或其他外部备份。

## 验证命令

```bash
git check-ignore -v legacy/package.json
git status --short
find legacy -maxdepth 2 -type f | head
```

## 练习

1. 解释为什么 `legacy/` 存在于磁盘上，却不会出现在 `git status` 里。
2. 使用 `git diff --no-index -- legacy/package.json package.json` 对照旧、新清单，但不要覆盖当前根目录。
3. 列出至少五个迁移时必须保持的旧行为。

## 停止条件

- [x] 所有旧受管路径均存在于 `legacy/`。
- [x] `legacy/` 确认被忽略。
- [x] 基线 commit、依赖版本和架构边界已写入文档。
- [x] 根目录没有无意参与构建的旧源码。

## 本轮产物

```text
.gitignore
docs/
legacy/  # 本机、被忽略
```
