# DEV

## 文档分工

- `DEV.md`：为什么这样写、已知风险与待解决问题。
- `DESIGN.md`：形状与契约（尚未建立）。
- 源码注释只留 `TODO` 与契约性说明。

## 目标

`@produck/kitty-plugin-network` 计划提供「入站对端网络信息」能力：对端
地址、端口、地址族，以及 TLS 相关事实（SNI、证书、cipher、ALPN）。

## 潜在问题：能力依赖具体 deployer

### 现状

workflow 层没有跨协议的对端信息访问器。目前能拿到 socket 的入口全在
deployer 包里，且每个包形态不同：

- `kitty-deployer-http1-http`
  - `inspectHttp1Request(Kit)` → `http.IncomingMessage`，socket 在
    `req.socket`
  - `useHttp1Request(Kit)` → 同上，但会 `claimRaw()`
- `kitty-deployer-http2-http`
  - `inspectHttp2Stream(Kit)` → `http2.Http2ServerRequest`，socket 在
    `req.socket` 或 `req.session.socket`
  - `useHttp2Stream(Kit)` → 同上，但会 `claimRaw()`
- `kitty-deployer-http1-https`
  - 重新导出 h1 的两个入口
  - socket 是 `TLSSocket`
- `kitty-deployer-http2-https`
  - 同时导出 h1/h2 两组入口，且带协议断言（版本不符即抛错）

TLS 事实已有 `useServername` / `useAuthorization` / `useCertificate` /
`useCipher` / `useAlpnProtocol`，但没有对端地址。

### 为什么会成为问题

1. **插件面向 workflow，能力却挂在 deployer 上。** 插件 `install` 拿到的
   是 workflow kit；要取 socket 必须先知道这次部署用的是哪个 deployer
   包，而 workflow 层没有「deployer 类型 → 适配器」的注册点。
2. **同一语义有四个入口。** h1/h2 × 明文/TLS，签名相近但不一致
   （http2 包会断言协议版本并抛错，http1 包不抛）。插件只能靠
   `Use.Exchange(Kit).httpVersion` 自行分支，且分支表会随 deployer 增加
   而膨胀。
3. **`body.source` 不是 raw 对象。** HTTP/2 下它是
   `Readable.from(stream)` 包装层，顺着它取不到 socket；要 socket 只能走
   `inspectHttp2Stream`。于是「读 body」与「取网络信息」在 h2 上分叉。
4. **`useHttp1Request` / `useHttp2Stream` 会抢 raw body**（`claimRaw()`）。
   插件若用它们取 socket，会打断业务侧读 body，必须改用 `inspect*`。
5. **TLS 事实的 socket 桥建立在 `request.body.source.get` 内。** 语义位置
   可疑：取证书与「读 body」这个访问器耦合。当前 handler 派发前框架已读
   过 source，所以 `useCertificate` 无需先读 body 也能工作
   （`http1/https` 用例可证），但这是**隐式顺序依赖**，不能当作长期契约。
6. **`identity` 不可用。** `EXCHANGE.$S.IDENTITY` 只用于部署去重（h1/h2
   恰好返回 raw req/stream），没有 `Use.*` 公开访问器。

### 待定

- 是否在 workflow 层引入对端信息契约（exchange 上增加只读访问器），把
  deployer 差异收进 `Implement.Exchange.*`。
- 或由插件在 `install` 时探测 server 类型，自建「deployer → 适配器」表。
- h2 的 socket 是连接级的：一个 session 一个 socket，多路复用共享，
  `remoteAddress` 只代表连接对端，不区分 stream。
