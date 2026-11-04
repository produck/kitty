# HTTP/2 Deployer 设计决策

## 范围

- `http/`：h2c，明文，仅 prior knowledge。
- `https/`：h2 over TLS，同时服务 HTTP/1.x 客户端（`allowHTTP1`）。
- 端口实现吃两种 `internal` 形状，按形状分派。

## 决策

1. **内核先 h2c，第一个发布 h2**。h2c 与 h2 的差别只有「socket 是否
   TLS」，用 h2c 起步可以免掉证书与 ALPN 的干扰，测试成本也低；但
   浏览器与主流客户端只走 TLS，所以对外先交付 h2。
2. **h2c 只做 prior knowledge**。RFC 7540 §3.2 的 HTTP/1.1
   `Upgrade: h2c` 不做：node 不提供支持，浏览器也从不使用。
3. **`allowHTTP1` 只在 TLS 下有效**。明文 `createServer` 加它不会降级：
   1.1 文本过不了 h2 前言校验，session 被直接销毁。所以 h2c 包不暴露
   该选项，暴露了就是一个永远不生效的开关。
4. **`https` 必须开 `allowHTTP1`**。`'stream'` 事件只对 h2 触发，1.1
   只进 `'request'`；只挂 `'stream'` 会让所有 1.1 客户端静默超时，
   而不是报错。完整的 h2 服务器必须两种客户端都能应答。
5. **不做 server 内省**。`server.allowHTTP1` 不存在；`Symbol(options)`
   里确实能读到用户传的值，但它只回答「配没配」，不回答「这条请求是
   什么」，还依赖 node 内部符号。判据用 `internal.stream !== undefined`。
6. **`'request'` 监听必须过滤 `httpVersion === '2.0'`**。实测：同时挂
   `'stream'` 与 `'request'` 时，h2 请求会两次进入派发
   （`stream` 与 `request v2.0` 各一次），不过滤就会重复处理同一 exchange。
7. **h2 侧不用 `Http2ServerRequest` / `Http2ServerResponse` 兼容层**。
   兼容层是静默降级：`connection` 头与 `statusMessage` 都「设置成功」
   却只留一条 `UnsupportedWarning`。1.1 侧走 `'request'` 拿到的原生
   http1 对象，不受此限制。
8. **原生 `'stream'` 模型**。h2 侧 `internal` 为
   `{ server, stream, headers }`，响应走 `stream.respond()`；1.1 侧为
   `{ server, req, res }`，响应走 `res`。两套都实现在同一份端口里。
9. **h2c 提供 `useHttp2Stream`**。返回 `ServerHttp2Stream` 并
   `claimRaw()`，与 distributor 路径互斥。h2 没有 `IncomingMessage`，
   所以不叫 `useHttp1Request`；`https` 包按协议给出 `useHttp1Request` /
   `useHttp2Stream` 两个出口。
10. **超时收尾用 `stream.close(NGHTTP2_CANCEL)`**，不能 destroy
    socket。一个 connection 上并发多条 stream，destroy 会打断同连接上
    所有其它请求。
11. **WebSocket 走 h2ws（RFC 8441 Extended CONNECT）**。h2ws 是 `ws`
    的 fork，公开 `handleConnect(stream, headers, cb)` 与 `noServer`，
    与现有「由 workflow 决定何时接受」的模型吻合；controller 契约
    （`acceptUpgrade` / `rejectUpgrade` / `send` / `close` /
    `readyState`）一行不改，只重写 deployer 侧三个实现。h2c 已落地，
    挂在 `./exchange/websocket` 子路径上，主入口不引 h2ws。
12. **`enableConnectProtocol` 由我们自己发**。h2ws 在 `{ server }`
    模式下挂 `session` 监听发送该 setting；用 `noServer` 就没有这段，
    必须在 server 构造或自己的 `'session'` 处理器里补上，否则带
    `:protocol` 的 CONNECT 不会到达。落地时由 deployer 的
    `'session'` 监听发送，并作为 `session-listener` 进 manifest。
13. **CONNECT 分派靠两个伪头**。h2ws 的 `isWebSocketConnect` 做的事
    太小，deployer 自己判 `:method === 'CONNECT'` 且
    `:protocol === 'websocket'`，避免主入口为了一个谓词引 h2ws。
    `https` 包因为挂了 `'request'` 监听器（1.1 回退），node 的
    compat 层会接管每个 stream：没有 `'connect'` 监听器时 CONNECT
    直接回 405。所以该包改从 `'connect'` 事件拿
    `response.stream` 与 `request.headers` 分派，`'stream'` 监听器
    对 CONNECT 一律跳过。h2c 不挂 `'request'`，compat 未启用，
    直接从 `'stream'` 分派即可。
