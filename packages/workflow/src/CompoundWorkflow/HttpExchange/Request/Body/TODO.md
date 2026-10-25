# TODO: 请求体的两种消费模式（exchange 粒度认领）

状态：**远期计划，未实施**。触发条件是有下游团队明确提出“性能敏感、
要自己拿原生流”，并且接受下面的代价清单。

目录：`packages/workflow/src/CompoundWorkflow/HttpExchange/Request/Body/`

## 目标

- 每个 exchange 独立决定请求体由谁消费：**distributor（默认）** 或
  **原生 node 流**。
- 认领是一次性的：谁先碰谁赢，另一方立刻收到异常。
- 目的不是让框架“更快”，而是把选择权与代价一并交给下游——任何人想用
  原生流，就必须显式承担反模式代价。

## 状态机（每个 exchange 一份）

| 状态          | 进入方式                    | 之后允许                 | 之后抛错               |
| ------------- | --------------------------- | ------------------------ | ---------------------- |
| `UNCLAIMED`   | 构造完成                    | 任意一侧                 | —                      |
| `DISTRIBUTOR` | 访问 `data` / `distributor` | 继续 `data`（可多 fork） | `source`               |
| `RAW`         | 访问 `source`               | 由用户自行消费           | `data` / `distributor` |

错误信息必须指名对面是谁，例如：

- `The request body has already been claimed by the distributor path.`
- `The request body has already been claimed by the native stream path.`

不要使用笼统的 `already consumed`：排障时需要看出是谁抢的。

## 必须接受的后果

### 1. 必须改成懒构造

当前 `INIT.DISTRIBUTOR()` 在 body 构造函数内执行，`UNCLAIMED` 状态不
存在。改造后：

- `Readable.toWeb(...)` 与 `new RequestBodyDistributor(...)` 挪到首次
  访问 `data` / `distributor` 时执行；
- `INIT.MAX_BODY_SIZE()` 一并挪入（它依赖 distributor 实例）；
- `INIT.READABLE_EVENT()` 可留在构造期：`end` / `close` / `error` 监听
  不会让 node 流进入 flowing。

### 2. attacher 永远赢

exchange attacher 在 handler 之前运行。任何插件在 attacher 里 fork 了
body，所有 handler 就永久失去 `RAW`。这是要暴露给团队的反模式代价，
文档必须写死。

## `RAW` 模式的损失清单

`RAW` 模式下框架不再提供：

- `MaxBodySize` 与 413（失去 metric 计数）；
- `limit` 事件；
- 多消费者 fork；
- ChunkStash 临时文件降级；
- 生命周期兜底：认领者必须消费完或 `destroy()`，否则连接挂着；
  exchange 超时只把状态改成 503，不会替调用方关流。

这张表应同步进 `DESIGN.md` 的 Request body 小节。

## 实现要点（文件级）

- `_Symbol.mjs`：新增私有 claim 状态字段，以及对外 `source` 的
  getter 所需符号。
- `_Abstract.mjs`：
  - 删除构造期的 distributor 初始化，改为按需；
  - `get data()` / `get distributor()` 前置认领检查；
  - 新增 `get source()`，复用已有的 `_I.SOURCE.GET`。
- `_S` / `_I` 不变；deployer（如 `deployer/http1/http`）无需任何改动。

## 测试清单

1. `UNCLAIMED -> data`：正常 fork，distributor 懒初始化。
2. `UNCLAIMED -> source`：拿到 node 流；`data` 抛错。
3. `data -> source`：抛错，错误信息含 distributor 路径。
4. `source -> data`：抛错，错误信息含 native 路径。
5. `data -> data`：多次 fork 仍可用。
6. 懒初始化后 `MaxBodySize` + 413 仍生效。
7. `RAW` 模式下 `http-request-body-data-{end,close,error}` 仍转发。
8. 收尾检查（若采纳）：`RAW` 未被消费完时给出诊断。

## 文档义务

- `DESIGN.md` Request body 小节：改成“两种消费模式”，加入状态机与
  损失清单。
- 插件作者的注意事项：在 attacher 中 fork body 会关闭 `RAW` 路径。

## 待定

- 成员名：`source` / `native` / `readable`（倾向 `source`，与
  `_I.SOURCE.GET` 一致）。
- 是否增加收尾检查：`RAW` 未消费完时在 finish 处给明确诊断（开发期
  友好，但引入新的失败面）。
- 错误域：普通 `Error`，还是专用错误类型。
- 是否在开发期对“插件 fork 后 handler 要 `RAW`”给出告警。

## 相关实测（决策背景）

来自 `logs/bench-sha.ign.mjs`（未入库）：

- `toWeb()` 每 chunk 复制字节，成本按字节计（约 8–10 GB/s）。
- distributor + fork 的边际成本约 **2.1–3.3 µs/chunk**，与 chunk 大小
  基本无关。
- 加 sha256 载荷后相对损失：`toWeb` +18%~34%，distributor 相对 node
  标准流 +35%~232%（小 chunk 最贵）。
- 结论：小 chunk 才是主要成本来源；`RAW` 的价值在于给极端场景一条
  明确出口，而不是普遍提速。

水标相关（来自 `logs/probe-hwm.ign.mjs`，未入库）：

- `http.createServer({ highWaterMark })` 只改
  `req.readableHighWaterMark`（16 KB → 256 KB 实测生效），**不改变
  chunk 大小**：1 MiB 请求体在两种设置下都是 32 段、单段最大 65440。
- chunk 边界由 TCP 到达节奏与 HTTP parser 决定，不是水标参数。
- `Readable.toWeb()` 在无人读取时会预拉 **2 个 chunk**。
- `net.Socket` 默认读写水标均为 16384。
