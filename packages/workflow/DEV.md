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

### 布局判据

判一个 subject 该放哪一层，只看四条，不靠"它算不算一种 X"。

- **构造点归属**：谁 `new` 它，它就在谁下面。判据是 `grep new`。
- **子树方向单调**：顶层子树之间的边只朝根（`CompoundWorkflow → Workflow`），
  反向不行；子树内部父子互指是正常的，父本来就要 `new` 子。全图必须无环。
- **类走 barrel，符号走 `_Borrow`**：跨 subject 取类走对方 `index.mjs` 的命名
  空间，取符号走 `_Borrow.mjs` 指向对方 `_Symbol.mjs`；子文件不直接写对方深路径。
- **barrel 形状**：subject 的 `index.mjs` 导出"实现类 + 全部子命名空间 + 叶子
  工具模块"，不导出 `_Symbol` / `_Borrow` / `_Concrete`。
- **parser 层层下发，消费方只看自己这层**：每个目录一个 `_Parser.mjs`，首行
  `export * from '../_Parser.mjs'`，再补本层自己的。需要 parser 的文件一律
  `import ... from './_Parser.mjs'`，不写 `../`。定义点取所有消费方与定义方的最近
  共同祖先，跨顶层子树就落到包根。`assert*` 与 parser 同住一个文件，区别只在是否
  把值返回。

判据沉默的情形：`DataNormalizer` 曾按 is-a 归在 `HttpExchange/Response/Body/`，
现在连同 `DataNormalizerRegistry` 一起停在 `legacy.ign/`——它们描述的是**一种**
归一化策略（插件协议 + 注册表 + first-match-wins），不是框架的契约。契约收敛成
`CompoundWorkflow` 的一个抽象成员，策略留给下游。

## 观点 / 决策

### Exchange 家族

三层，各自只回答自己那一层：

- 位置：`Workflow/Exchange/`（壳）、`CompoundWorkflow/HttpExchange/`、
  `CompoundWorkflow/WebSocketExchange/`（两个协议族）。
- 壳不认识任何工作流类型：`get workflow()` 走 `useWorkflow(this[$I.KIT])` 的
  capability 查找。往哪边分只是因为谁 dispatch 谁——壳归 `Workflow`（它的
  `Deployment` 要读 identity），协议族归 `CompoundWorkflow`（`Deployer` 按协议
  选构造器，且协议族要读复合工作流的 `STATE`）。
- `Implement/Exchange/` 是集成层用的打包入口，不是 subject。

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
  `HeaderValue`（两份 parser 都在 `Workflow/Exchange/_Parser.mjs`，跨目录消费的
  几个数值/方法 parser 在包根 `src/_Parser.mjs`）。
- `Request.get url()`：绝对 URL 直接用；相对 URL 用 `header.get('host')` +
  `exchange.protocol` 拼，缺 host 抛 `ThrowDeployer`。
- `Request.get body()` 按 `Configuration.Get.AllowedBodyMethods(workflow)` 设卡，逐次
  判定。
- 请求体：源侧收 node `Readable` → `Readable.toWeb()` → fugue distributor；`data`
  每次访问 fork 一份新的 WHATWG `ReadableStream`。`MaxBodySize` 走 `metric` 事件累
  加，超限 `destroy()` + `setStatus(413)`。
- 响应体是 sink：归一形状 `{ stream: ReadableStream | null, length: number | null }`
  （stream 为 `null` 时 length 必须为 `0`）。**归一化本身是工作流的抽象成员**，
  不是框架内置的插件体系：`_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA` 由实现者填，
  `$I.NORMALIZE_HTTP_RESPONSE_BODY_DATA` 是对内的调用面，body 的 `data` setter
  只调 `workflow[_A.$I.NORMALIZE_DATA]`。注册表、`test`/`normalize` 插件协议
  已整体停到 `legacy.ign/`，作为下游可以自己实现的一种方案。
- fugue 的 12 项选项由本包代理（PascalCase，
  `CompoundWorkflow/Configuration/items/distributor.mjs`），
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

### 事件

- 事件只承载**决策与生命周期**，不承载数据本身。数据走流；用事件再发一遍等于在流
  之外开第二条 IO 通道，下游会有两套读法与两套背压语义。
- 事件类型的数量不是成本，**契约**才是：类型是字符串匹配，改名或改判据后下游只是
  静默收不到，没有编译器兜底。新增前先问“能否由已有事件推导”。
- 每个事件必须能回答：谁发、何时发、载荷、顺序、次数。
- `Exchange` 三件套：`exchange-pipeline-done`（管线正常返回）、
  `exchange-pipeline-error`（管线抛出，`detail.error`，随后原样 rethrow）、
  `exchange-pipeline-finish`（**不分成败**，只表示没有后续可做）。`done` / `error`
  二选一先发，`finish` 永远最后且必定发生，三者恰好各一次。
- `finish` 发在 `finally` 里，它负责“恰好一次”这个保证。删掉它，收尾责任就落到每个
  deployer 身上，且 `HttpExchange` 的超时定时器会漏（每个未收尾的 exchange 泄漏一个
  timer）。
