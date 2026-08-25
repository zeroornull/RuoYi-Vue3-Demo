# 第 17 轮：监控业务域

## 主要变量

本轮迁移监控、日志、任务、缓存和服务器页面，重点处理大数据、定时刷新、图表和只读详情。

## 页面范围

- online
- logininfor
- operlog/detail
- job/detail/log
- cache/list
- server
- druid

## 学习目标

- 类型化日志、任务和监控数据。
- 正确管理轮询、计时器、取消请求和组件销毁。
- 升级并验证 ECharts 6。
- 处理大表格、格式化值、只读详情和外部监控页。

## 实操批次

### 17.a 日志与在线用户

- online、logininfor、operlog。
- 查询、强退、清空、导出和详情。

### 17.b 任务调度

- job、jobLog、detail。
- cron 表达式与第 14 轮 Crontab 集成。
- 状态切换、立即执行和错误堆栈。

### 17.c 缓存与服务器

- cache name/key/value。
- server metrics。
- druid/外部链接。

## ECharts 6 专项

先用静态数据建立最小图表，再连接服务器数据。验证：

- 按需注册的 chart/component/renderer 完整。
- resize listener 清理。
- 组件卸载时 dispose。
- 空数据、异常值和单位格式。
- 主题切换。
- build 后不出现重复 ECharts bundle。

## 轮询与资源清理

所有轮询必须：

- 保存 timer 类型。
- 在组件卸载时清理。
- 页面不可见时评估暂停。
- 避免前一次请求未结束又启动下一次。
- 支持 AbortController 或等价取消策略。

## 练习

1. 模拟 server metrics 缺失字段，验证图表安全降级。
2. 用 fake timers 测试轮询清理。
3. 对大日志表格检查渲染和导出是否阻塞。

## 验证

```bash
bun run typecheck
bun run test -- tests/monitor
bun run build:stage
```

浏览器检查日志、任务、缓存、服务器图表和外链行为。

## 停止条件

- [ ] 监控域所有页面有迁移状态。
- [ ] 轮询、listener 和图表实例均正确清理。
- [ ] ECharts 6 的空值、主题和 resize 行为已验证。
- [ ] 日志/任务详情不依赖宽泛对象。
- [ ] 导出和强制下线等高风险操作有确认与失败处理。

## 推荐提交

```text
refactor: migrate typed monitoring and scheduler views
```

