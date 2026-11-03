# DEV

## 文档分工

- `DEV.md`：为什么这样写。只记**当前生效的决策**与其代价；被推翻的写法直接删除。
- `DESIGN.md`：记形状与契约。
- 源码注释只留 `TODO` 与契约性说明。

## deployer 继承的契约层缺口

### 现状

部署器的定义面是 `_I.INSTALL(DeployerKit)`。派生部署器覆写它，就在
同一个 `Deployment` 上叠加定义。当前三处结构写入各自独立：

| 端口                             | 落点                                     | 叠加语义                               |
| -------------------------------- | ---------------------------------------- | -------------------------------------- |
| `declareToManifest(name, value)` | `deployment[I.MANIFEST][name] = value`   | **后写覆盖，静默**                     |
| `setServerLinker(link)`          | `LINK_LIST.unshift(link)`                | LIFO 栈，`compose` 串起来              |
| `attachDeployment(name, value)`  | `deployment[I.DEPLOYMENT][name] = value` | **后写覆盖，静默（kit 自身会拒同名）** |
| `appendExchangeAttacher(fn)`     | 数组 push                                | 按注册顺序执行                         |

`linker` 与 `attacher` 是**可叠加列表**，`declare` 与
`attachDeployment` 是**单值槽**。覆盖在单值槽上是静默的：两个派生层
声明同名材料，后装的那层赢，先装的那层不会收到任何提示。

### 为什么会成为问题

装饰部署器（同一 server 构造器挂多层）一旦成立，不同层往往由不同
作者、在不同包里写。它们对同一份 `manifest` 的约定是**隐式**的：

- 没有任何机制声明“这个材料名归我”；
- 没有冲突检测，冲突表现为**运行时少了一个材料**，而不是启动期报错；
- 材料值的形状由声明方自行决定，消费方（运行 server 的那一端）只能
  靠约定读取。

`DESIGN.md` 已经把“装饰部署器”写成既成事实（`append` 的选择理由就是
“装饰链上多层共存”），而 `Deployer.Registry` 目前的实现却是
`Map<ServerCtor, DeployerClass>`，同名注册直接抛错。文档与实现的方向
相反，`declare` 的协调能力是其中最短的一环。

### 待定

1. **同名冲突的判据**：是“同名即错”（与 kit 的同名依赖规则一致），
   还是“允许同名，由后装者声明自己是替换”？
2. **材料归属**：`declare` 是否要求声明方给出自己的身份（部署器类或
   tag），以便冲突时能说出“谁和谁撞了”。
3. **`manifest` 的消费契约**：目前 `manifest` 是一个无约束的普通对象，
   值由声明方定义。若要多层共存，可能需要在 manifest 上引入一组
   **命名材料类型**（`listener` / `linker` / 数据），否则消费方无法
   判断自己拿到的是什么。
4. **`attachDeployment` 与 `declare` 的边界**：两者都能放“材料”，
   区别只在落点（kit 还是 manifest）。哪些东西该走哪一边，目前没有
   判据。

### 不做什么

- 不为了这一条改动而引入新概念（不引入 capability 注册表、不引入
  装饰元数据对象）。
- 在上面的问题有结论之前，`declare` 保持单值覆盖，不做静默容错。

## 交换超时的归属

`MaxExchangeTimeout` 目前是 `Configuration` 的 core 项，由
`HttpExchange` 在构造期武装、在 `exchange-pipeline-finish` 清除。这条
把它放在 core 的判据是“防止 handler 挂死”，但它同时决定了长响应
（SSE、流式下载）的存活上限。

**决定**：超时未来会单独形成一个 plugin。core 只保留“派发与收尾”的
骨架，超时属于应用策略，应由 plugin 通过 `appendExchangeAttacher`
挂到 exchange 上，并通过自己的 `tune*` 暴露参数。

后果：

- core 的 `Configuration` 将不再包含 `MaxExchangeTimeout`；
- SSE 与流式响应不再需要“把超时设为 0”这类绕法，而是根本不装这个
  plugin；
- `HttpExchange` 的 `[I.START_TIMING]` 与 `Event.Timeout` 一并迁出。

在此之前不动代码，避免迁移期两套超时并存。

## ws 的可选性

### 定位

ws 在核心层是**抽象**，不是概念：核心只有 `WebSocketExchange.Abstract`
与 `_S.EXCHANGE_CTOR.WEB_SOCKET` 这组槽位，不知道协议名、不知道握手
细节。下游注册一个 ws exchange 等价于**打开一个开关**，而不是往核心里
引入一个新概念。

### 决定

1. **ws exchange 住在 `http1-http`，用子导出隔开**。`ws` 是
   `peerDependencies` + `devDependencies`，只有引用
   `./exchange/websocket` 子路径的使用者才会加载它。主入口不 import
   `ws`。
2. **deployer 通过派生装载 exchange，不写可变静态字段**。静态槽是类
   自身属性，直接赋值会变成进程级全局状态，并让测试互相污染。派生出的
   子类才是组装结果的载体。
3. **握手由 controller 完成，不由 deployer 代劳**。`upgrade` 事件给的
   原生 socket 在 `acceptUpgrade()` 里换成 `ws` 客户端；deployer 只负
   责把 `{ server, req, socket, head }` 交进
   `handleWebSocketExchange`，不知道 `ws` 存在。
4. **`declare` 条件执行**。没装 ws exchange 时不声明 `upgrade-listener`，
   因此 HTTP-only 部署的 manifest 里不会出现无关材料。
5. **官方实现以身作则：基于实现器派生，不直接 extends 抽象类**。
   ws exchange 用 `Implement.Exchange.WebSocket(options)` 生成；
   deployer 用 `Implement.Deployer({ ... })` 再派生一次。
