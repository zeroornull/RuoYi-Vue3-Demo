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

## 本轮记录

### 17.a 日志与在线用户（工作区，未单独提交）

- 页面：`src/views/monitor/{online,logininfor,operlog}`。在线用户客户端分页 + 强退确认；登录日志查询/排序/删除/清空/解锁/导出；操作日志查询/排序/删除/清空/导出和失败详情对话框。
- Query 与 Row 分模型；详情用 `OperationLog`，没有 `Record<string, any>`。
- Mock：`vite/mock/monitor.ts`；无 token 的 `/monitor/*` 返回 401。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor`（165）；`bun run build:stage`。浏览器：在线用户强退、登录日志列表、操作日志失败详情（业务类型「删除」、异常信息）。

### 17.b 任务调度（工作区，未单独提交）

- 页面：`src/views/monitor/job/{index,log,detail}`。任务 CRUD、状态开关、立即执行；新增/编辑接第 14 轮 `Crontab`；隐藏路由 `/monitor/job-log/index/:jobId` 调度日志，`activeMenu=/monitor/job`；失败日志详情展示异常堆栈。
- Query / Create / Update / Row 分模型；详情用 `Job` / `JobLog`，没有 `Record<string, any>`。
- Mock：`vite/mock/job.ts` 覆盖 list/CRUD/changeStatus/run 和 jobLog list/delete/clean/export。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor`（169）；`bun run build:stage`。浏览器：新增任务并回填 cron、任务详情、立即执行、调度日志失败堆栈。

### 17.c 缓存与服务器（工作区，未单独提交）

- 页面：`src/views/monitor/cache/{index,list}`、`server/index`、`druid/index`。缓存监控 Redis INFO + 命令饼图 + 内存仪表；缓存列表 name/key/value 与按名/键/全部清理；服务器 CPU/内存/JVM 仪表与磁盘表，10s 可见性轮询；Druid 沙箱 iframe 指向 `appEnv.baseApi + /druid/login.html`。
- `CacheInfo` 为具名字段，没有 `Record<string, any>`。服务器缺字段经 `coalesceServer` 降级为 0/空串，图表不崩。
- 图表：`echarts@6.1.0` 按需 pie/gauge + CanvasRenderer；`createBoundChart` 负责 init/setOption/resize/dispose；主题切 `settings.isDark` 时 dispose 后重绘。
- 轮询：`createVisibilityPoll` 保存 timer、不可见暂停、inflight skip、卸载 `stop` + 图表 dispose；缓存列表 `resize` listener 同步卸载。
- Mock：`vite/mock/runtime.ts`（cache overview/names/keys/value/clear、server、`GET /druid/login.html` 在鉴权前放行）。
- 验证：`bun run typecheck`；`bun test tests/unit tests/system tests/monitor`（173）；`bun run build:stage`（单一 `use-chart-*.js` chunk，约 436 kB / gzip 148 kB）。浏览器：`/monitor/cache` Redis 7.2.4 与双 canvas；暗色主题图表仍在；`/monitor/cacheList` 点 `login_tokens` → `admin` 值、清键、清全部后 Key 数量变 0；`/monitor/server` 核心数 8 / 三仪表 / 磁盘；`/monitor/druid` iframe「Druid Monitor」；回归定时任务列表仍可用。390px 服务监控表可读，三仪表因原 8 栅格并排变窄。

## 停止条件

- [x] 监控域所有页面有迁移状态。（17.a—17.c 已迁）
- [x] 轮询、listener 和图表实例均正确清理。
- [x] ECharts 6 的空值、主题和 resize 行为已验证。
- [x] 17.a—17.b 日志/任务详情不依赖宽泛对象。
- [x] 17.a—17.b 导出、强制下线和立即执行等高风险操作有确认与失败处理。

## 推荐提交

```text
refactor: migrate typed monitoring and scheduler views
```

