# 第 2 轮：Vue + Vite + TypeScript 最小骨架

## 主要变量

本轮只引入最小 Vue SFC 工具链，使根目录重新可运行。

## 学习目标

- 理解 Vue runtime、SFC compiler、Vite 插件和 `vue-tsc` 的职责。
- 学会用官方 `create-vue@latest` 获取当时组合验证过的配置。
- 掌握 Bun 驱动 Vite CLI 的方式。

## 参考

- [阶段 A 手册](../phases/phase-a-bun-and-scaffold.md)
- Vue 工具链：<https://vuejs.org/guide/scaling-up/tooling.html>
- Bun + Vite：<https://bun.com/guides/ecosystem/vite>

## 实操范围

1. 在相邻临时目录运行：

   ```bash
   bun create vue@latest ../RuoYi-Vue3-scaffold
   ```

2. 脚手架可选择 TypeScript、Router、Pinia 用于观察官方组合，但根目录本轮只复制：
   - `index.html`
   - 最小 `src/main.ts`
   - 最小 `src/App.vue`
   - Vite/TypeScript 必需配置
3. 根项目只安装 Vue、Vite、`@vitejs/plugin-vue`、TypeScript、`vue-tsc`。
4. 使用 `bunx --bun vite` 运行 dev/build。
5. 检查 `vue` 与 `@vue/compiler-sfc` 是否解析到相同 patch。

## 本轮不要做

- 不迁移旧样式、组件、Router、Pinia、Element Plus。
- 不复制整个脚手架的所有可选工具。
- 不复制 `legacy/src/main.js`。

## 验证

```bash
bun install --frozen-lockfile
bun pm why @vue/compiler-sfc
bun run typecheck
bun run build
bun run dev
```

浏览器验证：页面可开、无控制台错误、HMR 生效。

## 练习

1. 暂时制造一个 SFC prop 类型错误，比较 Vite dev 和 `vue-tsc` 反馈。
2. 解释 `@vitejs/plugin-vue` 与 `@vue/compiler-sfc` 的关系。
3. 去掉 `--bun` 观察实际 CLI runtime，再恢复明确配置。

## 停止条件

- [ ] 根目录最小 Vue TS 应用可启动。
- [ ] 类型检查和生产构建通过。
- [ ] `bun.lock` 已生成且可冻结安装。
- [ ] 根应用不引用 `legacy/`。
- [ ] 尚未引入业务框架和业务代码。

## 推荐提交

```text
chore: bootstrap minimal vue vite typescript app
```

