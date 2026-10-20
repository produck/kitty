# DEV

## 文档分工

- `DEV.md`：为什么这样写。只记**当前生效的决策**与其代价；被推翻的写法直接删除。
- `DESIGN.md` / `ARCHITECTURE.md` / `DEPLOYMENT.md`：对外形状与流程。
- `ATTACHMENT-PORTS.md`：kit 端口清单。
- 源码注释只留 `TODO` 与契约性说明。

## 架构基座

### 抽象层：@produck/es-abstract

- 声明面 `Abstract(cls, Abstract({...}), Abstract.Static({...}))`，契约用
  `Member as M`；实例成员、静态槽都是**访问时惰性校验**。抽象构造器不能直接 `new`。
- 声明了 `Abstract.Static({...})` 的类，其派生**必须经 `SubConstructorProxy` 构造**，
  否则构造期抛 `It MUST SubConstructorProxy("<name>").`。
- 构造体内的 `this` 是生实例，`new` 交出的是代理面；要把面交出去用
  `ShadowThis as $`。不写 `#` 私有字段——代理不认归属。

### 共享词汇：@produck/argot

- `Ow.Error.Common(...)` 抛 `Error`；`ThrowTypeError(path, expectation)` 抛类型错；
  `SYMBOL.CONSTRUCTOR` 是本仓捕获 `new.target` 的唯一写法。

### 附着与查找：@produck/kit

- `Kit(childName)` 每次新建代理、**不缓存**；读依赖先查自身、再沿父链。
- 同层重复写同名依赖抛错（不是覆盖）——所以每个 exchange 必须拿到一份新的 kit。
- 跨模块能力走 `Capability.mjs` 的 `K_*` 符号 + `Kit.Getter`：
  `K_WORKFLOW`、`K_DEPLOYMENT_SERVER`、`K_EXCHANGE`。

### Symbol 表约定

符号表、借用表的全部规则见 partial-constructor 规范（SYM / STB / BTB）；本仓没有增
补，也不复述。

### 私有槽 + 只读 getter

- 构造期赋值、之后不变的成员写成"类字段 `[X] = null` + 构造器赋值"；下游要读的配
  `get`，纯内部的只有槽。判据是**只读**，不是要不要暴露。

### 命名

- `new.target` 捕获的局部一律叫 `TargetConstructor`；`ctor` 只用于符号键。
- 具体基类不带 `Abstract` 前缀（`ExchangePart`）；`_Abstract.mjs` 里的类名带。

## 观点 / 决策

### Exchange 家族

三层，各自只回答自己那一层：

- `Exchange`：协议共用壳——`identity` / `server` / `protocol` / `mode` /
  `httpVersion` / `workflow` / `toJSON`，加 `request`（header / method / url）与
  `response`（statusCode / statusText / header / isFinished）。抽象成员
  `_I.IDENTITY.GET` / `_I.SERVER.GET` / `_I.SERVER.PROTOCOL.GET` /
  `_I.HTTP_VERSION` / `_I.MODE`；静态槽 `_S.REQUEST_CTOR` / `_S.RESPONSE_CTOR`。
- `HttpExchange`：只加两个 body（`HttpRequest` / `HttpResponse` 是薄类，body 在其
  内部）与 `[I.START_TIMING]`；`_I.MODE` 答 `'http'`。
- `WebSocketExchange`：**整条连接**，不是握手瞬间。`request` / `response` 只是握手
  留下的开场记录；主体是控制器 subject（`readyState` / `send` / `close`，事件
  `open` / `message` / `close` / `error` 不转发到 exchange）；`_I.MODE` 答
  `'websocket'`。
- 抽象成员下放到 part：`Exchange` 不再当成员总线。
- `Part` 是**具体**基类（`ExchangePart`），六个 part subject 继承它再各自抽象。
- `internal` 是部署器提供的连接期记录，形状由部署器定；它作为**抽象成员的第一个实
  参**下传，不挂 kit。
- 冻结落在具体实现点自己身上（构造器末尾 `Object.freeze(this)`），基类不自冻。

### Request / Response / Body

- Header 读松写紧：`_I.GET` 答 `HeaderValueOrUndefined`，写入预检用严格
  `HeaderValue`（两份 parser 都在 `Exchange/Parser.mjs`）。
- `Request.get url()`：绝对 URL 直接用；相对 URL 用 `header.get('host')` +
  `exchange.protocol` 拼，缺 host 抛 `ThrowDeployer`。