6. **`WebSocketServer` 按部署懒创建**。`ws` 只在
   `./exchange/websocket` 子导出里；用 `WeakMap` 以 http server 为键
   懒建实例，避免模块级单例让 `clients` 跨部署可见；实例随部署对象一
   起被回收，不需要额外关闭钩子。
7. **`response` 归 `HttpExchange`，不进通用 `Exchange`**。
   `statusCode` / `statusText` / `setStatus` / `isFinished` 都是 HTTP
   概念；通用 `Exchange` 只保留 `request`。`K_RESPONSE` 随之从
   `Workflow/Exchange` 迁到 `CompoundWorkflow/HttpExchange`，
   `useResponse` 也只对 http exchange kit 成立。ws exchange 因此没有
   response 成员。
8. **未了结的连接不是核心的责任**。`acceptUpgrade()` 与
   `rejectUpgrade()` 都不调时，原生 socket 会一直挂着（不写响应、不
   destroy、没有超时），核心不介入 —— 收尾是下游的事。默认行为不变；
   想要反过来，用 `AutoAcceptUpgrade` 配置项（见下节）。

### 握手的挂点

握手不由核心发起。`WebSocketExchange` 构造时只建 controller 并挂到
exchange kit 上，真正的握手由 handler 主动调 `controller.acceptUpgrade()`。
这与 `ws` 的 `noServer` 模式一致：是否接受连接是用户的选择，不是核心
的默认。

想要「创建即握手」，把 `AutoAcceptUpgrade` 配成 `true`：`WebSocketExchange`
构造末尾、controller 挂上 kit 之后立即调一次 `acceptUpgrade()`，handler
拿到的就是已握手的连接，此时再调 `acceptUpgrade()` 会抛错。默认关闭。

`WebSocketController` 上的成员：

| 成员                                      | 级别 | 说明                   |
| ----------------------------------------- | ---- | ---------------------- |
| `upgraded`                                | 公开 | 是否已接受握手         |
| `acceptUpgrade()`                         | 公开 | 完成握手，只允许调一次 |
| `rejectUpgrade(status = 400, reason)`     | 公开 | 以 HTTP 错误状态拒绝   |
| `_I.HANDLE_UPGRADE` / `_I.REJECT_UPGRADE` | 抽象 | 实现器提供             |
| `readyState`/`send`/`close`               | 公开 | 未握手时一律抛错       |

`status` 限 400..599，`reason` 不得含 CR/LF（要拼进 body）；两者都有
默认值，`reason` 省略时取标准短语。没有只放行 4xx：`ws` 自己在收到非法
握手时用 400/401/405，而在关停期间用 503，5xx 同样是合法的拒绝。
`reason` 是语义标签，不带 HTTP 状态 —— 状态本来就在调用方手里。

`acceptUpgrade()` 与 `rejectUpgrade()` 互斥，二者合起来只允许发生
一次；任一发生后另一就抛错。拒绝由实现器写响应并结束连接，客户端拿到
的是一个普通 4xx，而不是“连上又被踢”。官方实现照 `ws` 私有的
`abortHandshake` 对齐：状态行用标准短语（`HTTP/1.1 403 Forbidden`），
`reason` 进 body，响应 `Connection: close`，并在 `finish` 后
`socket.destroy()`。

`ws` 的 `handleUpgrade(req, socket, head, cb)` 同步调用 `cb`，因此
`_I.INSTALL` 不需要异步契约，也不必改成 `void | Promise<void>`。异常
从 `controller.acceptUpgrade()` 直接抛给调用它的 handler，核心不吞、
不兜底。

管线结束不是连接结束的信号：`acceptUpgrade()` 之后 ws 的生命周期完全
归用户（消息、事件、关闭都由用户处理），核心不再介入。没调
`acceptUpgrade()` 的连接也不会被核心关闭。

### 事件派发

controller 是 `EventTarget`，三个入站事件由 `Controller/Notifier` 送回
来。notifier 由核心创建、随 context 交给实现器：

| 监听器 getter                   | 事件      |
| ------------------------------- | --------- |
| `notifier.message(data, isBin)` | `message` |
| `notifier.close(code, reason)`  | `close`   |
| `notifier.error(error)`         | `error`   |

上下文（`I.CONTEXT`）形状是 `{ internal, notifier }`，所有抽象槽都以它
作第一个参数；`Implement` 层再补上 `self`。事件对象由核心构造、由核心
派发，实现器只负责转发。官方实现在 `handleUpgrade` 的 ws 回调里挂
`ws.on('message')` / `ws.on('close')` / `ws.on('error')`，直接把
`notifier.*` 当监听器用 —— getter 返回的是稳定引用，`on` 与 `off` 都
成立。

`open` 不派发 —— 服务端连接在 upgrade 完成那一刻就已经打开。

`controller.closed` 是同一事件的 Promise 形式：构造时建好（引用稳定），
`close` 事件一到就 settle 成 `{ code, reason }`。被拒绝的握手没有关闭
帧，也会立即 settle 成 `{ code: null, reason: 'handshake rejected' }`，不
至于让 `await` 挂死。它不会 reject —— 失败通道是 `error` 事件。

### 装配形状

```js
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Ws from '@produck/kitty-deployer-http1-http/exchange/websocket';

const Base = Http1Http.Deployer.Http1HttpDeployer;
const Deployer = Base.withWebSocketExchange(Ws.Exchange);

Workflow.registerDeployer(Deployer);
```

### 不做

- 不引入通用 MessageExchange 抽象。第二种长连接协议出现之前不为
  “可能的复用”付出抽象成本。
- 不把 ws 的策略（心跳、重连、广播、鉴权）放进 exchange。exchange 只
  封装协议，不封装策略。