14. **`https` 包的 WS 交换按版本路由**。与 `Exchange/Http.mjs` 同构：
    `Exchange/WebSocket/index.mjs` 把 `http1-http` 与 `http2-http` 的
    WS 选项按 `internal.stream` 有无合并，controller 五个端口全部走
    `VersionRoute`。两个包各自持有自己的 Bridge，所以不能只路由
    `handleUpgrade` 而不路由 `send` / `close` / `readyState`。
    1.1 侧从 `'upgrade'` 事件分派（`{ server, req, socket, head }`），
    h2 侧仍走 `'connect'`。
15. **客户端不得发 `sec-websocket-key`**。RFC 8441 禁止 connection
    专属头，h2ws 见到 `upgrade` / `connection` / `sec-websocket-key`
    直接回 400。握手只靠 `:protocol` + `sec-websocket-version`。
16. **不做 `protocol` / `extensions` 对外面**。h2ws 已经给了
    `ws.protocol`、`ws.extensions`，还有 `'headers'` 事件可改响应头；
    在没人需要之前不往公开面加槽位。
17. **`protocol` 报告值按包覆盖**：h2c 报 `'http:'`，h2 报 `'https:'`。
18. **请求体源要包一层**。`Readable.toWeb(ServerHttp2Stream)` 拿不到
    数据（直读 `for await` 正常），而工作流的 distributor 只吃 web
    stream。所以 h2 侧 `body.source` 返回
    `Readable.from(stream, { objectMode: false })`：`pipe(PassThrough)`
    和 `new Readable().wrap()` 也能跑，但都会立即开流，`Readable.from`
    是惰性的、按需拉取。1.1 侧直接给 `req`。
19. **`host` 回退到 `:authority`**。抽象层的 `request.url` 用 `host`
    头拼绝对 URL，而 h2 用 `:authority`（RFC 9113 §8.3.1 的等价物）。
    `header.get('host')` 在没有 `host` 时回退，`header.keys()` 仍只列
    真实头名（不合成 pseudo 头）。
20. **h2 响应状态自己存**。h2 没有可变的 status 对象，`:status` 只在
    `stream.respond()` 时一次性发出。所以状态与待发 headers 存在
    `Bridge` 的 `WeakMap<stream, response>` 里，写 body 时一并 respond。
    1.1 侧直接读写 `res`，不经过 Bridge。

## 精简依据

- **h2c 的 1.1 Upgrade**：放弃少数只支持 Upgrade 的老工具，因为 node
  不实现、浏览器不用。
- **h2c 的 `allowHTTP1`**：不是「暂不支持」，而是明文下 node 根本没
  实现 1.1 检测，开关无效。
- **h2 侧的兼容层 req/res**：放弃与 http1 同构的便利，因为它静默丢弃
  非法操作，失败不可见。1.1 侧天然就是原生对象，没有这个取舍。
- **`useHttp1Request`**：h2 没有 `IncomingMessage`，只能给假实现；
  改成语义成立的 `useHttp2Stream`。
- **server 内省**：能读 `Symbol(options).allowHTTP1`，但它答的是另一
  个问题，且依赖内部符号，被运行时形状分派替代。
- **server push / 子协议面**：放弃少数高级用法，因为公开面每加一个槽位
  都要长期维护。
- **WS over h2 的独立实现**：不做，h2ws 已兼顾 1.1 与 h2 两条通道。

判断标准是：**宁可少一个能力，也不要一个「看起来成功」的能力**。

## 实测记录（node 24.17）

```text
明文 createServer({ allowHTTP1: true })
  h2 prior knowledge -> 'request'，httpVersion '2.0'
  HTTP/1.1 客户端     -> HPE_INVALID_CONSTANT

TLS createSecureServer({ allowHTTP1: true }) 同时挂 'stream' 与 'request'
  h2  -> ['stream /h2', 'request v2.0 /h2']   （两次）
  1.1 -> ['request v1.1 /h1']                 （一次）
  只挂 'stream' 时 1.1 客户端无响应（超时）
  setHeader('connection')、statusMessage 均「成功」但被丢弃

请求体读取
  Readable.toWeb(ServerHttp2Stream)        -> 无数据，永远不结束
  Readable.from(stream, objectMode: false) -> 正常
  stream.pipe(new PassThrough())           -> 正常，但立即开流
```

## 待定

- `setStatus(code, text)` 的 `text` 在 h2 下如何处置：丢弃、还是沿用
  parser 约束？h2 无 reason phrase。
- h2ws 的版本策略：按 `^0.1.0` 使用，等它稳定后再考虑放宽。
- 测试端 WS 客户端：h2ws 删掉了 client，`ws` 的 `setSocket` 只服务
  服务端（`new WebSocket(null)` 会走 `_isServer`），所以 h2 侧测试
  自建帧编解码（客户端帧要加掩码）；1.1 侧直接用 `ws` 客户端。
- `useHttp1Request` / `useHttp2Stream` 是否加第二参 `claimRaw = true`：
  传 `false` 只取对象、不 `claimRaw()`，用于只读元信息（如
  `stream.session`）。一旦加上，README 必须写清风险：返回的是活对象，
  对它做 `for await` 或 `.on('data')` 会从 distributor 通道里抽走字节，
  得到短 body。