- `Request.get body()` 按 `Configuration.Get.AllowedBodyMethods(workflow)` 设卡，逐次
  判定。
- 请求体：源侧收 node `Readable` → `Readable.toWeb()` → fugue distributor；`data`
  每次访问 fork 一份新的 WHATWG `ReadableStream`。`MaxBodySize` 走 `metric` 事件累
  加，超限 `destroy()` + `setStatus(413)`。
- 响应体是 sink：归一形状 `{ stream: ReadableStream | null, length: number | null }`
  （stream 为 `null` 时 length 必须为 `0`）；`DataNormalizer` 是 subject，注册表挂在
  `Workflow` 的私有 `STATE` 里。
- fugue 的 12 项选项由本包代理（PascalCase，`Configuration/items/distributor.mjs`），
  初始值抄自 fugue。**Workflow 上维护的不是"随便可以被覆盖的默认值"，而是这一层对
  下游给出的基本期待**：workflow 级的下游（mixin、prefix handler 等）可以按它来写，
  不必各自 `Tune`；它在 Body 建 distributor 时应用一次。
- **逐 exchange 的差异由 handler 自己调整**：`request.body.distributor` 原样暴露给高
  级 handler，它们可以在 handler 里直接 `Tune`。框架不提供第二个配置入口，也不为已
  建好的 distributor 做变更追踪。
- **降级介质不由本包提供**：`Fugue.DegradedChunkReader` 的具体实现（落盘、临时文
  件、内存……）由集成层 `@produck/kitty` 定义 `Distributor` 子类时挂在
  `SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR` 上；本包不选默认，也不实现。
- 流收尾优先 `terminate()`（同步、只关门禁），不用 `destroy()`（会 error 掉已发出
  的副本并取消源）。

### Workflow / CompoundWorkflow

- 抽象面只有 `_I.COMPOSE.EXTEND` 与 `_I.COMPILE_ARTIFACT`。
- 构造器把面登记进 kit（`K_WORKFLOW = $(this)`），Configuration 装在
  `WeakMap<workflow, record>` 上；外部读值只走 `Get.<键>`。
- 私有 `STATE` 记录可变资源（`RequestBodyDistributor`、
  `responseBodyNormalizerRegistry`），键用字符串；`finalize()` 之后仍可用
  `setRequestBodyDistributorConstructor()` 更换。
- `[COMPILE_ARTIFACT]` 的流程：跑部署 attacher → 取部署器类 → 建 `DeployerKit` →
  `new` 部署器 → 挂两个框架侧 kit 能力 → `$I.INSTALL()` → 在这一侧 pick 产物形状
  （`{ listeners, link: compose(...) }` + `deepFreeze`）。

### Deployer

**定义面是一个类，不是 options 记录**，并且是**实例级**抽象：下游可以持有生命周期接
近 workflow 实例的实例级上下文。旧写法把 `install` 做成记录上的一个函数，根本没有实
例可言——这是整次重构最根本的变动。

- `Registry` / `Artifact` / `ExchangeImplement` 与部署器目录同级，都是非 subject 元
  素。
- 静态抽象（派生用 `static get`）：
  - `_S.NAME`（`M.String`）：部署器名字。
  - `_S.SERVER_CTOR`（`SubConstructorOf(net.Server)`）：注册表的键。
  - `_S.EXCHANGE_CTOR.HTTP` / `.WEBSOCKET`：分别收紧到 `HttpExchange.Abstract` /
    `WebSocketExchange.Abstract`。两个槽都可用 `in` 探测，**未提供不报错**——只供单
    一协议的部署器合法。
- 实例抽象：`_I.INSTALL(DeployerKit)`——下游唯一的部署定义入口。
- 保护级：`$I.INSTALL()`（安装并置位）、`$I.LISTENERS` / `$I.LINK_LIST`（产物素
  材）、`$I.ATTACH_EXCHANGE(ExchangeKit)`（应用自己的附着器）。
- 私有级：`I.KIT`、`I.EXCHANGE_ATTACHER_LIST`、`I.INSTALLED`、
  `I.ATTACH.{LISTENER,SERVER_LINKER,EXCHANGE_ATTACHER}`、
  `I.ASSERT.NOT_INSTALLED`。
