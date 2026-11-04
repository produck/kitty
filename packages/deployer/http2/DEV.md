# HTTP/2 Deployer 设计决策

## 范围

- `http/`：h2c，明文，仅 prior knowledge。
- `https/`：h2 over TLS，靠 ALPN 协商出 `h2`。
- 交换层共用一份端口实现；差异只有 server 构造方式与 `protocol`
  报告值。

## 决策

1. **内核先 h2c，第一个发布 h2**。h2c 与 h2 的差别只有「socket 是否
   TLS」，用 h2c 起步可以免掉证书与 ALPN 的干扰，测试成本也低；但
   浏览器与主流客户端只走 TLS，所以对外先交付 h2。
2. **h2c 只做 prior knowledge**。RFC 7540 §3.2 的 HTTP/1.1
   `Upgrade: h2c` 不做：node 不提供支持，浏览器也从不使用。这条边界
   写死，不留待办。
3. **`allowHTTP1` 只在 TLS 下有效**。实测明文 `createServer` 加
   `allowHTTP1: true` 后，HTTP/1.1 客户端拿到 `HPE_INVALID_CONSTANT`
   ——降级依赖 ALPN，明文没有协商通道。所以 h2c 包不暴露该选项。
4. **第一版不支持 `allowHTTP1`**。实测：`'stream'` 事件只对 h2 触发，
   1.1 请求只进 `'request'`。只挂 `'stream'` 的 deployer 在混合模式下
   会让所有 1.1 客户端静默超时，而不是报错。
5. **不用 `Http2ServerRequest` / `Http2ServerResponse` 兼容层**。实测
   兼容层是静默降级：`setHeader('connection', ...)` 与
   `statusMessage = ...` 都返回成功，值被丢弃，只留
   `UnsupportedWarning`。这类「看起来生效、实际无效」的失败最难排查。
6. **原生 `'stream'` 模型**。`internal` 为 `{ server, stream, headers }`，
   响应走 `stream.respond()` / `additionalHeaders()` / `end()`。
   代价是 `Base.mjs` 那套访问器要整体重写，换来与 HTTP/2 语义对齐。
7. **不提供 `useRawRequest` / `claimRaw`**。h2 没有
   `IncomingMessage` 对应物，兼容层下的 `req.socket` 还是 proxy。
   提供一个语义不成立的出口，比没有更糟。
8. **超时收尾用 `stream.close(NGHTTP2_CANCEL)`**，不能 destroy
   socket。一个 connection 上并发多条 stream，destroy 会打断同连接上
   所有其它请求。
9. **WebSocket 走 h2ws（RFC 8441 Extended CONNECT）**。h2ws 是 `ws`
   的 fork，公开 `handleConnect(stream, headers, cb)` 与 `noServer`，
   与现有「由 workflow 决定何时接受」的模型吻合；controller 契约
   （`acceptUpgrade` / `rejectUpgrade` / `send` / `close` /
   `readyState`）一行不改，只重写 deployer 侧三个实现。
10. **`enableConnectProtocol` 由我们自己发**。h2ws 在 `{ server }`
    模式下挂 `session` 监听发送该 setting；用 `noServer` 就没有这段，
    必须在 server 构造或自己的 `'session'` 处理器里补上，否则带
    `:protocol` 的 CONNECT 不会到达。
11. **不做 `protocol` / `extensions` 对外面**。h2ws 已经给了
    `ws.protocol`、`ws.extensions`，还有 `'headers'` 事件可改响应头；
    在没人需要之前不往公开面加槽位。
12. **`protocol` 报告值按包覆盖**：h2c 报 `'http:'`，h2 报 `'https:'`，
    手法与 http1-https 一致（覆盖 `server.protocol.get`）。
13. **请求体源要包一层**。`Readable.toWeb(ServerHttp2Stream)` 拿不到
    数据（直读 `for await` 正常），而工作流的 distributor 只吃 web
    stream。所以 `body.source` 返回
    `Readable.from(stream, { objectMode: false })`：`pipe(PassThrough)`
    和 `new Readable().wrap()` 也能跑，但都会立即开流，`Readable.from`
    是惰性的、按需拉取。
14. **`host` 回退到 `:authority`**。抽象层的 `request.url` 用 `host`
    头拼绝对 URL，而 h2 用 `:authority`（RFC 9113 §8.3.1 的等价物）。
    `header.get('host')` 在没有 `host` 时回退，`header.keys()` 仍只列
    真实头名（不合成 pseudo 头）。
15. **响应状态自己存**。h2 没有可变的 status 对象，`:status` 只在
    `stream.respond()` 时一次性发出。所以状态与待发 headers 存在
    `Bridge` 的 `WeakMap<stream, response>` 里，写 body 时一并 respond。

## 精简依据

砍掉的每一项都对应一个「能力 vs 代价」判断：

- **h2c 的 1.1 Upgrade**：放弃少数只支持 Upgrade 的老工具，因为 node
  不实现、浏览器不用。
- **`allowHTTP1`（首版）**：放弃迁移期需要 1.1 兜底的场景，因为
  `'stream'` 不覆盖 1.1，混合模式下是静默超时。
- **兼容层 req/res**：放弃与 http1 `Base.mjs` 同构的便利，因为它静默
  丢弃非法操作，失败不可见。
- **`useRawRequest`**：放弃读原生 request 的能力，因为 h2 没有对应物，
  只能给假实现。
- **server push / 子协议面**：放弃少数高级用法，因为公开面每加一个槽位
  都要长期维护。
- **WS over h2 的独立实现**：不做，h2ws 已兼顾 1.1 与 h2 两条通道。

判断标准是：**宁可少一个能力，也不要一个「看起来成功」的能力**。

## 实测记录（node 24.17）

```text
明文 createServer({ allowHTTP1: true })
  h2 prior knowledge -> 'request'，httpVersion '2.0'
  HTTP/1.1 客户端     -> HPE_INVALID_CONSTANT

TLS createSecureServer({ allowHTTP1: true })
  h2  -> 'request'，httpVersion '2.0'，socket = bound TLSSocket
  1.1 -> 'request'，httpVersion '1.1'，socket = TLSSocket
  只挂 'stream' 时 1.1 客户端无响应（超时）
  setHeader('connection')、statusMessage 均「成功」但被丢弃

请求体读取
  Readable.toWeb(ServerHttp2Stream)   -> 无数据，永远不结束
  Readable.from(stream, objectMode: false) -> 正常
  stream.pipe(new PassThrough())      -> 正常，但立即开流
```

## 待定

- `setStatus(code, text)` 的 `text` 在 h2 下如何处置：丢弃、还是沿用
  parser 约束？h2 无 reason phrase。
- h2ws 的版本策略：锁精确版本，还是等它稳定后再放开。
- 测试端的 WS 客户端：h2ws 删掉了 client，需要自建
  （`http2.connect` 拿 Duplex + `ws.setSocket`）。