- 只在下游拿不到原对象时才转发事件：`request.body.distributor` 已原样暴露，故不转发
  fugue 的五个事件；node `readable` 被 `toWeb()` 封装后下游拿不到，所以 body 自己
  转发 `http-request-body-data-{end,close,error}`。
- **不包庇监听器异常**：node 把监听器抛错放到 `nextTick` 重抛，成为
  `uncaughtException`，此刻进程状态未定义，继续跑会把业务资产写坏。所以库不装全局
  `uncaughtException` 处理器，也不在 `dispatchEvent` 外包 `try/catch`——让它炸，交给
  进程管理器重启。正面副作用：异常在 `nextTick` 才抛，不打断我们正在执行的收尾，也
  不会覆盖管线原始异常（实测）。

### Workflow / CompoundWorkflow

- `Workflow` 只管管线：`use()` / `finalize()` / `PIPELINE`，加 `compile` / `deploy`
  两个骨架入口。它不装配置、不认识 `Configuration`。
- 抽象面只有 `_I.COMPOSE.EXTEND` 与 `_I.COMPILE_DEPLOYMENT`。
- 构造器只做一件事：把自己登记进 kit（`K_WORKFLOW = $(this)`）。
- `CompoundWorkflow` 的构造器在自己身上装配置：
  `Configuration.install(useWorkflow(kit))`——键取自 kit 里存的同一份 shadow，
  与 `Get.<键>(workflow)` 的查询键严格一致。非复合的派生类没有记录，读值直接抛。
  外部读值只走 `Get.<键>`，写入只走 `Tune.<键>`。
- `CompoundWorkflow` 是个**抽象类**，不是现成产品：它声明
  `_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA`，未实现就不能用；所以本包只导出
  `CompoundWorkflow.Abstract`，不导出任何可直接 `new` 的复合工作流。
- 它的私有 `STATE` 只记一个可变资源（`RequestBodyDistributor`），`finalize()` 之后
  仍可用 `setRequestBodyDistributorConstructor()` 更换。
- “必须有请求体分发器”的卡点在 `CompoundWorkflow` 的 `$I.DEPLOY` 覆写上，所以
  `compile()` 不受影响，`deploy()` 与 `withDeployer().deploy()` 两路都会过它。
- `[COMPILE_DEPLOYMENT]` 只做四件事：跑 mixin 的部署 attacher → 取部署器类 → 注册
  workflow 侧的 handler → `new` 部署器、`$I.INSTALL()`、`$I.COMPILE()` 封口。它不写
  任何 kit 端口，也不碰产物形状。

### Deployment

编译的产物是一个 subject（`Workflow/Deployment/`），不是一条记录。“缺一层抽象”的三条
证据：旧的 `{ listeners, link }` 让 `_I.COMPILE_DEPLOYMENT` 只能声明`returns(M.Object)`；`Deployer/Artifact.mjs`（已删）只能写一个没人调用的鸭子类型
谓词；生命周期散成一个局部布尔（`compiled`）加一个安装标记。

- 它拥有：`KIT`、`SERVER`、`MANIFEST`、`LINK_LIST`、附着器列表、去重集合、handler、
  `COMMITTED`、`LINKED`。
- 全部是私有槽；包内只通过保护级 getter 或方法读写，公开面只有 `manifest` 与
  `link()`。
- `link()` 自带一次性守卫（`LINKED`），并自己组合 linker 链；`COMMITTED` 只能由
  `$I.COMMIT()` 翻转。
- 收口叫 **commit** 不叫 compile：编译一次就是这个对象完成了定义，之后的写入一律拒绝；
  “compile” 在整个体系里已经指 workflow → deployment 这个动作。
- **派发属于它**：`$I.HANDLE_EXCHANGE(Exchange, internal)` 负责派生 ExchangeKit、构造、
  查重、exchange 附着器、跑 pipeline、`finally` 里发 `close`。它持有构造它的 workflow
  实例，但只读一个成员：`workflow[$I.PIPELINE]`（组合好的管道）。
- Workflow 上那个成员从 `$I.WORKFLOW` 改名为 `$I.PIPELINE`：它就是一个管道函数，
  `WORKFLOW` 这个名字只是在重复所属的 subject。
- 因为派发在里面，部署器不需要第三个构造参数：`handle*Exchange` 直接
  `deployment[$I.HANDLE_EXCHANGE](ExchangeClass, internal)`。
- 查重失败报中性错（`The Exchange has already been dispatched.`），不带
  `Bad deployer:` 前缀——Deployment 不能 import Deployer（会成环），归因信息是这条约
  束的代价。

### Deployer

**定义面是一个类，不是 options 记录**，并且是**实例级**抽象：下游可以持有生命周期接
近 workflow 实例的实例级上下文。旧写法把 `install` 做成记录上的一个函数，根本没有实
例可言——这是整次重构最根本的变动。

- `Deployer/Registry.mjs` / `Deployer/_Parser.mjs` 与部署器目录同级，都是非 subject 元素。
  `Implement/Exchange/` 与 `Workflow`、`CompoundWorkflow` 平级，因为它不依赖 Deployer、 只依赖
  协议族。
