# DEV

## 文档分工

- `DEV.md`：为什么这样写。只记**当前生效的决策**与其代价；被推翻的写法直接删除。
- `DESIGN.md`：记形状与契约。
- 源码注释只留 `TODO` 与契约性说明。

## deployer 继承的契约层缺口

### 现状

部署器的定义面是 `_I.INSTALL(DeployerKit)`。派生部署器覆写它，就在
同一个 `Deployment` 上叠加定义。当前三处结构写入各自独立：

| 端口                            | 落点                                     | 叠加语义                               |
| ------------------------------- | ---------------------------------------- | -------------------------------------- |
| `declare(name, value)`          | `deployment[I.MANIFEST][name] = value`   | **后写覆盖，静默**                     |
| `setServerLinker(link)`         | `LINK_LIST.unshift(link)`                | LIFO 栈，`compose` 串起来              |
| `attachDeployment(name, value)` | `deployment[I.DEPLOYMENT][name] = value` | **后写覆盖，静默（kit 自身会拒同名）** |
| `appendExchangeAttacher(fn)`    | 数组 push                                | 按注册顺序执行                         |

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

1. **ws exchange 独立成包**，`ws` 依赖只落在该包（暂名
   `@produck/kitty-exchange-websocket`）。`@produck/kitty-deployer-http1-http`
   保持零 ws 依赖。
2. **deployer 通过派生装载 exchange，不写可变静态字段**。静态槽是类
   自身属性，直接赋值会变成进程级全局状态，并让测试互相污染。派生出的
   子类才是组装结果的载体。
3. **`upgrade` 事件的接线点留在 deployer**。握手的传输层归属不随
   exchange 外挂而转移；exchange 只负责握手判定与消息。
4. **`declare` 条件执行**。没装 ws exchange 时不声明 `upgrade-listener`，
   因此 HTTP-only 部署的 manifest 里不会出现无关材料。
5. **官方实现以身作则：基于实现器派生，不直接 extends 抽象类**。
   ws exchange 用 `Implement.Exchange.WebSocket(options)` 生成；
   deployer 用 `Implement.Deployer({ ... })` 再派生一次。

### 装配形状

```js
import Deployer from '@produck/kitty-deployer-http1-http';
import { Exchange as WebSocketExchange } from '@produck/kitty-exchange-websocket';

registerDeployer(Deployer.withWebSocket(WebSocketExchange));
```

`withWebSocket` 由 deployer 包导出（方案 A），内部是
`Implement.Deployer({ ...baseOptions, exchange: { http, webSocket } })`。
用户不需要知道 `Implement` 的存在，也不需要复制 `install` 里的 listener
与 linker 逻辑；代价是 deployer 包要对外提供一个工厂，并引用
`WebSocketExchange` 的类型（不引用 `ws`）。

### 前置：核心层要补的可观察机制

`withWebSocket` 与条件 `declare` 都要求能回答“当前这个部署器是否装了
ws exchange”。目前 `install` 只是普通函数，拿不到 `this`，而静态槽只有
类自身可读。所以先要在核心层补一组对 deployer 类与实例的观察手段，至少
要能：

- 从 `install` 的上下文读取当前部署器类的 exchange 槽；
- 判断 WebSocket 槽是否为 `undefined`，而不是等待
  `handleWebSocketExchange` 抛错。

具体形状未定（是否经由 `DeployerKit` 暴露、是否作为 `install` 的额外
参数）。**在它落地之前不动 deployer 与 exchange 包的代码**，避免两套
判断并存。

### 不做

- 不引入通用 MessageExchange 抽象。第二种长连接协议出现之前不为
  “可能的复用”付出抽象成本。
- 不让 `ws` 进入核心包或 `http1-http` 包的依赖。
- 不把 ws 的策略（心跳、重连、广播、鉴权）放进 exchange。exchange 只
  封装协议，不封装策略。