- **能力长在 kit 上，状态待在实例里**：公开成员下游可覆盖（不安全），保护成员包外
  拿不到（不可用）；kit 不是类成员，两头都不犯。构造器把三个附着过程挂上去：
  `exportListener` / `setServerLinker` / `appendExchangeAttacher`。
- `handleExchange` 与 `attachDeployment` 由**框架**挂在同一个 kit 上：它们要
  workflow 管道、workflow 的 mixin 列表、以及 `DeploymentKit` 的写权限，而部署器只
  该看见 `DeployerKit`。
- 安装后定义面关闭：再写会抛 `Deployer has already been installed.`。

### Deployer 注册

- 注册表只存**类**：`registerDeployer(DeployerClass)`，键是
  `DeployerClass[_S.SERVER_CTOR]`。
- 唯一的显式断言是 `SubConstructorOf(Deployer)`（`assertDeployer`）：普通类读不到
  静态槽，不加这条会静默注册成 `undefined`。其余校验由读槽本身（抽象成员已实现 +
  `SubConstructorOf(net.Server)`）完成。
- `getByServer(server)` 先查一次性部署的关联表，再按
  `Object.getPrototypeOf(server).constructor` 查注册表。

### Adapter → Deployer 更名

抽象层的内涵是"对**部署阶段**的适配"，不是对协议的适配；叫 Adapter 会让人以为它适
配连接或消息。更名覆盖目录、`DeployerKit`、`registerDeployer`、`ThrowDeployer` /
`DeployerGuard`、包出口。

### ExchangeImplement

它是**打包的实现定义器**：一个入口交出一整套（Exchange + 各个 part）构造器，本身没有
“一个类一个 subject”的内涵。因此它按 LAY-5 **永远是非 subject 元素**，不是待办；把
它改成 subject 会把“成套交付”这件事拆散，反而违背它的职责。

- 两个入口：`Http(options)` / `WebSocket(options)`，各自只归一自己的选项组。
- `Normalize/` 按层切目录：`Base.mjs` 校验共性组，`Http.mjs` / `WebSocket.mjs` 追加
  各自新增的组。

### 依赖治理

`@produck/argot`、`@produck/compose`、`@produck/deep-freeze-enumerable`、
`@produck/es-abstract`、`@produck/es-abstract-member-constructor`、
`@produck/fugue`、`@produck/is-sub-constructor`、`@produck/kit`、`is-plain-object`。

## 术语

- **subject**：partial-constructor 规范里的一节一类一目录单位。
- **part**：`ExchangePart` 家族的实例（Request / Response / Header / Body）。
- **slot**：`_S` 里一个键，值为类引用，语义是"下游必须在这里挂具体实现"。
- **fork**：从 distributor 取一份从第 0 字节起的完整拷贝。
- **done / closed / destroyed**：数据到头 / 读取器被生命周期关闭 / 分发器销毁。
- **internal**：部署器提供的连接期业务对象记录；形状由部署器定，核心不解释。
- **identity**：每个 exchange 一个的原生对象，用于去重。
- **DeploymentKit**：`WorkflowKit('Kitty<Deployment>')`，一次部署一个。
- **DeployerKit**：`DeploymentKit('Kitty<Deployer>')`，交给部署器的能力载体。

## 暂缓 / 待定

1. **规范草案（`code-style/…/partial-constructor/README.md`）待修订**：`_Borrow.mjs`
   的转发形状、BTB-1 的措辞、"空表不建"、LAY-7 与共享具体基类的冲突、能力符号
   （`K_*`）该不该进 subject 的 `_Symbol.mjs`。
2. **`Workflow` 的抽象成员符号尚未按 PUB-2 开出去**（`Deployer` 已开）。
3. **`data` 是否缓存首次 fork 未定**：现在每次访问新 fork。
4. **`handleExchange` 对 `internal` 完全不校验**（连“必须是对象”都没有）。
5. **`'close'` 事件没有文档化**：它只是 `Exchange` 清超时定时器的事实契约。
6. **`HttpExchange` 的超时只改状态**：不销毁请求体、没 `unref()`、也挡不住 handler
   已写入的状态被 503 覆盖。
7. **文档仍有旧形状**：`ARCHITECTURE.md` 的公开 API 表、`DESIGN.md` 若干表、
   `Exchange/EXCHANGE.md`。
8. **`test/*.mjs` 是重构前的骨架**：import 已不存在的路径与 API。
9. **handler / kitty 两域尚无代码**：占位 workspace 只有 `package.json`。