- 静态抽象（派生用 `static get`）：
  - `_S.TAG`（`M.String`）：部署器标签。
  - `_S.SERVER_CTOR`（`SubConstructorOf(net.Server)`）：注册表的键。
  - `_S.EXCHANGE_CTOR.HTTP`：**必选**，`M_Sub(HttpExchange.Abstract)`。基类不给默认
    值，所以缺了就是抽象层的 `must be implemented`，核心不另做存在性检查。
  - `_S.EXCHANGE_CTOR.WEB_SOCKET`：**可选**，成员类型是“子类或 `undefined`”：基类给
    一个返回 `undefined` 的默认 getter（避开抽象层的“未实现”判定），解析器放行
    `undefined`，其余值照样收紧到 `WebSocketExchange.Abstract`。入口只在读不到时抛
    `Deployer.Throw`。
- 实例抽象：`_I.INSTALL(DeployerKit)`——下游唯一的部署定义入口。
- 构造器收 `(DeployerKit, deployment)`：部署器**直接往 deployment 写**，自己不留产物
  状态。`SYMBOL.CONSTRUCTOR = new.target` 是本类读静态槽的唯一途径。
- 保护级：`$I.INSTALL()`（安装并置位）。
- 私有级：`I.KIT`、`I.DEPLOYMENT`、`I.ASSERT.NOT_COMMITTED`，以及 `I.ATTACH.*` 六个
  附着过程（`MANIFEST` / `SERVER_LINKER` / `EXCHANGE_ATTACHER` / `DEPLOYMENT` /
  `HANDLER.HTTP` / `HANDLER.WEB_SOCKET`）。
- **能力长在 kit 上，状态待在 deployment 里**：公开成员下游可覆盖（不安全），保护成
  员包外拿不到（不可用）；kit 不是类成员，两头都不犯。构造器把六个附着过程全挂上：
  `declare` / `setServerLinker` / `appendExchangeAttacher` /
  `attachDeployment` / `handleHttpExchange` / `handleWebSocketExchange`。
- **`DeployerKit` 的六个端口全部由部署器自己写**：其中三个（两个协议入口、
  `attachDeployment`）曾经由框架代挂，只因为它们当时需要 workflow 上下文；现在派发与
  内容存储都在 deployment 里，部署器手里已经有足够的东西。
- `attachDeployment` 写的是 `deployment[$I.KIT]`（部署端口本身），并用
  `deployment[$I.COMMITTED]` 卡窗口；`DependenceName` 来自包级 `src/_Parser.mjs`，因
  为它不再是 CompoundWorkflow 专有。
- **两个 exchange 的 `internal` 形状不同，协议因此必须在构造前决定**：HTTP 是连接期
  req/res 记录，WebSocket 是整条连接的控制侧记录，二者没有公共形状；而 `internal`
  的形状由部署器定、核心不解释，框架无从校验。单入口
  `handleExchange(TargetExchange, internal)` 把配对交给了调用方，配错也要等某个 part
  去读 `internal` 时才炸。按协议分叉后，配对变成一个具名事实写在端口上——这是唯一不
  需要框架理解形状就能表达它的办法。
- 反过来也不能退化成“构造完 exchange 再看 `mode`”再分派：`mode` 只有构造后才有，
  而构造必须先拿到对应形状的 `internal`。协议不能被“发现”，只能在入口分叉。
- **入口按协议分叉，派发归 Deployment**（`$I.HANDLE_EXCHANGE`）：入口只从部署器类取
  `_S.EXCHANGE_CTOR.*` 然后交给 deployment，换一个协议只多一个两行的入口。
- 去重集合是 Deployment 的字段：一次部署一个作用域。曾经挂在 workflow 实例上，会让同
  一 workflow 的两次部署共用一个集合——那是错的。
- 部署器**不维护自己的安装标记**：六个端口统一用 `I.ASSERT.NOT_COMMITTED`，读的是
  `deployment[$I.COMMITTED]`。这个状态本来就只有一个，两处各存一份只会出现
  “装了但未 commit”“commit 了但未装”这两种没人定义过的中间态。

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

### Implement/Exchange

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
- **slot**：`_S` 里一个键，值为类引用，语义是“下游在这里挂具体实现”；必选还是可选，
  由成员解析器是否接受 `undefined` 决定。
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
4. **两个 kit 入口对 `internal` 完全不校验**（连“必须是对象”都没有）；可选槽缺失也只
   能等调用入口才发现。
5. **`'close'` 事件没有文档化**：它只是 `Exchange` 清超时定时器的事实契约。
6. **`HttpExchange` 的超时只改状态**：不销毁请求体、没 `unref()`、也挡不住 handler
   已写入的状态被 503 覆盖。
7. **文档仍有旧形状**：`ARCHITECTURE.md` 的公开 API 表、`DESIGN.md` 若干表、
   `Workflow/Exchange/EXCHANGE.md`。
8. **`test/*.mjs` 是重构前的骨架**：import 已不存在的路径与 API。
9. **handler / kitty 两域尚无代码**：占位 workspace 只有 `package.json`。
